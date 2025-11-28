import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import useSession from '@/src/shared/hooks/useSession';

/**
 * Callback handler for Auth0 logout redirect
 * 
 * When Auth0 completes logout, it redirects to foodlytics://callback-logout
 * This screen handles that redirect and ensures proper navigation to login
 */
export default function CallbackLogout() {
  const [session] = useSession();

  // If session is still loading, show spinner
  if (session.loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2fccac" />
      </View>
    );
  }

  // Session should be cleared by now, redirect to login
  if (!session.isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Edge case: still authenticated (shouldn't happen), redirect to tabs
  return <Redirect href="/(tabs)" />;
}

