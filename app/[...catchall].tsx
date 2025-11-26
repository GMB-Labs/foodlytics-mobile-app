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
        const initial = await Linking.getInitialURL();
        const parsed = initial ? Linking.parse(initial) : {};
        console.log('[app/[...catchall]] parsed:', initial, parsed);
        // If logout in progress, consume and go to auth login
        const inLogout = await AsyncStorage.getItem('@foodlytics:logout_in_progress');
        if (inLogout) {
          try { await AsyncStorage.removeItem('@foodlytics:logout_in_progress'); } catch (e) { /* ignore */ }
          if (mounted) router.replace('/(auth)/login');
          return;
        }

        // If the path looks like callback with code param, go to root so AuthSession can handle it
        if ((parsed as any).queryParams && (parsed as any).queryParams.code) {
          if (mounted) router.replace('/');
          return;
        }

        // Default: replace to root to avoid Unmatched Route screen
        if (mounted) router.replace('/');
      } catch (e) {
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
