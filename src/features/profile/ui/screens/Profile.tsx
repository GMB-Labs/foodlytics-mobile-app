import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, s } from "../tokens";
import useProfile from "../../application/useProfile";
import { useTheme } from '@/src/shared/styles/useTheme';
import { useSession } from '@/src/shared/hooks/useSession';
import { getJSON } from '@/src/shared/utils/api';
import { API_BASE_URL } from '@/src/shared/constants/api';
import { ASYNC_STORAGE_KEYS } from '@/src/shared/constants/storage';
import { Pressable, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Sections
import Header from "../sections/Header";
import PersonalData from "../sections/PersonalData";
import Goals from "../sections/Goals";
import NutritionistInvite from "../sections/NutritionistInvite";
import Preferences from "../sections/Preferences";
import Account from "../sections/Account";
import Logout from "../sections/Logout";

export default function Profile() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const langUpdated = (params as any)?.langUpdated as string | undefined;
  const { profile, updateProfile, pickImage, redeemNutritionistCode, isRedeemingCode, isSavingProfile } = useProfile();
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
      await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.NOTIFICATION_PREFS);
      await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.LANGUAGE);
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

  async function onSavePersonal(data: { age?: number; gender?: string; heightCm?: number; weightKg?: number }){
    try {
      await updateProfile(data as any);
    } catch (e) {
      console.error('[Profile] error saving personal', e);
    }
    setEditing(null);
  }

  async function onSaveGoals(data: { goalWeight?: number; activity?: string; dailyCalories?: number; goalType?: string }){
    try {
      await updateProfile(data as any);
    } catch (e) {
      console.error('[Profile] error saving goals', e);
    }
    setEditing(null);
  }

  return (
    <View style={[styles.container, { backgroundColor: (colors as any)?.bg }]}> 
  <Header name={profile.name} email={profile.email} imageUri={profile.avatar} onPick={pickImage} />
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
          isSaving={isSavingProfile}
        />
        <Goals
          goalWeight={profile.goalWeight}
          activity={profile.activity}
          goalType={profile.goalType}
          dailyCalories={profile.dailyCalories}
          onEdit={() => openEdit('goals')}
          isEditing={editing === 'goals'}
          onCancel={() => setEditing(null)}
          onSave={onSaveGoals}
          isSaving={isSavingProfile}
        />
        <NutritionistInvite
          nutritionistId={profile.nutritionistId}
          onRedeem={redeemNutritionistCode}
          isLoading={isRedeemingCode}
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
