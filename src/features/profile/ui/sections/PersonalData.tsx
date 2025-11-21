import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, TextInput } from "react-native";
import AppText from "@/src/shared/ui/components/Typography";
import SectionCard from "../components/SectionCard";
import KeyValueBox from "../components/KeyValueBox";
import BMIBlock from "../components/BMIBlock";
import EditAction from '../components/EditAction';
import { s } from "../tokens";
import { useTheme } from '@/src/shared/styles/useTheme';

export default React.memo(function PersonalData({
  age, gender, heightCm, weightKg, bmi, bmiLabel, onEdit, isEditing, onSave, onCancel,
}: {
  age: number; gender: string; heightCm: number; weightKg: number;
  bmi: number; bmiLabel?: string; onEdit: () => void; isEditing?: boolean;
  onSave?: (data: { age?: number; gender?: string; heightCm?: number; weightKg?: number }) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState({ age: String(age || ''), gender: gender || '', heightCm: String(heightCm || ''), weightKg: String(weightKg || '') });
  const { colors } = useTheme();

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
        right={<Pressable onPress={onCancel}><AppText variant="ag9" color={(colors as any)?.brandA}>Cancelar</AppText></Pressable>}
      >
        <View style={{ gap: s(12) }}>
              <AppText variant="ag10" color={(colors as any)?.text} >Altura (cm)</AppText>
               <TextInput 
               style={[styles.input,
                { backgroundColor: (colors as any)?.mealRowBg , color: (colors as any)?.text  }
                ]}  
                keyboardType="numeric"
                value={form.heightCm} 
                onChangeText={(v)=>setForm(f=>({...f, heightCm:v}))} 
                placeholderTextColor={(colors as any)?.mutedText ?? '#999'} 
                />
      
              <AppText variant="ag10" color={(colors as any)?.text}>Peso (kg)</AppText>
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
          <Pressable onPress={save} style={[styles.saveBtn, { backgroundColor: (colors as any)?.addBtnBg }]}><AppText variant="ag9" color={(colors as any)?.white}>Guardar Cambios</AppText></Pressable>
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
  input: {  borderRadius: s(12), padding: s(12), marginTop: s(6) },
  saveBtn: { borderRadius: s(28), paddingVertical: s(14), alignItems: 'center', marginTop: s(10) },
});
