import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { decode as base64Decode } from 'base-64';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// Ensure the browser is closed correctly on web/Android after redirect
WebBrowser.maybeCompleteAuthSession();

const AUTH0 = {
  domain: 'dev-ydl81668b887kqqx.us.auth0.com',
  clientId: 'kNXBPgHkHo7nYCOHUOgOFxnOt27C353y',
  audience: 'https://foodlytics/api/v1/auth',
  scheme: 'foodlytics',
  callbackPath: 'callback',
};

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
  bypass?: boolean;
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
  bypass: false,
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

function getValidTokenClaims(token: string) {
  try {
    const claims = decodeJwt(token);
    const expMs = typeof claims.exp === 'number' ? claims.exp * 1000 : null;
    if (!expMs || expMs <= Date.now()) {
      return null;
    }
    return claims;
  } catch (e) {
    return null;
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>(initialState);

  const bypassAuth = __DEV__ && process.env.EXPO_PUBLIC_BYPASS_AUTH === 'true';

  const buildFakeSession = useCallback((): SessionState => {
    const fakeUser: UserProfile = {
      id: 'fake-user-id',
      email: 'designer@foodlytics.test',
      heightCm: 170,
      weightKg: 65,
      role: 'designer',
    };
    return {
      loading: false,
      isAuthenticated: true,
      accessToken: null,
      idToken: null,
      email: fakeUser.email,
      roles: ['designer'],
      sub: 'fake|designer',
      user: fakeUser,
      bypass: true,
    };
  }, []);

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

  // Simplified provider: no refresh token rotation or backend sync here.

  const handleAuthSuccess = useCallback(
    async (code: string, codeVerifier: string) => {
      if (bypassAuth) {
        const fake = buildFakeSession();
        console.log('Bypass auth active; skipping exchange, using fake session');
        setState(fake);
        return;
      }
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
      const emailFromClaims = claims['https://foodlytics.app/email'] || claims.email;
      const rolesFromClaims = claims['https://foodlytics.app/roles'] || claims.roles || [];
      const subFromClaims = claims.sub;

      let persistedSession: StoredSession | null = null;
      try {
        const storedSessionRaw = await AsyncStorage.getItem(SESSION_KEY);
        persistedSession = storedSessionRaw ? JSON.parse(storedSessionRaw) : null;
      } catch {
        persistedSession = null;
      }

      const sessionEmail = emailFromClaims || persistedSession?.user?.email || persistedSession?.email;
      const storedUser = persistedSession?.user || null;
      const user: UserProfile | null = storedUser
        ? { ...storedUser, email: sessionEmail || storedUser.email }
        : sessionEmail
          ? { email: sessionEmail }
          : null;

      const nextState: SessionState = {
        loading: false,
        isAuthenticated: true,
        accessToken,
        idToken,
        email: sessionEmail,
        roles: Array.isArray(rolesFromClaims) && rolesFromClaims.length
          ? rolesFromClaims
          : Array.isArray(persistedSession?.roles) && persistedSession?.roles.length
            ? persistedSession.roles
            : rolesFromClaims
              ? [rolesFromClaims]
              : [],
        sub: subFromClaims || persistedSession?.sub,
        user,
      };

      setState(nextState);
      await persistSession(nextState);
    },
    [discovery, persistSession, redirectUri]
  );

  const login = useCallback(
    async (opts?: { screenHint?: 'signup' | 'login' }) => {
      if (bypassAuth) {
        const fake = buildFakeSession();
        console.log('Bypass auth active; returning fake session', fake);
        setState(fake);
        return;
      }
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
    if (bypassAuth) {
      const fake = buildFakeSession();
      setState(fake);
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    try {
      const [storedToken, storedIdToken, storedSession] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(IDTOKEN_KEY),
        AsyncStorage.getItem(SESSION_KEY),
      ]);
  
      if (!storedToken) {
        await clearPersistedSession();
        setState({ ...initialState, loading: false });
        return;
      }
  
      let parsed: StoredSession | null = null;
      try {
        parsed = storedSession ? JSON.parse(storedSession) : null;
      } catch {
        parsed = null; // no limpiar; rehidratar con claims
      }
  
      const claims = getValidTokenClaims(storedToken);
      if (!claims) {
        await clearPersistedSession();
        setState({ ...initialState, loading: false });
        return;
      }
  
      const email = claims['https://foodlytics.app/email'] || claims.email || parsed?.email;
      const rolesFromClaims = claims['https://foodlytics.app/roles'] || claims.roles || [];
      const roles =
        (Array.isArray(rolesFromClaims) && rolesFromClaims.length && rolesFromClaims) ||
        (Array.isArray(parsed?.roles) ? parsed?.roles : []) ||
        (rolesFromClaims ? [rolesFromClaims] : []);
      const sub = claims.sub || parsed?.sub;
      const userFromStore = parsed?.user || null;
      const user = userFromStore ? { ...userFromStore, email: email || userFromStore.email } : email ? { email } : null;
  
      const nextState: SessionState = {
        loading: false,
        isAuthenticated: true,
        accessToken: storedToken,
        idToken: storedIdToken || null,
        email,
        roles,
        sub,
        user,
      };
  
      setState(nextState);
      await persistSession(nextState); // reescribe SESSION_KEY si faltaba
    } catch {
      // Si algo raro ocurre al restaurar, no limpies SecureStore; solo cae a estado no autenticado.
      setState({ ...initialState, loading: false });
    }
  }, [bypassAuth, buildFakeSession, clearPersistedSession, persistSession]);
  
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const signOut = useCallback(async () => {
    await clearPersistedSession();
    if (bypassAuth) {
      // Dev bypass: keep fake session but ensure any stored tokens are wiped first
      const fake = buildFakeSession();
      setState(fake);
      return;
    }
    setState({ ...initialState, loading: false });
  }, [bypassAuth, buildFakeSession, clearPersistedSession]);

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
