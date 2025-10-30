import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Lightweight session skeleton.
 *
 * - Purpose: provide an app-level session/context placeholder to be wired to
 *   Auth0 and the backend later. Keeps API shape small and documented.
 * - Persistence: intentionally in-memory for now. Replace with SecureStore
 *   / AsyncStorage when integrating real Auth0 tokens.
 */

export type UserProfile = {
  id?: string;
  email?: string;
  heightCm?: number;
  weightKg?: number;
  // add other fields your backend returns
};

type SessionState = {
  loading: boolean;
  isAuthenticated: boolean;
  user: UserProfile | null;
};

type SessionActions = {
  signInLocal: (user: UserProfile) => void;
  signOut: () => void;
  setUserProfile: (u: UserProfile) => void;
};

const SessionContext = createContext<[SessionState, SessionActions] | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>({ loading: true, isAuthenticated: false, user: null });

  useEffect(() => {
    // Skeleton bootstrap. If you integrate Auth0, replace this with real
    // token validation + /me call. For now we start as not authenticated.
    const timer = setTimeout(() => setState((s) => ({ ...s, loading: false })), 250);
    return () => clearTimeout(timer);
  }, []);

  const actions: SessionActions = useMemo(
    () => ({
      signInLocal(user: UserProfile) {
        setState({ loading: false, isAuthenticated: true, user });
      },
      signOut() {
        setState({ loading: false, isAuthenticated: false, user: null });
      },
      setUserProfile(u: UserProfile) {
        setState((s) => ({ ...s, user: { ...(s.user || {}), ...u } }));
      },
    }),
    []
  );

  return <SessionContext.Provider value={[state, actions]}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}

export default useSession;
// (duplicate trailing content removed)
