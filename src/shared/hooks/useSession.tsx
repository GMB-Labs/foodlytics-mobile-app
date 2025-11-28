import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { decode as base64Decode } from 'base-64';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { API_BASE_URL } from '@/src/shared/constants/api';

// Ensure the browser is closed correctly on web/Android after redirect
WebBrowser.maybeCompleteAuthSession();

const AUTH0 = {
  domain: 'dev-ydl81668b887kqqx.us.auth0.com',
  clientId: 'kNXBPgHkHo7nYCOHUOgOFxnOt27C353y',
  audience: 'https://foodlytics/api/v1/auth',
  scheme: 'foodlytics',
  callbackPath: 'callback',
};

async function syncUserFromToken(token?: string | null) {
  if (!token) return;
  try {
    const url = buildApiUrl('/api/v1/users-sync/sync');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.warn('[useSession] syncUserFromToken failed', response.status, text);
    }
  } catch (error) {
    console.warn('[useSession] syncUserFromToken error', error);
  }
}

type ProfileDto = {
  user_profile_completed?: boolean | null;
  first_name?: string | null;
  last_name?: string | null;
  age?: number | null;
  gender?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  desired_weight_kg?: number | null;
  activity_level?: string | null;
  goal_type?: string | null;
  daily_calories?: number | null;
  has_profile_picture?: boolean | null;
  profile_picture_url?: string | null;
  nutritionist_id?: string | null;
  [k: string]: any;
};

type ProfileFetchResult = {
  dto: ProfileDto | null;
  completion: boolean;
};

const API_BASE = (API_BASE_URL || '').replace(/\/$/, '');

function buildApiUrl(path: string) {
  if (!API_BASE) return path;
  if (!path.startsWith('/')) {
    return `${API_BASE}/${path}`;
  }
  return `${API_BASE}${path}`;
}

async function fetchProfileMetadata(token?: string | null, userId?: string | null): Promise<ProfileFetchResult | null> {
  if (!token || !userId) return null;
  const attemptFetch = async (): Promise<Response> => {
    const url = buildApiUrl(`/api/v1/profiles/${userId}`);
    return fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  };

  try {
    let response = await attemptFetch();

    if (response.status === 404) {
      await syncUserFromToken(token);
      await new Promise((resolve) => setTimeout(resolve, 500));
      response = await attemptFetch();
    }

    if (response.status === 404) {
      return { dto: null, completion: false };
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Profile fetch failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as ProfileDto;
    return {
      dto: data,
      completion: data?.user_profile_completed ?? false,
    };
  } catch (error) {
    console.warn('[useSession] fetchProfileMetadata error', error);
    return null;
  }
}

function mergeUserWithProfile(
  user: UserProfile | null,
  dto: ProfileDto | null,
  email?: string | null,
  completion?: boolean
): UserProfile | null {
  const next: UserProfile = { ...(user || {}) };

  if (email && !next.email) {
    next.email = email;
  }

  if (dto) {
    const name = `${dto.first_name ?? ''} ${dto.last_name ?? ''}`.trim();
    if (name.length > 0) {
      (next as any).name = name;
    }
    if (typeof dto.age === 'number') {
      (next as any).age = dto.age;
    }
    if (dto.gender) {
      (next as any).gender = dto.gender;
    }
    if (typeof dto.height_cm === 'number') {
      next.heightCm = dto.height_cm;
    }
    if (typeof dto.weight_kg === 'number') {
      next.weightKg = dto.weight_kg;
    }
    if (typeof dto.desired_weight_kg === 'number') {
      (next as any).goalWeight = dto.desired_weight_kg;
    }
    if (dto.activity_level) {
      (next as any).activity = dto.activity_level;
    }
    if (dto.goal_type) {
      (next as any).goalType = dto.goal_type;
    }
    if (typeof dto.daily_calories === 'number') {
      (next as any).dailyCalories = dto.daily_calories;
    }
    if (typeof dto.has_profile_picture === 'boolean') {
      (next as any).hasProfilePicture = dto.has_profile_picture;
    }
    if (typeof dto.profile_picture_url === 'string') {
      (next as any).avatar = dto.profile_picture_url;
    }
    if (dto.nutritionist_id) {
      (next as any).nutritionistId = dto.nutritionist_id;
    }
  }

  if (completion !== undefined) {
    (next as any).user_profile_completed = completion;
  }

  return Object.keys(next).length > 0 ? next : null;
}

function applyProfileDataToState(
  baseState: SessionState,
  profileResult: ProfileFetchResult | null,
  fallbackCompletion?: boolean
): SessionState {
  const completion =
    profileResult?.completion ??
    (fallbackCompletion !== undefined ? fallbackCompletion : baseState.userProfileCompleted);
  const mergedUser = mergeUserWithProfile(
    baseState.user,
    profileResult?.dto ?? null,
    baseState.email,
    completion
  );

  return {
    ...baseState,
    user: mergedUser,
    userProfileCompleted: completion,
  };
}

// Claves de SecureStore/AsyncStorage:
// Deben contener SOLO: letras, números, ".", "-" y "_"
// (Nada de "@" o ":" para evitar errores en iOS/Android)
const TOKEN_KEY = 'foodlytics_access_token';
const IDTOKEN_KEY = 'foodlytics_id_token';
const REFRESH_TOKEN_KEY = 'foodlytics_refresh_token';
const SESSION_KEY = 'foodlytics_session';

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
  userProfileCompleted?: boolean;
};

type SessionActions = {
  login: (opts?: { screenHint?: 'signup' | 'login' }) => Promise<void>;
  signOut: () => Promise<void>;
  setUserProfile: (u: Partial<UserProfile>) => Promise<void>;
  refreshProfileAndUpdateCompletion: (
    completedOverride?: boolean,
    tokenOverride?: string | null,
    userIdOverride?: string | null
  ) => Promise<void>;
};

type StoredSession = {
  email?: string;
  roles?: string[];
  sub?: string;
  user?: UserProfile | null;
  userProfileCompleted?: boolean;
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
  userProfileCompleted: undefined,
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
      userProfileCompleted: true,
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


  const persistSession = useCallback(async (payload: SessionState, refreshToken?: string | null) => {
    try {
      if (payload.accessToken) {
        await SecureStore.setItemAsync(TOKEN_KEY, payload.accessToken);
      }
      if (payload.idToken) {
        await SecureStore.setItemAsync(IDTOKEN_KEY, payload.idToken);
      } else {
        await SecureStore.deleteItemAsync(IDTOKEN_KEY);
      }
      // Guardar refresh_token si se proporciona
      if (refreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      }
      const toStore: StoredSession = {
        email: payload.email,
        roles: payload.roles || [],
        sub: payload.sub,
        user: payload.user,
        userProfileCompleted: payload.userProfileCompleted,
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
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
        AsyncStorage.removeItem(SESSION_KEY),
      ]);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('clearPersistedSession error', e);
    }
  }, []);

  /**
   * Refresca el access_token usando el refresh_token guardado.
   * Hace POST a Auth0 /oauth/token endpoint para obtener nuevos tokens.
   */
  const refreshAccessToken = useCallback(async (refreshToken: string): Promise<{
    accessToken: string;
    idToken: string | null;
    refreshToken: string | null;
  }> => {
    const tokenUrl = `https://${AUTH0.domain}/oauth/token`;
    
    console.log('Refrescando access_token con refresh_token...');

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: AUTH0.clientId,
        refresh_token: refreshToken,
        audience: AUTH0.audience,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      console.error('Error al refrescar token:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
      });
      throw new Error(`Error al refrescar token: ${response.status} ${response.statusText}`);
    }

    const tokenData = await response.json();
    const newAccessToken = tokenData.access_token || tokenData.accessToken;
    const newIdToken = tokenData.id_token || tokenData.idToken || null;
    const newRefreshToken = tokenData.refresh_token || tokenData.refreshToken || refreshToken; // Si no viene nuevo, usar el mismo

    if (!newAccessToken) {
      throw new Error('No se recibió access_token en la respuesta de refresh');
    }

    console.log('Tokens refrescados exitosamente:', {
      hasAccessToken: !!newAccessToken,
      hasIdToken: !!newIdToken,
      hasNewRefreshToken: !!newRefreshToken && newRefreshToken !== refreshToken,
    });

    return {
      accessToken: newAccessToken,
      idToken: newIdToken,
      refreshToken: newRefreshToken,
    };
  }, []);

  /**
   * Maneja el éxito de la autenticación:
   * - Intercambia el código de autorización por tokens
   * - Obtiene access_token, id_token y refresh_token
   * - Guarda tokens en SecureStore
   * - Extrae información del usuario desde claims del access_token
   * - Guarda información básica del usuario en AsyncStorage
   */
  const handleAuthSuccess = useCallback(
    async (code: string, codeVerifier: string) => {
      if (bypassAuth) {
        const fake = buildFakeSession();
        console.log('Bypass auth active; skipping exchange, using fake session');
        setState(fake);
        return;
      }

      console.log('Intercambiando código por tokens...', { redirectUri, hasCode: !!code });
      
      // Intercambiar código de autorización por tokens
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
        console.error('Error al intercambiar código por tokens:', {
          message: err?.message,
          status: err?.response?.status,
          body: err?.response?.body,
        });
        throw err;
      });

      // Extraer access_token, id_token y refresh_token de la respuesta
      const accessToken = (tokenResult as any).accessToken || (tokenResult as any).access_token;
      const idToken = (tokenResult as any).idToken || (tokenResult as any).id_token || null;
      const refreshToken = (tokenResult as any).refreshToken || (tokenResult as any).refresh_token || null;
      
      if (!accessToken) {
        throw new Error('No se recibió access_token');
      }

      console.log('Tokens recibidos:', {
        hasAccessToken: !!accessToken,
        hasIdToken: !!idToken,
        hasRefreshToken: !!refreshToken,
      });

      // Decodificar access_token para extraer información del usuario
      const claims = decodeJwt(accessToken);
      const emailFromClaims = claims['https://foodlytics.app/email'] || claims.email;
      const rolesFromClaims = claims['https://foodlytics.app/roles'] || claims.roles || [];
      const subFromClaims = claims.sub;

      // Intentar leer sesión previa de AsyncStorage (opcional)
      let persistedSession: StoredSession | null = null;
      try {
        const storedSessionRaw = await AsyncStorage.getItem(SESSION_KEY);
        persistedSession = storedSessionRaw ? JSON.parse(storedSessionRaw) : null;
      } catch {
        persistedSession = null;
      }

      // Construir información del usuario desde claims (prioridad) y datos guardados
      const sessionEmail = emailFromClaims || persistedSession?.user?.email || persistedSession?.email;
      const storedUser = persistedSession?.user || null;
      const user: UserProfile | null = storedUser
        ? { ...storedUser, email: sessionEmail || storedUser.email }
        : sessionEmail
          ? { email: sessionEmail }
          : null;

      // Construir roles: priorizar claims, luego datos guardados
      const roles = Array.isArray(rolesFromClaims) && rolesFromClaims.length > 0
        ? rolesFromClaims
        : Array.isArray(persistedSession?.roles) && persistedSession?.roles.length > 0
          ? persistedSession.roles
          : rolesFromClaims
            ? [rolesFromClaims]
            : [];

      const resolvedSub = subFromClaims || persistedSession?.sub;

      await syncUserFromToken(accessToken);

      let profileResult: ProfileFetchResult | null = null;
      if (resolvedSub) {
        profileResult = await fetchProfileMetadata(accessToken, resolvedSub);
      }

      // Construir estado de sesión autenticada
      const baseState: SessionState = {
        loading: false,
        isAuthenticated: true,
        accessToken,
        idToken,
        email: sessionEmail,
        roles,
        sub: resolvedSub,
        user,
      };

      const nextState = applyProfileDataToState(
        baseState,
        profileResult,
        persistedSession?.userProfileCompleted
      );

      // Actualizar estado y persistir tokens e información del usuario (incluyendo refresh_token)
      setState(nextState);
      await persistSession(nextState, refreshToken);

      console.log('Login exitoso:', {
        email: sessionEmail,
        sub: subFromClaims,
        hasUser: !!user,
        hasRefreshToken: !!refreshToken,
        tokenExp: claims.exp ? new Date(claims.exp * 1000).toISOString() : 'N/A',
      });
    },
    [bypassAuth, buildFakeSession, discovery, persistSession, redirectUri]
  );

  /**
   * Inicia el flujo de login con Auth0:
   * - Abre el navegador de Auth0 para que el usuario inicie sesión
   * - Completa el login y vuelve a la app
   * - Obtiene access_token e id_token
   * - Guarda tokens en SecureStore e información del usuario en AsyncStorage
   */
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
        console.error('login blocked on Expo Go', { executionEnvironment, isExpoGo, redirectUri, useProxy });
        Alert.alert('Auth no disponible en Expo Go', msg);
        throw new Error(msg);
      }

      // Crear request de autenticación con PKCE
      // Incluir scope "offline_access" para obtener refresh_token
      const request = new AuthSession.AuthRequest({
        responseType: AuthSession.ResponseType.Code,
        clientId: AUTH0.clientId,
        redirectUri,
        usePKCE: true,
        scopes: ['openid', 'profile', 'email', 'offline_access'],
        extraParams: {
          audience: AUTH0.audience,
          ...(opts?.screenHint ? { screen_hint: opts.screenHint } : {}),
        },
      });

      try {
        console.log('Abriendo navegador de Auth0...', {
          redirectUri,
          requestRedirectUri: request.redirectUri,
          screenHint: opts?.screenHint,
        });

        // Abrir navegador de Auth0 para login
        const result = await request.promptAsync(discovery, { useProxy });

        console.log('Resultado de Auth0:', {
          type: result.type,
          hasCode: !!result.params?.code,
          error: (result as any).error,
        });

        // Verificar resultado del login
        if (result.type !== 'success' || !result.params?.code) {
          if (result.url) {
            console.log('URL de resultado:', result.url);
          }
          if (result.type !== 'dismiss') {
            const errorMsg = result.params?.error_description || 'Inicio cancelado';
            throw new Error(errorMsg);
          }
          // Usuario canceló el login
          return;
        }

        // Verificar que tenemos el codeVerifier para PKCE
        if (!request.codeVerifier) {
          console.error('AuthRequest missing codeVerifier');
          throw new Error('No se pudo construir la verificación PKCE');
        }

        // Intercambiar código por tokens y guardar sesión
        await handleAuthSuccess(result.params.code, request.codeVerifier);
      } catch (err: any) {
        const msg = err?.message || 'No se pudo iniciar sesión';
        console.error('Error en flujo de login:', {
          message: msg,
          err,
          redirectUri,
          useProxy,
          executionEnvironment,
          isExpoGo,
        });
        Alert.alert('Autenticación fallida', msg);
        throw err;
      }
    },
    [bypassAuth, buildFakeSession, discovery, executionEnvironment, handleAuthSuccess, isExpoGo, redirectUri, useProxy]
  );

  /**
   * Restaura la sesión desde SecureStore y AsyncStorage.
   * - Si el access_token existe y es válido → entra directo
   * - Si el access_token expiró pero hay refresh_token → refresca tokens automáticamente
   * - Si no hay tokens válidos → limpia todo y muestra login
   */
  const restoreSession = useCallback(async () => {
    if (bypassAuth) {
      const fake = buildFakeSession();
      setState(fake);
      return;
    }

    setState((s) => ({ ...s, loading: true }));

    try {
      // 1. Intentar leer access_token desde SecureStore
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);

      // Si no hay access_token, verificar si hay refresh_token
      if (!storedToken) {
        const storedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY).catch(() => null);
        
        if (storedRefreshToken) {
          // Intentar refrescar tokens con refresh_token
          console.log('No access_token pero hay refresh_token, intentando refrescar...');
          try {
            const refreshedTokens = await refreshAccessToken(storedRefreshToken);
            
            // Reconstruir sesión con los nuevos tokens
            const newClaims = decodeJwt(refreshedTokens.accessToken);
            const emailFromClaims = newClaims['https://foodlytics.app/email'] || newClaims.email;
            const rolesFromClaims = newClaims['https://foodlytics.app/roles'] || newClaims.roles || [];
            const subFromClaims = newClaims.sub;

            // Leer datos adicionales de AsyncStorage
            let parsed: StoredSession | null = null;
            try {
              const storedSession = await AsyncStorage.getItem(SESSION_KEY);
              parsed = storedSession ? JSON.parse(storedSession) : null;
            } catch {
              parsed = null;
            }

            const email = emailFromClaims || parsed?.email || parsed?.user?.email;
            const roles = Array.isArray(rolesFromClaims) && rolesFromClaims.length > 0
              ? rolesFromClaims
              : Array.isArray(parsed?.roles) && parsed.roles.length > 0
                ? parsed.roles
                : rolesFromClaims
                  ? [rolesFromClaims]
                  : [];
            const sub = subFromClaims || parsed?.sub;

            let user: UserProfile | null = null;
            if (parsed?.user) {
              user = {
                ...parsed.user,
                email: email || parsed.user.email,
              };
            } else if (email) {
              user = { email };
            }

            const baseState: SessionState = {
              loading: false,
              isAuthenticated: true,
              accessToken: refreshedTokens.accessToken,
              idToken: refreshedTokens.idToken,
              email,
              roles,
              sub,
              user,
            };

            const profileResult = await fetchProfileMetadata(baseState.accessToken, baseState.sub);
            const restoredState = applyProfileDataToState(
              baseState,
              profileResult,
              parsed?.userProfileCompleted
            );

            setState(restoredState);
            await persistSession(restoredState, refreshedTokens.refreshToken);

            console.log('Sesión restaurada exitosamente usando refresh_token', {
              email,
              sub,
              hasUser: !!user,
              tokenExp: newClaims.exp ? new Date(newClaims.exp * 1000).toISOString() : 'N/A',
            });
            return;
          } catch (refreshError) {
            // Refresh falló - limpiar todo y requerir login
            console.error('Error al refrescar token:', refreshError);
            await clearPersistedSession();
            setState({ ...initialState, loading: false });
            return;
          }
        } else {
          // No hay tokens - limpiar y requerir login
          console.log('No access_token ni refresh_token encontrados, limpiando sesión');
          await clearPersistedSession();
          setState({ ...initialState, loading: false });
          return;
        }
      }

      // 2. Verificar validez del access_token decodificando el JWT
      const claims = getValidTokenClaims(storedToken);
      
      if (!claims) {
        // Token expirado - intentar refrescar con refresh_token
        console.log('access_token expirado, intentando refrescar con refresh_token...');
        const storedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY).catch(() => null);
        
        if (storedRefreshToken) {
          try {
            const refreshedTokens = await refreshAccessToken(storedRefreshToken);
            
            // Reconstruir sesión con los nuevos tokens
            const newClaims = decodeJwt(refreshedTokens.accessToken);
            const emailFromClaims = newClaims['https://foodlytics.app/email'] || newClaims.email;
            const rolesFromClaims = newClaims['https://foodlytics.app/roles'] || newClaims.roles || [];
            const subFromClaims = newClaims.sub;

            // Leer datos adicionales de AsyncStorage
            let parsed: StoredSession | null = null;
            try {
              const storedSession = await AsyncStorage.getItem(SESSION_KEY);
              parsed = storedSession ? JSON.parse(storedSession) : null;
            } catch {
              parsed = null;
            }

            const email = emailFromClaims || parsed?.email || parsed?.user?.email;
            const roles = Array.isArray(rolesFromClaims) && rolesFromClaims.length > 0
              ? rolesFromClaims
              : Array.isArray(parsed?.roles) && parsed.roles.length > 0
                ? parsed.roles
                : rolesFromClaims
                  ? [rolesFromClaims]
                  : [];
            const sub = subFromClaims || parsed?.sub;

            let user: UserProfile | null = null;
            if (parsed?.user) {
              user = {
                ...parsed.user,
                email: email || parsed.user.email,
              };
            } else if (email) {
              user = { email };
            }

            const baseState: SessionState = {
              loading: false,
              isAuthenticated: true,
              accessToken: refreshedTokens.accessToken,
              idToken: refreshedTokens.idToken,
              email,
              roles,
              sub,
              user,
            };

            const profileResult = await fetchProfileMetadata(baseState.accessToken, baseState.sub);
            const restoredState = applyProfileDataToState(
              baseState,
              profileResult,
              parsed?.userProfileCompleted
            );

            setState(restoredState);
            await persistSession(restoredState, refreshedTokens.refreshToken);

            console.log('Sesión restaurada exitosamente después de refrescar token', {
              email,
              sub,
              hasUser: !!user,
              tokenExp: newClaims.exp ? new Date(newClaims.exp * 1000).toISOString() : 'N/A',
            });
            return;
          } catch (refreshError) {
            // Refresh falló - limpiar todo y requerir login
            console.error('Error al refrescar token:', refreshError);
            await clearPersistedSession();
            setState({ ...initialState, loading: false });
            return;
          }
        } else {
          // No hay refresh_token - limpiar todo y requerir login
          console.log('access_token expirado y no hay refresh_token, limpiando sesión');
          await clearPersistedSession();
          setState({ ...initialState, loading: false });
          return;
        }
      }

      // 3. Token válido - reconstruir sesión desde claims del access_token
      console.log('access_token válido encontrado, restaurando sesión desde claims');

      // Leer datos adicionales de AsyncStorage (opcional, puede no existir)
      let parsed: StoredSession | null = null;
      try {
        const storedSession = await AsyncStorage.getItem(SESSION_KEY);
        parsed = storedSession ? JSON.parse(storedSession) : null;
      } catch {
        // Si AsyncStorage falla o no existe, no es crítico - reconstruimos desde claims
        parsed = null;
      }

      // Leer id_token si existe (opcional)
      const storedIdToken = await SecureStore.getItemAsync(IDTOKEN_KEY).catch(() => null);

      // 4. Extraer información del usuario desde los claims del access_token
      // Prioridad: claims del token > datos guardados en AsyncStorage
      const emailFromClaims = claims['https://foodlytics.app/email'] || claims.email;
      const rolesFromClaims = claims['https://foodlytics.app/roles'] || claims.roles || [];
      const subFromClaims = claims.sub;

      // Usar claims como fuente de verdad, con fallback a datos guardados
      const email = emailFromClaims || parsed?.email || parsed?.user?.email;
      const roles = Array.isArray(rolesFromClaims) && rolesFromClaims.length > 0
        ? rolesFromClaims
        : Array.isArray(parsed?.roles) && parsed.roles.length > 0
          ? parsed.roles
          : rolesFromClaims
            ? [rolesFromClaims]
            : [];
      const sub = subFromClaims || parsed?.sub;

      // Construir objeto user: priorizar claims, luego datos guardados
      let user: UserProfile | null = null;
      if (parsed?.user) {
        // Si hay datos guardados, combinarlos con email de claims
        user = {
          ...parsed.user,
          email: email || parsed.user.email,
        };
      } else if (email) {
        // Si solo hay email de claims, crear objeto mínimo
        user = { email };
      }

      // 5. Construir estado de sesión restaurado
      const baseState: SessionState = {
        loading: false,
        isAuthenticated: true,
        accessToken: storedToken,
        idToken: storedIdToken || null,
        email,
        roles,
        sub,
        user,
      };

      const profileResult = await fetchProfileMetadata(baseState.accessToken, baseState.sub);
      const restoredState = applyProfileDataToState(
        baseState,
        profileResult,
        parsed?.userProfileCompleted
      );

      // 6. Actualizar estado y persistir (reescribir AsyncStorage con datos actualizados)
      setState(restoredState);
      await persistSession(restoredState);

      console.log('Sesión restaurada exitosamente', {
        email,
        sub,
        hasUser: !!user,
        tokenExp: claims.exp ? new Date(claims.exp * 1000).toISOString() : 'N/A',
      });
    } catch (error) {
      // Error al restaurar - limpiar todo y requerir login
      console.error('Error al restaurar sesión:', error);
      await clearPersistedSession();
      setState({ ...initialState, loading: false });
    }
  }, [bypassAuth, buildFakeSession, clearPersistedSession, persistSession, refreshAccessToken]);
  
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  /**
   * Cierra la sesión en Auth0 abriendo el endpoint de logout.
   * Esto cierra la sesión del navegador para que el usuario pueda iniciar sesión con otra cuenta.
   */
  const logoutFromAuth0 = useCallback(async () => {
    if (bypassAuth || isExpoGo) {
      return; // No hacer logout en Auth0 si estamos en bypass o Expo Go
    }

    try {
      // Construir URL de logout de Auth0 con los query params correctos
      const returnTo = `${AUTH0.scheme}://callback-logout`;
      const logoutUrl = `https://${AUTH0.domain}/v2/logout?client_id=${AUTH0.clientId}&returnTo=${encodeURIComponent(returnTo)}`;
      
      console.log('Cerrando sesión en Auth0...', { logoutUrl, returnTo });
      
      // Abrir el navegador con openAuthSessionAsync para que pueda volver a la app
      // Auth0 procesará el logout y redirigirá a returnTo, que abrirá la app
      await WebBrowser.openAuthSessionAsync(logoutUrl, returnTo);
      
      console.log('Sesión cerrada en Auth0');
    } catch (error) {
      // No es crítico si falla el logout de Auth0, continuamos con el logout local
      console.warn('Error al cerrar sesión en Auth0 (continuando con logout local):', error);
    }
  }, [bypassAuth, isExpoGo]);

  /**
   * Cierra sesión completamente:
   * - Cierra la sesión en Auth0 (cierra sesión del navegador)
   * - Borra access_token, id_token y refresh_token de SecureStore
   * - Borra datos de usuario de AsyncStorage
   * - Resetea el estado a no autenticado
   * Después del logout, la próxima vez que se abra la app se mostrará login obligatoriamente.
   */
  const signOut = useCallback(async () => {
    console.log('Cerrando sesión completamente...');
    
    // 1. Primero cerrar sesión en Auth0 (cierra la sesión del navegador)
    await logoutFromAuth0();
    
    // 2. Borrar completamente SecureStore (incluyendo refresh_token) y AsyncStorage
    await clearPersistedSession();
    
    if (bypassAuth) {
      // Dev bypass: mantener sesión fake pero asegurar que tokens guardados estén borrados
      const fake = buildFakeSession();
      setState(fake);
      return;
    }
    
    // 3. Resetear estado a no autenticado
    setState({ ...initialState, loading: false });
    
    console.log('Sesión cerrada completamente');
  }, [bypassAuth, buildFakeSession, clearPersistedSession, logoutFromAuth0]);

  const setUserProfile = useCallback(
    async (u: Partial<UserProfile>) => {
      let nextState: SessionState | null = null;
      setState((s) => {
        const merged = { ...(s.user || {}), ...u };
        const completionPatch =
          (u as any)?.user_profile_completed !== undefined
            ? Boolean((u as any).user_profile_completed)
            : undefined;
        nextState = {
          ...s,
          user: merged,
          userProfileCompleted:
            completionPatch !== undefined ? completionPatch : s.userProfileCompleted,
        };
        return nextState;
      });
      if (nextState) {
        await persistSession(nextState);
      }
    },
    [persistSession]
  );

  const refreshProfileAndUpdateCompletion = useCallback(
    async (
      completedOverride?: boolean,
      tokenOverride?: string | null,
      userIdOverride?: string | null
    ) => {
      const token = tokenOverride ?? state.accessToken;
      const userId = userIdOverride ?? state.sub;
      if (!token || !userId) {
        return;
      }

      let profileResult = await fetchProfileMetadata(token, userId);
      if (!profileResult && completedOverride !== undefined) {
        profileResult = { dto: null, completion: completedOverride };
      } else if (profileResult && completedOverride !== undefined) {
        profileResult = { ...profileResult, completion: completedOverride };
      }

      if (!profileResult && completedOverride === undefined) {
        return;
      }

      let nextState: SessionState | null = null;
      setState((prev) => {
        if (!prev.isAuthenticated) return prev;
        const updated = applyProfileDataToState(
          prev,
          profileResult,
          completedOverride ?? prev.userProfileCompleted
        );
        nextState = updated;
        return updated;
      });

      if (nextState) {
        await persistSession(nextState);
      }
    },
    [fetchProfileMetadata, persistSession, state.accessToken, state.sub, state.userProfileCompleted]
  );

  const actions = useMemo<SessionActions>(
    () => ({
      login,
      signOut,
      setUserProfile,
      refreshProfileAndUpdateCompletion,
    }),
    [login, refreshProfileAndUpdateCompletion, setUserProfile, signOut]
  );

  return <SessionContext.Provider value={[state, actions]}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}

export default useSession;
