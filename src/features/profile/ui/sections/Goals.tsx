import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, TextInput } from "react-native";
import AppText from "@/src/shared/ui/components/Typography";
import SectionCard from "../components/SectionCard";
import GoalsIcon from "@/assets/icons/profile/goalsicon.svg";
import ActivityIcon from "@/assets/icons/activity-icon.svg";
import EditAction from '../components/EditAction';
import { s } from "../tokens";
import { useTheme } from '@/src/shared/styles/useTheme';

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
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors as any), [colors]);

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
        right={<Pressable onPress={onCancel}><AppText variant="ag9" color={(colors as any)?.brandA}>Cancelar</AppText></Pressable>}
      >
        <View style={{ gap: s(12) }}>
          <AppText variant="ag10" color={(colors as any)?.text}>Peso Objetivo (kg)</AppText>
          <TextInput 
             style={[styles.input,
             { backgroundColor: (colors as any)?.mealRowBg , color: (colors as any)?.text  }
             ]}  
             keyboardType="numeric" 
             value={form.goalWeight} 
             onChangeText={(v)=>setForm(f=>({...f, goalWeight:v}))} 
             />

          <AppText variant="ag10" color={(colors as any)?.text}>Nivel de Actividad</AppText>
          <View>
            <Pressable onPress={()=>setShowOptions(s => !s)} style={[styles.select, { backgroundColor: (colors as any)?.mealRowBg}]}><AppText variant="ag9" color={(colors as any)?.text}>{form.activity || 'Seleccionar'}</AppText></Pressable>
            {showOptions && (
              <View style={styles.options}>
                {activityOptions.map(opt=> (
                  <Pressable key={opt} onPress={()=>{ setForm(f=>({...f, activity: opt})); setShowOptions(false); }} style={styles.optionItem}><AppText variant="ag9" color={(colors as any)?.muted} >{opt}</AppText></Pressable>
                ))}
              </View>
            )}
          </View>

          <Pressable onPress={save} style={[styles.saveBtn, { backgroundColor: (colors as any)?.addBtnBg }]}><AppText variant="ag9" color={(colors as any)?.white}>Guardar Cambios</AppText></Pressable>
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
            <GoalsIcon width={16} height={16} color={(colors as any)?.brandA} />
            <AppText variant="ag10" color={(colors as any)?.muted}>Peso Objetivo</AppText>
          </View>
          <AppText variant="ag6" color={(colors as any)?.text}>{goalWeight} kg</AppText>
        </View>
        <View style={styles.item}>
          <View style={styles.head}>
            <ActivityIcon width={16} height={16} strokeWidth={1.5} color={(colors as any)?.muted} />
            <AppText variant="ag10" color={(colors as any)?.muted}>Actividad</AppText>
          </View>
          <AppText variant="ag9" color={(colors as any)?.text}>{activity}</AppText>
        </View>
      </View>
      <View style={styles.cal}>
        <AppText variant="ag10" color={(colors as any)?.muted}>Meta Diaria de Calorías</AppText>
        <AppText variant="ag3" color={(colors as any)?.text}>{dailyCalories} kcal</AppText>
      </View>
    </SectionCard>
  );
});
function createStyles(colors: any) {
  return StyleSheet.create({
    row: { flexDirection: "row", gap: s(16), marginTop: s(4), marginBottom: s(16) },
    item: { backgroundColor: colors?.mealRowBg, padding: s(12), borderRadius: s(20), flex: 1, gap: s(4) },
    head: { flexDirection: "row", alignItems: "center", gap: s(8) },
    cal: { backgroundColor: colors?.mealRowBg, padding: s(12), borderRadius: s(20), gap: s(4) },
    input: { backgroundColor: colors?.mealRowBg, borderRadius: s(12), padding: s(12), marginTop: s(6), color: colors?.text },
    select: { borderRadius: s(12), padding: s(12), marginTop: s(6) },
    options: {  backgroundColor: colors?.mealRowBg || '#fff', borderRadius: s(8), marginTop: s(8), overflow: 'hidden', borderWidth: 1, borderColor: colors?.border },
    optionItem: { padding: s(12) },
    saveBtn: { borderRadius: s(28), paddingVertical: s(14), alignItems: 'center', marginTop: s(10) },
  });
}
