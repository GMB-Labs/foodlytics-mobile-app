import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { COLORS, s } from "../tokens";
import { useProfile } from "../../application/useProfile";

// Sections
import Header from "../sections/Header";
import PersonalData from "../sections/PersonalData";
import Goals from "../sections/Goals";
import Preferences from "../sections/Preferences";
import Account from "../sections/Account";
import Logout from "../sections/Logout";

export default function Profile() {
  const { profile, updateProfile, pickImage } = useProfile();
  const [editing, setEditing] = useState<null | 'personal' | 'goals'>(null);

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
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
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
          onOpenNotifications={() => {}}
          onOpenLanguage={() => {}}
          onOpenPrivacy={() => {}}
        />
        <Account
          onOpenPassword={() => {}}
          onOpenTerms={() => {}}
          onOpenPrivacy={() => {}}
        />
        <Logout onPress={() => { /* signOut */ }} />
      </ScrollView>

      {/* inline editing handled inside section components via isEditing/onSave/onCancel */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: s(21), paddingBottom: s(140), gap: s(20) },
});
