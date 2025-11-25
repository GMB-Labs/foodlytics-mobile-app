import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, s } from "../tokens";
import useProfile from "../../application/useProfile";
import { useTheme } from '@/src/shared/styles/useTheme';
import { useSession } from '@/src/shared/hooks/useSession';
import { getJSON } from '@/src/shared/utils/api';
import { API_BASE_URL } from '@/src/shared/constants/api';
import { Pressable, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Sections
import Header from "../sections/Header";
import PersonalData from "../sections/PersonalData";
import Goals from "../sections/Goals";
import Preferences from "../sections/Preferences";
import Account from "../sections/Account";
import Logout from "../sections/Logout";

export default function Profile() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const langUpdated = (params as any)?.langUpdated as string | undefined;
  const { profile, updateProfile, pickImage } = useProfile();
  const { colors } = useTheme();
  const [editing, setEditing] = useState<null | 'personal' | 'goals'>(null);
  const insets = useSafeAreaInsets();
  const [sess, sessionActions] = useSession();

  async function debugFetchProfile() {
    try {
      if (!sess || !sess.isAuthenticated) {
        console.log('[Profile Debug] session not authenticated', sess);
        return;
      }
      const sub = sess.sub;
      const token = sess.accessToken ?? undefined;
      if (!sub) {
        console.log('[Profile Debug] no sub in session', sess);
        return;
      }
      const url = `${API_BASE_URL}/api/v1/profiles/${sub}`;
      console.log('[Profile Debug] GET', url);
      const data = await getJSON(url, { baseUrl: '', token });
      console.log('[Profile Debug] result:', data);
    } catch (e) {
      console.error('[Profile Debug] error fetching profile', e);
    }
  }
  
  async function handleSignOut() {
    try {
      // Limpiar datos locales adicionales de la app
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.removeItem('@foodlytics:notif_prefs');
      await AsyncStorage.removeItem('@foodlytics:language');
    } catch (e) {
      // No crítico si falla, continuar con el logout
      // eslint-disable-next-line no-console
      console.warn('error clearing storage on signOut', e);
    }

    // Cerrar sesión completamente:
    // - Cierra sesión en Auth0 (cierra sesión del navegador)
    // - Borra todos los tokens (access_token, id_token, refresh_token)
    // - Borra datos de usuario de AsyncStorage
    // - Resetea el estado de sesión
    await sessionActions.signOut();

    // Navegar a login y reemplazar el historial para que el usuario no pueda volver
    router.replace('/(auth)/login');
  }

  function openEdit(section: 'personal' | 'goals'){
    setEditing(section);
  }

  function onSavePersonal(data: { age?: number; gender?: string; heightCm?: number; weightKg?: number }){
    updateProfile(data);
    setEditing(null);
  }

  function onSaveGoals(data: { goalWeight?: number; activity?: string; dailyCalories?: number }){
    updateProfile(data);
    setEditing(null);
  }

  return (
    <View style={[styles.container, { backgroundColor: (colors as any)?.bg }]}> 
  <Header name={profile.name} email={profile.email} imageUri={profile.avatar} onPick={pickImage} />
  <Pressable onPress={debugFetchProfile} style={{ padding: 8, alignItems: 'center' }}>
    <Text style={{ color: (colors as any)?.primary ?? '#007AFF' }}>DEBUG: fetch profile</Text>
  </Pressable>
  <ScrollView 
  showsVerticalScrollIndicator={false}
  style={{ flex: 1 }} 
  contentContainerStyle={[styles.scrollContent, { paddingBottom: s(100) + insets.bottom }] }
  >
        <PersonalData
          age={profile.age}
          gender={profile.gender}
          heightCm={profile.heightCm}
          weightKg={profile.weightKg}
          bmi={profile.bmi}
          onEdit={() => openEdit('personal')}
          isEditing={editing === 'personal'}
          onCancel={() => setEditing(null)}
          onSave={onSavePersonal}
        />
        <Goals
          goalWeight={profile.goalWeight}
          activity={profile.activity}
          dailyCalories={profile.dailyCalories}
          onEdit={() => openEdit('goals')}
          isEditing={editing === 'goals'}
          onCancel={() => setEditing(null)}
          onSave={onSaveGoals}
        />
        <Preferences
          key={langUpdated || 'prefs'}
          onOpenNotifications={() => router.push("/profile/notifications")}
          onOpenLanguage={() => router.push("/profile/language")}
          onOpenPrivacy={() => router.push("/profile/privacy")} 
        />
        <Account
          onOpenPassword={() => {}}
          onOpenTerms={() => router.push("/profile/terms")}
          onOpenPrivacy={() => router.push("/profile/privacy-policy")}
        />
  <Logout onPress={handleSignOut} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: s(21), paddingTop: s(40), gap: s(20) },
});
