import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

export default function CallbackHandler() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Try to obtain the incoming deep link via Linking
        const initial = await Linking.getInitialURL();
        const parsed = initial ? Linking.parse(initial) : {};
        console.log('[src/app/callback] parsed callback url:', initial, parsed);

        // If logout was in progress, consume the flag and redirect to auth/login
        const inLogout = await AsyncStorage.getItem('@foodlytics:logout_in_progress');
        if (inLogout) {
          try { await AsyncStorage.removeItem('@foodlytics:logout_in_progress'); } catch (e) { /* ignore */ }
          console.log('[src/app/callback] logout_in_progress detected, redirecting to auth/login');
          if (mounted) router.replace('/(auth)/login');
          return;
        }

        // If the URL contains a code param assume login callback
        if ((parsed as any).queryParams && (parsed as any).queryParams.code) {
          console.log('[src/app/callback] login callback detected (code param), redirecting to /');
          if (mounted) router.replace('/');
          return;
        }

        // Default: redirect to root
        if (mounted) router.replace('/');
      } catch (e) {
        console.error('[src/app/callback] error handling callback', e);
        if (mounted) router.replace('/');
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}
