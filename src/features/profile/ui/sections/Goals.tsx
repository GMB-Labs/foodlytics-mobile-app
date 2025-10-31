import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, TextInput } from "react-native";
import AppText from "@/src/shared/ui/components/Typography";
import SectionCard from "../pieces/SectionCard";
import { COLORS, s } from "../tokens";
import GoalsIcon from "@/assets/icons/profile/goalsicon.svg";
import ActivityIcon from "@/assets/icons/activity-icon.svg";
import EditAction from '../pieces/EditAction';

export default React.memo(function Goals({
  goalWeight, activity, dailyCalories, onEdit, isEditing, onSave, onCancel,
}: {
  goalWeight: number; activity: string; dailyCalories: number; onEdit: () => void; isEditing?: boolean;
  onSave?: (data: { goalWeight?: number; activity?: string; dailyCalories?: number }) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState({ goalWeight: String(goalWeight || ''), activity: activity || '', dailyCalories: String(dailyCalories || '') });
  const [showOptions, setShowOptions] = useState(false);
  const activityOptions = ['Sedentario','Ligero','Moderado','Activo','Muy activo'];

  useEffect(()=>{
    if(isEditing) setForm({ goalWeight: String(goalWeight || ''), activity: activity || '', dailyCalories: String(dailyCalories || '') });
  }, [isEditing]);

  function save(){
    onSave && onSave({ goalWeight: Number(form.goalWeight), activity: form.activity, dailyCalories: Number(form.dailyCalories) });
  }

  if(isEditing){
    return (
      <SectionCard
        title="Objetivos"
        right={<Pressable onPress={onCancel}><AppText variant="ag9" color={COLORS.brandA}>Cancelar</AppText></Pressable>}
      >
        <View style={{ gap: s(12) }}>
          <AppText variant="ag10">Peso Objetivo (kg)</AppText>
          <TextInput style={styles.input} keyboardType="numeric" value={form.goalWeight} onChangeText={(v)=>setForm(f=>({...f, goalWeight:v}))} />

          <AppText variant="ag10">Nivel de Actividad</AppText>
          <View>
            <Pressable onPress={()=>setShowOptions(s => !s)} style={styles.select}><AppText variant="ag9">{form.activity || 'Seleccionar'}</AppText></Pressable>
            {showOptions && (
              <View style={styles.options}>
                {activityOptions.map(opt=> (
                  <Pressable key={opt} onPress={()=>{ setForm(f=>({...f, activity: opt})); setShowOptions(false); }} style={styles.optionItem}><AppText variant="ag9">{opt}</AppText></Pressable>
                ))}
              </View>
            )}
          </View>

          <AppText variant="ag10">Calorías Diarias</AppText>
          <TextInput style={styles.input} keyboardType="numeric" value={form.dailyCalories} onChangeText={(v)=>setForm(f=>({...f, dailyCalories:v}))} />

          <Pressable onPress={save} style={styles.saveBtn}><AppText variant="ag9" color="white">Guardar Cambios</AppText></Pressable>
        </View>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Objetivos"
      right={<EditAction onPress={onEdit} />}
    >
      <View style={styles.row}>
        <View style={styles.item}>
          <View style={styles.head}>
            <GoalsIcon width={16} height={16} />
            <AppText variant="ag10" color={COLORS.subtext}>Peso Objetivo</AppText>
          </View>
          <AppText variant="ag6" color={COLORS.text}>{goalWeight} kg</AppText>
        </View>
        <View style={styles.item}>
          <View style={styles.head}>
            <ActivityIcon width={16} height={16} strokeWidth={1.5} />
            <AppText variant="ag10" color={COLORS.subtext}>Actividad</AppText>
          </View>
          <AppText variant="ag9" color={COLORS.text}>{activity}</AppText>
        </View>
      </View>
      <View style={styles.cal}>
        <AppText variant="ag10" color={COLORS.subtext}>Meta Diaria de Calorías</AppText>
        <AppText variant="ag3" color="#282828">{dailyCalories} kcal</AppText>
      </View>
    </SectionCard>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: s(16), marginTop: s(4), marginBottom: s(16) },
  item: { backgroundColor: COLORS.chipBg, padding: s(12), borderRadius: s(20), flex: 1, gap: s(4) },
  head: { flexDirection: "row", alignItems: "center", gap: s(8) },
  cal: { backgroundColor: COLORS.chipBg, padding: s(12), borderRadius: s(20), gap: s(4) },
  input: { backgroundColor: COLORS.chipBg, borderRadius: s(12), padding: s(12), marginTop: s(6) },
  select: { backgroundColor: COLORS.chipBg, borderRadius: s(12), padding: s(12), marginTop: s(6) },
  options: { backgroundColor: '#fff', borderRadius: s(8), marginTop: s(8), overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  optionItem: { padding: s(12) },
  saveBtn: { backgroundColor: COLORS.brandA, borderRadius: s(28), paddingVertical: s(14), alignItems: 'center', marginTop: s(10) },
});
