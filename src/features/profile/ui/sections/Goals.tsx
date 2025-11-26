import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, TextInput, Text } from "react-native";
import AppText from "@/src/shared/ui/components/Typography";
import SectionCard from "../components/SectionCard";
import GoalsIcon from "@/assets/icons/profile/goalsicon.svg";
import ActivityIcon from "@/assets/icons/activity-icon.svg";
import EditAction from '../components/EditAction';
import { s } from "../tokens";
import { useTheme } from '@/src/shared/styles/useTheme';

type Props = {
  goalWeight: number;
  activity: string;
  goalType?: string;
  dailyCalories: number;
  onEdit: () => void;
  isEditing?: boolean;
  onSave?: (data: { goalWeight?: number; activity?: string; dailyCalories?: number; goalType?: string }) => void;
  onCancel?: () => void;
  isSaving?: boolean;
};

const ACTIVITY_MAP: Array<{ key: string; label: string }> = [
  { key: 'sedentary', label: 'Sedentario' },
  { key: 'light', label: 'Ligero' },
  { key: 'moderate', label: 'Moderado' },
  { key: 'active', label: 'Activo' },
  { key: 'veryActive', label: 'Muy activo' },
];

const GOAL_TYPE_MAP: Array<{ key: string; label: string }> = [
  { key: 'definition', label: 'Definición' },
  { key: 'maintenance', label: 'Mantenimiento' },
  { key: 'buling', label: 'Volumen' },
];

function activityLabel(key?: string) {
  return ACTIVITY_MAP.find((a) => a.key === key)?.label ?? (key || 'Sin definir');
}

function goalTypeLabel(key?: string) {
  return GOAL_TYPE_MAP.find((g) => g.key === key)?.label ?? (key || 'Sin definir');
}

export default React.memo(function Goals({
  goalWeight, activity, goalType, dailyCalories, onEdit, isEditing, onSave, onCancel, isSaving,
}: Props) {
  const [form, setForm] = useState({
    goalWeight: String(goalWeight || ''),
    activity: activity || '', // backend key
    goalType: goalType || '',
    dailyCalories: String(dailyCalories || ''),
  });
  const [showActivityOptions, setShowActivityOptions] = useState(false);
  const [showGoalTypeOptions, setShowGoalTypeOptions] = useState(false);
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors as any), [colors]);

  useEffect(() => {
    if (isEditing) {
      setForm({
        goalWeight: String(goalWeight || ''),
        activity: activity || '',
        goalType: goalType || '',
        dailyCalories: String(dailyCalories || ''),
      });
    }
  }, [isEditing, goalWeight, activity, dailyCalories]);

  function save() {
    onSave && onSave({
      goalWeight: Number(form.goalWeight),
      activity: form.activity,
      dailyCalories: Number(form.dailyCalories),
      goalType: form.goalType,
    });
  }

  if (isEditing) {
    return (
      <SectionCard
        title="Objetivos"
        right={<Pressable onPress={onCancel}><AppText variant="ag9" color={(colors as any)?.brandA}>Cancelar</AppText></Pressable>}
      >
        <View style={{ gap: s(12) }}>
          <AppText variant="ag10" color={(colors as any)?.text}><Text>Peso Objetivo (kg)</Text></AppText>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: (colors as any)?.mealRowBg, color: (colors as any)?.text },
            ]}
            keyboardType="numeric"
            value={form.goalWeight}
            onChangeText={(v) => setForm((f) => ({ ...f, goalWeight: v }))}
          />

          <AppText variant="ag10" color={(colors as any)?.text}><Text>Nivel de Actividad</Text></AppText>
          <View>
            <Pressable onPress={() => { setShowActivityOptions((s) => !s); setShowGoalTypeOptions(false); }} style={[styles.select, { backgroundColor: (colors as any)?.mealRowBg }]}>
              <AppText variant="ag9" color={(colors as any)?.text}><Text>{activityLabel(form.activity) || 'Seleccionar'}</Text></AppText>
            </Pressable>
            {showActivityOptions && (
              <View style={styles.options}>
                {ACTIVITY_MAP.map((opt) => (
                  <Pressable
                    key={opt.key}
                    onPress={() => {
                      setForm((f) => ({ ...f, activity: opt.key }));
                      setShowActivityOptions(false);
                    }}
                    style={styles.optionItem}
                  >
                    <AppText variant="ag9" color={(colors as any)?.muted}>{opt.label}</AppText>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <AppText variant="ag10" color={(colors as any)?.text}><Text>Tipo de objetivo</Text></AppText>
          <View>
            <Pressable onPress={() => { setShowGoalTypeOptions((s) => !s); setShowActivityOptions(false); }} style={[styles.select, { backgroundColor: (colors as any)?.mealRowBg }]}>
              <AppText variant="ag9" color={(colors as any)?.text}><Text>{goalTypeLabel(form.goalType) || 'Seleccionar'}</Text></AppText>
            </Pressable>
            {showGoalTypeOptions && (
            <View style={styles.options}>
              {GOAL_TYPE_MAP.map((g) => (
                <Pressable key={g.key} onPress={() => { setForm(f => ({ ...f, goalType: g.key })); setShowGoalTypeOptions(false); }} style={styles.optionItem}>
                  <AppText variant="ag9" color={(colors as any)?.muted}>{g.label}</AppText>
                </Pressable>
              ))}
            </View>
            )}
          </View>

          <Pressable disabled={isSaving} onPress={save} style={[styles.saveBtn, { backgroundColor: (colors as any)?.addBtnBg, opacity: isSaving ? 0.6 : 1 }]}> 
            <AppText variant="ag9" color={(colors as any)?.white}><Text>Guardar Cambios</Text></AppText>
          </Pressable>
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
            <AppText variant="ag10" color={(colors as any)?.muted}><Text>Peso Objetivo</Text></AppText>
          </View>
          <AppText variant="ag6" color={(colors as any)?.text}>{`${goalWeight} kg`}</AppText>
        </View>
        <View style={styles.item}>
          <View style={styles.head}>
            <ActivityIcon width={16} height={16} strokeWidth={1.5} color={(colors as any)?.muted} />
            <AppText variant="ag10" color={(colors as any)?.muted}><Text>Actividad</Text></AppText>
          </View>
          <AppText variant="ag9" color={(colors as any)?.text}>{activityLabel(activity)}</AppText>
        </View>
      </View>
      <View style={styles.goalTypeBox}>
        <AppText variant="ag10" color={(colors as any)?.muted}><Text>Tipo de objetivo</Text></AppText>
        <AppText variant="ag9" color={(colors as any)?.text}><Text>{goalTypeLabel(goalType)}</Text></AppText>
      </View>
      <View style={styles.cal}>
        <AppText variant="ag10" color={(colors as any)?.muted}><Text>Meta diaria de calorias</Text></AppText>
        <AppText variant="ag3" color={(colors as any)?.text}><Text>{`${dailyCalories} kcal`}</Text></AppText>
      </View>
    </SectionCard>
  );
});

function createStyles(colors: any) {
  return StyleSheet.create({
    row: { flexDirection: "row", gap: s(16), marginTop: s(4), marginBottom: s(16) },
    item: { backgroundColor: colors?.mealRowBg, padding: s(12), borderRadius: s(20), flex: 1, gap: s(4) },
    head: { flexDirection: "row", alignItems: "center", gap: s(8) },
    goalTypeBox: { backgroundColor: colors?.mealRowBg, padding: s(12), borderRadius: s(20), gap: s(4), marginBottom: s(12) },
    cal: { backgroundColor: colors?.mealRowBg, padding: s(12), borderRadius: s(20), gap: s(4) },
    input: { borderRadius: s(12), padding: s(12), marginTop: s(6) },
    select: { borderRadius: s(12), padding: s(12), marginTop: s(6) },
    options: { backgroundColor: colors?.mealRowBg || '#fff', borderRadius: s(8), marginTop: s(8), overflow: 'hidden', borderWidth: 1, borderColor: colors?.border },
    optionItem: { padding: s(12) },
    saveBtn: { borderRadius: s(28), paddingVertical: s(14), alignItems: 'center', marginTop: s(10) },
  });
}
