import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { decode as base64Decode } from 'base-64';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { postJSON } from '../utils/api';

// Ensure the browser is closed correctly on web/Android after redirect
WebBrowser.maybeCompleteAuthSession();

const AUTH0 = {
  domain: 'dev-ydl81668b887kqqx.us.auth0.com',
  clientId: 'kNXBPgHkHo7nYCOHUOgOFxnOt27C353y',
  audience: 'https://foodlytics/api/v1/auth',
  scheme: 'foodlytics',
  callbackPath: 'callback',
};

const API_URL = 'https://foodlytics-api-production.up.railway.app';

const TOKEN_KEY = '@foodlytics:access_token';
const IDTOKEN_KEY = '@foodlytics:id_token';
const SESSION_KEY = '@foodlytics:session';

export type UserProfile = {
  id?: string;
  email?: string;
  heightCm?: number;
  weightKg?: number;
  // add other fields your backend returns
  [k: string]: any;
};

type SessionState = {
  loading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  idToken: string | null;
  email?: string;
  roles?: string[];
  sub?: string;
  user: UserProfile | null;
};

type SessionActions = {
  login: (opts?: { screenHint?: 'signup' | 'login' }) => Promise<void>;
  signOut: () => Promise<void>;
  setUserProfile: (u: Partial<UserProfile>) => Promise<void>;
};

type StoredSession = {
  email?: string;
  roles?: string[];
  sub?: string;
  user?: UserProfile | null;
};

const SessionContext = createContext<[SessionState, SessionActions] | undefined>(undefined);

const initialState: SessionState = {
  loading: true,
  isAuthenticated: false,
  accessToken: null,
  idToken: null,
  email: undefined,
  roles: [],
  sub: undefined,
  user: null,
};

function decodeJwt(token: string) {
  const parts = token.split('.');
  if (parts.length < 2) throw new Error('Invalid token');
  const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const pad = payload.length % 4;
  const base64 = payload + (pad ? '='.repeat(4 - pad) : '');
  const decoded = base64Decode(base64);
  return JSON.parse(decoded);
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>(initialState);

  const discovery = useMemo(
    () => ({
      authorizationEndpoint: `https://${AUTH0.domain}/authorize`,
      tokenEndpoint: `https://${AUTH0.domain}/oauth/token`,
    }),
    []
  );

  const executionEnvironment = Constants.executionEnvironment;
  const isExpoGo = executionEnvironment === ExecutionEnvironment.StoreClient;

  const { redirectUri, useProxy } = useMemo(() => {
    const usingProxy = false; // Expo Go is unsupported for this Auth0 SDK; custom dev/eas only
    const uri =
      AuthSession.makeRedirectUri({
        useProxy: usingProxy,
        scheme: AUTH0.scheme,
        path: AUTH0.callbackPath,
      }) || `${AUTH0.scheme}://${AUTH0.callbackPath}`;

    console.log('Auth redirect config', {
      redirectUri: uri,
      useProxy: usingProxy,
      executionEnvironment,
      isExpoGo,
    });
    if (isExpoGo) {
      console.log(
        '⚠️ Expo Go detected. Auth0 SDK requires custom dev client / EAS build. Build with "npx expo run:ios" or EAS.'
      );
    }

    return { redirectUri: uri, useProxy: usingProxy };
  }, [executionEnvironment, isExpoGo]);


  const persistSession = useCallback(async (payload: SessionState) => {
    try {
      if (payload.accessToken) {
        await SecureStore.setItemAsync(TOKEN_KEY, payload.accessToken);
      }
      if (payload.idToken) {
        await SecureStore.setItemAsync(IDTOKEN_KEY, payload.idToken);
      } else {
        await SecureStore.deleteItemAsync(IDTOKEN_KEY);
      }
      const toStore: StoredSession = {
        email: payload.email,
        roles: payload.roles || [],
        sub: payload.sub,
        user: payload.user,
      };
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(toStore));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('persistSession error', e);
    }
  }, []);

  const clearPersistedSession = useCallback(async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEY),
        SecureStore.deleteItemAsync(IDTOKEN_KEY),
        AsyncStorage.removeItem(SESSION_KEY),
      ]);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('clearPersistedSession error', e);
    }
  }, []);

  const syncUserWithBackend = useCallback(
    async (accessToken: string) => {
      try {
        return await postJSON('/api/v1/users-sync/sync', {}, { baseUrl: API_URL, token: accessToken });
      } catch (err: any) {
        if (err?.status === 401 || err?.status === 403) {
          await clearPersistedSession();
          setState({ ...initialState, loading: false });
          throw new Error('Sesión expirada, vuelve a iniciar sesión.');
        }
        throw err;
      }
    },
    [clearPersistedSession]
  );

  const handleAuthSuccess = useCallback(
    async (code: string, codeVerifier: string) => {
      console.log('exchangeCodeAsync start', { redirectUri, hasCode: !!code });
      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId: AUTH0.clientId,
          code,
          redirectUri,
          extraParams: {
            code_verifier: codeVerifier,
            audience: AUTH0.audience,
          },
        },
        discovery
      ).catch((err: any) => {
        console.log('exchangeCodeAsync error', {
          message: err?.message,
          status: err?.response?.status,
          body: err?.response?.body,
        });
        throw err;
      });

      const accessToken = (tokenResult as any).accessToken || (tokenResult as any).access_token;
      const idToken = (tokenResult as any).idToken || (tokenResult as any).id_token || null;
      if (!accessToken) {
        throw new Error('No se recibió access_token');
      }

      const claims = decodeJwt(accessToken);
      const email = claims['https://foodlytics.app/email'] || claims.email;
      const roles = claims['https://foodlytics.app/roles'] || claims.roles || [];
      const sub = claims.sub;

      let syncedProfile: any = null;
      try {
        syncedProfile = await syncUserWithBackend(accessToken);
      } catch (err: any) {
        Alert.alert('No se pudo sincronizar tu cuenta', err?.message || 'Inténtalo de nuevo.');
        if (err?.message?.toLowerCase().includes('expirada')) {
          throw err;
        }
      }

      const user: UserProfile | null = syncedProfile
        ? {
          id: syncedProfile.user_id || syncedProfile.id,
          email: email || syncedProfile.email,
          ...syncedProfile,
        }
        : email
          ? { email }
          : null;

      const nextState: SessionState = {
        loading: false,
        isAuthenticated: true,
        accessToken,
        idToken,
        email,
        roles: Array.isArray(roles) ? roles : roles ? [roles] : [],
        sub,
        user,
      };

      setState(nextState);
      await persistSession(nextState);
    },
    [discovery, persistSession, redirectUri, syncUserWithBackend]
  );

  const login = useCallback(
    async (opts?: { screenHint?: 'signup' | 'login' }) => {
      if (isExpoGo) {
        const msg = 'Auth0 login no es compatible con Expo Go. Usa un custom dev client (npx expo run) o build EAS.';
        console.log('login blocked on Expo Go', { executionEnvironment, isExpoGo, redirectUri, useProxy });
        Alert.alert('Auth no disponible en Expo Go', msg);
        throw new Error(msg);
      }

      const request = new AuthSession.AuthRequest({
        responseType: AuthSession.ResponseType.Code,
        clientId: AUTH0.clientId,
        redirectUri,
        usePKCE: true,
        scopes: ['openid', 'profile', 'email'],
        extraParams: {
          audience: AUTH0.audience,
          ...(opts?.screenHint ? { screen_hint: opts.screenHint } : {}),
        },
      });

      try {
        console.log('promptAsync start', {
          redirectUri,
          requestRedirectUri: request.redirectUri,
          state: request.state,
          codeVerifier: !!request.codeVerifier,
          useProxy,
          executionEnvironment,
          isExpoGo,
          screenHint: opts?.screenHint,
        });
        const result = await request.promptAsync(discovery, { useProxy });
        console.log('promptAsync result', {
          type: result.type,
          params: result.params,
          error: (result as any).error,
          url: result.url,
          redirectUri,
          requestRedirectUri: request.redirectUri,
          useProxy,
          executionEnvironment,
          isExpoGo,
        });
        if (result.type !== 'success' || !result.params?.code) {
          if (result.url) {
            console.log('promptAsync result.url', result.url);
          }
          if (result.type !== 'dismiss') {
            throw new Error(result.params?.error_description || 'Inicio cancelado');
          }
          return;
        }

        if (!request.codeVerifier) {
          console.log('AuthRequest missing codeVerifier');
          throw new Error('No se pudo construir la verificación PKCE');
        }

        await handleAuthSuccess(result.params.code, request.codeVerifier);
      } catch (err: any) {
        const msg = err?.message || 'No se pudo iniciar sesión';
        console.log('login flow error', {
          message: msg,
          err,
          redirectUri,
          requestRedirectUri: request.redirectUri,
          useProxy,
          executionEnvironment,
          isExpoGo,
        });
        Alert.alert('Autenticación fallida', msg);
        throw err;
      }
    },
    [discovery, executionEnvironment, handleAuthSuccess, isExpoGo, redirectUri, useProxy]
  );

  const restoreSession = useCallback(async () => {
    try {
      const [storedToken, storedIdToken, storedSession] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(IDTOKEN_KEY),
        AsyncStorage.getItem(SESSION_KEY),
      ]);

      if (storedToken) {
        let parsed: StoredSession | null = null;
        try {
          parsed = storedSession ? JSON.parse(storedSession) : null;
        } catch (e) {
          parsed = null;
        }
        setState({
          loading: false,
          isAuthenticated: true,
          accessToken: storedToken,
          idToken: storedIdToken,
          email: parsed?.email,
          roles: parsed?.roles || [],
          sub: parsed?.sub,
          user: parsed?.user || null,
        });
        return;
      }
    } catch (e) {
      // ignore, fall through to clear state
    }
    setState({ ...initialState, loading: false });
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const signOut = useCallback(async () => {
    await clearPersistedSession();
    setState({ ...initialState, loading: false });
  }, [clearPersistedSession]);

  const setUserProfile = useCallback(
    async (u: Partial<UserProfile>) => {
      let nextState: SessionState | null = null;
      setState((s) => {
        const merged = { ...(s.user || {}), ...u };
        nextState = { ...s, user: merged };
        return nextState;
      });
      if (nextState) {
        await persistSession(nextState);
      }
    },
    [persistSession]
  );

  const actions = useMemo<SessionActions>(
    () => ({
      login,
      signOut,
      setUserProfile,
    }),
    [login, setUserProfile, signOut]
  );

  return <SessionContext.Provider value={[state, actions]}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}

export default useSession;
