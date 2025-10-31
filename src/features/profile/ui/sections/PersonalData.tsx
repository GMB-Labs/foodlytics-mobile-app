import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, TextInput } from "react-native";
import AppText from "@/src/shared/ui/components/Typography";
import SectionCard from "../pieces/SectionCard";
import KeyValueBox from "../pieces/KeyValueBox";
import BMIBlock from "../pieces/BMIBlock";
import EditAction from '../pieces/EditAction';
import { COLORS, s } from "../tokens";

export default React.memo(function PersonalData({
  age, gender, heightCm, weightKg, bmi, bmiLabel, onEdit, isEditing, onSave, onCancel,
}: {
  age: number; gender: string; heightCm: number; weightKg: number;
  bmi: number; bmiLabel: string; onEdit: () => void; isEditing?: boolean;
  onSave?: (data: { age?: number; gender?: string; heightCm?: number; weightKg?: number }) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState({ age: String(age || ''), gender: gender || '', heightCm: String(heightCm || ''), weightKg: String(weightKg || '') });

  useEffect(() => {
    if (isEditing) {
      setForm({ age: String(age || ''), gender: gender || '', heightCm: String(heightCm || ''), weightKg: String(weightKg || '') });
    }
  }, [isEditing]);

  function save(){
    onSave && onSave({ age: Number(form.age), gender: form.gender, heightCm: Number(form.heightCm), weightKg: Number(form.weightKg) });
  }

  if (isEditing) {
    return (
      <SectionCard
        title="Datos Personales"
        right={<Pressable onPress={onCancel}><AppText variant="ag9" color={COLORS.brandA}>Cancelar</AppText></Pressable>}
      >
        <View style={{ gap: s(12) }}>
          <AppText variant="ag10">Edad</AppText>
          <TextInput style={styles.input} keyboardType="numeric" value={form.age} onChangeText={(v)=>setForm(f=>({...f, age:v}))} />

          <View style={{ flexDirection: 'row', gap: s(12) }}>
            <View style={{ flex: 1 }}>
              <AppText variant="ag10">Altura (cm)</AppText>
              <TextInput style={styles.input} keyboardType="numeric" value={form.heightCm} onChangeText={(v)=>setForm(f=>({...f, heightCm:v}))} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="ag10">Peso (kg)</AppText>
              <TextInput style={styles.input} keyboardType="numeric" value={form.weightKg} onChangeText={(v)=>setForm(f=>({...f, weightKg:v}))} />
            </View>
          </View>

          <Pressable onPress={save} style={styles.saveBtn}><AppText variant="ag9" color="white">Guardar Cambios</AppText></Pressable>
        </View>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Datos Personales"
      right={<EditAction onPress={onEdit} />}
    >
      <View style={styles.grid}>
        <KeyValueBox label="Edad" value={`${age} años`} />
        <KeyValueBox label="Género" value={gender} />
        <KeyValueBox label="Altura" value={`${heightCm} cm`} />
        <KeyValueBox label="Peso Actual" value={`${weightKg} kg`} />
      </View>
      <BMIBlock bmi={bmi} label={bmiLabel} />
    </SectionCard>
  );
});

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: s(16), marginBottom: s(12) },
  input: { backgroundColor: COLORS.chipBg, borderRadius: s(12), padding: s(12), marginTop: s(6) },
  saveBtn: { backgroundColor: COLORS.brandA, borderRadius: s(28), paddingVertical: s(14), alignItems: 'center', marginTop: s(10) },
});
