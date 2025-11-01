import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, s } from "../tokens";
import { useProfile } from "../../application/useProfile";
import { useSession } from '@/src/shared/hooks/useSession';
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
  const [editing, setEditing] = useState<null | 'personal' | 'goals'>(null);
  const insets = useSafeAreaInsets();
  const [, sessionActions] = useSession();
  
  async function handleSignOut() {
    // Optional: confirm with the user
    // clear persisted app data and notify session provider
    try {
      // Clear local storage keys used by the app
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.removeItem('@foodlytics:notif_prefs');
      await AsyncStorage.removeItem('@foodlytics:language');
      // TODO: if you integrate Auth0, call the Auth0 logout endpoint here
    } catch (e) {
      // swallow - logout should continue
      // eslint-disable-next-line no-console
      console.warn('error clearing storage on signOut', e);
    }

    // update in-memory session
    sessionActions.signOut();

    // navigate to login and replace history so user can't go back
    router.replace('/login');
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
    <View style={styles.container}>
  <Header name={profile.name} email={profile.email} imageUri={profile.avatar} onPick={pickImage} />
  <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scrollContent, { paddingBottom: s(100) + insets.bottom }] }>
        <PersonalData
          age={profile.age}
          gender={profile.gender}
          heightCm={profile.heightCm}
          weightKg={profile.weightKg}
          bmi={profile.bmi}
          bmiLabel={profile.bmiLabel}
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
