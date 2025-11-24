import React, { useRef, useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import { useTheme } from '@/src/shared/styles/useTheme';
import ProgressIcon from '@/assets/icons/activity/progressIcon.svg';
import ActivitiesStatsCard from './cards/ActivitiesStatsCard';
import ActivityCard from './cards/ActivityCard';
import { useIsFocused } from '@react-navigation/native';
import * as activitiesApi from '@/src/features/activity/infrastructure/activitiesApi';

type Activity = {
  id: string;
  name: string;
  minutes: number;
  intensity: 'Baja' | 'Moderada' | 'Alta';
  calories: number;
};

// sample activities for preview while API isn't connected
const PREVIEW_ACTIVITIES: Activity[] = [
  { id: 'a1', name: 'Correr', minutes: 30, intensity: 'Moderada', calories: 300 },
  { id: 'a2', name: 'Ciclismo', minutes: 20, intensity: 'Alta', calories: 220 },
  { id: 'a3', name: 'Natación', minutes: 10, intensity: 'Baja', calories: 100 },
];

type Props = {
  activities?: Activity[];
  // preview flag to force sample data
  preview?: boolean;
  onRegisterPress?: () => void;
};

// ActivityCard extracted to `components/activities/ActivityCard.tsx`.

export default function ActivitiesToday({ activities, preview = true, onRegisterPress }: Props) {
  const [list, setList] = useState<Activity[]>([]);
  const isFocused = useIsFocused();
  const { colors } = useTheme();
  const theme = colors as any;
  const styles = createStyles(theme);
  const cardStyles = createCardStyles(theme);

  // Load activities from the local API abstraction when the screen mounts
  // or receives focus. If running in preview mode and storage is empty,
  // seed storage with the preview data so subsequent edits persist.
  useEffect(() => {
    let mounted = true;
    async function load() {
      // prefer parent-provided activities when preview is disabled
      if (!preview && activities && activities.length > 0) {
        if (!mounted) return;
        setList(activities);
        return;
      }

      const stored = await activitiesApi.getActivities();
      if (stored && stored.length > 0) {
        if (!mounted) return;
        setList(stored);
        return;
      }

      // no stored activities: if preview requested, seed storage and use
      if (preview) {
        await activitiesApi.saveActivities(PREVIEW_ACTIVITIES as Activity[]);
        if (!mounted) return;
        setList(PREVIEW_ACTIVITIES as Activity[]);
        return;
      }

      // fallback to props or empty
      if (!mounted) return;
      setList(activities || []);
    }

    if (isFocused) load();
    return () => { mounted = false; };
  }, [preview, activities, isFocused]);

  function handleDeleteRequest(id: string) {
    // Ask for confirmation before deleting
    Alert.alert(
      'Eliminar actividad',
      '¿Estás seguro que quieres eliminar esta actividad?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            // Optimistically update UI
            setList((prev) => prev.filter((a) => a.id !== id));

            try {
              // use local API abstraction which persists to AsyncStorage
              await activitiesApi.deleteActivityById(id);
              // reload current list to ensure consistency
              const refreshed = await activitiesApi.getActivities();
              setList(refreshed);
            } catch (e) {
              // ignore for now; in a real app show error to user
            }
          },
        },
      ],
    );
  }

  return (
    <View style={{ marginTop: 2 }}>
      <View style={{ marginBottom: 16 }}>
            <TouchableOpacity activeOpacity={0.9} onPress={onRegisterPress} style={cardStyles.registerBtn}>
              <AppText variant="ag7" color={theme.primaryOnBrand ?? '#FFFFFF'}>+  Registrar Actividad</AppText>
            </TouchableOpacity>
      </View>

      <AppText variant="ag7" color={theme.text ?? '#1A1A1A'}>{`Actividades de Hoy`}</AppText>

      {list.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <ProgressIcon width={32} height={32} strokeWidth={2.667} color={theme.subtext ?? '#99A1AF'} />
          </View>
          <AppText variant="ag7" color={theme.muted ?? '#4A5565'} style={{ marginTop: 12, textAlign: 'center' }}>{`No hay actividades registradas`}</AppText>
          <AppText variant="ag9" color={theme.subtext ?? '#6A7282'} style={{ marginTop: 8, textAlign: 'center' }}>{`¡Comienza a moverte!`}</AppText>
        </View>
      ) : (
        <View style={{ marginTop: 12 }}>
          <View style={{ height: 12 }} />
          {list.map((a) => (
            <ActivityCard key={a.id} activity={a} onDelete={handleDeleteRequest} />
          ))}
          
          <ActivitiesStatsCard activities={list} />

        </View>
      )}
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  emptyCard: { marginTop: 12, backgroundColor: theme.card ?? '#FFFFFF', borderRadius: 16, padding: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  emptyIconCircle: { width: 72, height: 72, borderRadius: 999, backgroundColor: theme.progressBg ?? '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
});

const createCardStyles = (theme: any) => StyleSheet.create({
  card: { marginBottom: 12, backgroundColor: theme.card ?? '#FFFFFF', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  left: { marginRight: 12 },
  iconCircle: { width: 48, height: 48, borderRadius: 20, backgroundColor: theme.icons?.idleBg ?? '#EBFAF7', alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1 },
  rowDetails: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 6, backgroundColor: theme.divider ?? '#D1D5DB', marginHorizontal: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  deleteBtn: { marginLeft: 12, marginBottom: 40},
  registerBtn: { backgroundColor: theme.iconbase ?? '#2FCCAC', borderRadius: 20, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
});
