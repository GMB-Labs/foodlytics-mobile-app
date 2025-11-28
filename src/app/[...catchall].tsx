import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

export default function CatchAll() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Try to obtain incoming URL
        const initial = await Linking.getInitialURL();
        const parsed = initial ? Linking.parse(initial) : {};
        console.log('[src/app/[...catchall]] parsed:', initial, parsed);
        // If logout in progress, consume and go to auth login
        const inLogout = await AsyncStorage.getItem('@foodlytics:logout_in_progress');
        if (inLogout) {
          try { await AsyncStorage.removeItem('@foodlytics:logout_in_progress'); } catch (e) { /* ignore */ }
          console.log('[src/app/[...catchall]] logout_in_progress -> /(auth)/login');
          if (mounted) router.replace('/(auth)/login');
          return;
        }

        // If the parsed url has code param, redirect to root so AuthSession can handle
        if ((parsed as any).queryParams && (parsed as any).queryParams.code) {
          console.log('[src/app/[...catchall]] code param present -> redirect /');
          if (mounted) router.replace('/');
          return;
        }

        // Default: replace to root to avoid Unmatched Route screen
        if (mounted) router.replace('/');
      } catch (e) {
        console.error('[src/app/[...catchall]] error', e);
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
