import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, TextInput, Text } from "react-native";
import AppText from "@/src/shared/ui/components/Typography";
import SectionCard from "../components/SectionCard";
import KeyValueBox from "../components/KeyValueBox";
import BMIBlock from "../components/BMIBlock";
import EditAction from '../components/EditAction';
import { s } from "../tokens";
import { useTheme } from '@/src/shared/styles/useTheme';
import useSession from '@/src/shared/hooks/useSession';

export default React.memo(function PersonalData({
  age, gender, heightCm, weightKg, bmi, bmiLabel, onEdit, isEditing, onSave, onCancel, isSaving,
}: {
  age: number; gender: string; heightCm: number; weightKg: number;
  bmi: number; bmiLabel?: string; onEdit: () => void; isEditing?: boolean;
  onSave?: (data: { age?: number; gender?: string; heightCm?: number; weightKg?: number }) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}) {
  const [form, setForm] = useState({ age: String(age || ''), gender: gender || '', heightCm: String(heightCm || ''), weightKg: String(weightKg || '') });
  const { colors } = useTheme();

  useEffect(() => {
    if (isEditing) {
      setForm({ age: String(age || ''), gender: gender || '', heightCm: String(heightCm || ''), weightKg: String(weightKg || '') });
    }
  }, [isEditing]);

  const [, sessionActions] = useSession();

  async function save(){
    const payload = { age: Number(form.age), gender: form.gender, heightCm: Number(form.heightCm), weightKg: Number(form.weightKg) };
    try {
      if (onSave) await onSave(payload);
    } catch (e) {
      console.warn('[PersonalData] onSave handler failed', e);
    }

    try {
      if (typeof sessionActions?.setUserProfile === 'function') {
        await sessionActions.setUserProfile(payload);
      }
    } catch (e) {
      console.warn('[PersonalData] setUserProfile failed', e);
    }
  }

  if (isEditing) {
    return (
      <SectionCard
        title="Datos Personales"
        right={<Pressable onPress={onCancel}><AppText variant="ag9" color={(colors as any)?.brandA}>Cancelar</AppText></Pressable>}
      >
        <View style={{ gap: s(12) }}>
              <AppText variant="ag10" color={(colors as any)?.text} ><Text>Altura (cm)</Text></AppText>
               <TextInput 
               style={[styles.input,
                { backgroundColor: (colors as any)?.mealRowBg , color: (colors as any)?.text  }
                ]}  
                keyboardType="numeric"
                value={form.heightCm} 
                onChangeText={(v)=>setForm(f=>({...f, heightCm:v}))} 
                placeholderTextColor={(colors as any)?.mutedText ?? '#999'} 
                />
      
              <AppText variant="ag10" color={(colors as any)?.text}><Text>Peso (kg)</Text></AppText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: (colors as any)?.mealRowBg, color: (colors as any)?.text } 
                ]}
                keyboardType="numeric"
                value={form.weightKg}
                onChangeText={(v) => setForm(f => ({ ...f, weightKg: v }))}
                placeholderTextColor={(colors as any)?.mutedText ?? '#999'} 
              />
              <View>
            </View>
          <Pressable disabled={isSaving} onPress={save} style={[styles.saveBtn, { backgroundColor: (colors as any)?.addBtnBg, opacity: isSaving ? 0.6 : 1 }]}><AppText variant="ag9" color={(colors as any)?.white}><Text>Guardar Cambios</Text></AppText></Pressable>
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
        <KeyValueBox label="Género" value={
          gender === 'male' ? 'Masculino' : gender === 'female' ? 'Femenino' : gender === 'other' ? 'Otro' : (gender || 'Sin definir')
        } />
        <KeyValueBox label="Altura" value={`${heightCm} cm`} />
        <KeyValueBox label="Peso Actual" value={`${weightKg} kg`} />
      </View>
      <BMIBlock bmi={bmi} label={bmiLabel} />
    </SectionCard>
  );
});

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: s(16), marginBottom: s(12) },
  input: {  borderRadius: s(12), padding: s(12), marginTop: s(6) },
  saveBtn: { borderRadius: s(28), paddingVertical: s(14), alignItems: 'center', marginTop: s(10) },
});
