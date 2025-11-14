import React, { useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import ProgressIcon from '@/assets/icons/activity/progressIcon.svg';
import ActivitiesStatsCard from './cards/ActivitiesStatsCard';
import ActivityCard from './cards/ActivityCard';

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

function intensityColor(intensity: Activity['intensity']) {
  switch (intensity) {
    case 'Alta':
      return '#FFD6D6';
    case 'Moderada':
      return '#FFEBD1';
    case 'Baja':
    default:
      return '#DFF7EC';
  }
}

function intensityTextColor(intensity: Activity['intensity']) {
  switch (intensity) {
    case 'Alta':
      return '#FF6B6B';
    case 'Moderada':
      return '#FF9F1C';
    case 'Baja':
    default:
      return '#2FCCAC';
  }
}

// ActivityCard extracted to `components/activities/ActivityCard.tsx`.

export default function ActivitiesToday({ activities, preview = true, onRegisterPress }: Props) {
  const initial = preview ? PREVIEW_ACTIVITIES : (activities || []);
  const [list, setList] = useState<Activity[]>(initial);

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
          onPress: () => {
            // Optimistically update UI
            setList((prev) => prev.filter((a) => a.id !== id));

            // If we're in preview mode, also update the in-module sample data so
            // the preview remains consistent across remounts during development.
            // NOTE: mutating module-level sample data is only for local preview/testing;
            // when integrating with a backend, the parent or global store should be the
            // source of truth and this mutation should be removed.
            try {
              if (preview) {
                const idx = PREVIEW_ACTIVITIES.findIndex((a) => a.id === id);
                if (idx >= 0) PREVIEW_ACTIVITIES.splice(idx, 1);
              }
            } catch (e) {
              // ignore; preview mutation is best-effort
            }

            // TODO: Integrar con el backend
            // - Llamar a la API REST/GraphQL para eliminar la actividad en el servidor
            // - Manejar errores: si la eliminación falla, mostrar un toast/alert y refrescar/rehacer la lista
            // - Opcional: usar un dispatcher/context para invalidar cache y sincronizar estado global
          },
        },
      ],
    );
  }

  return (
    <View style={{ marginTop: 24 }}>
      <View style={{ marginBottom: 16 }}>
            <TouchableOpacity activeOpacity={0.9} onPress={onRegisterPress} style={cardStyles.registerBtn}>
              <AppText variant="ag7" color="#FFFFFF">+  Registrar Actividad</AppText>
            </TouchableOpacity>
      </View>

      <AppText variant="ag7" color="#1A1A1A">{`Actividades de Hoy`}</AppText>

      {list.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <ProgressIcon width={32} height={32} stroke-width={2.667} color={'#99A1AF'} />
          </View>
          <AppText variant="ag7" color="#4A5565" style={{ marginTop: 12, textAlign: 'center' }}>{`No hay actividades registradas`}</AppText>
          <AppText variant="ag9" color="#6A7282" style={{ marginTop: 8, textAlign: 'center' }}>{`¡Comienza a moverte!`}</AppText>
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

const styles = StyleSheet.create({
  emptyCard: { marginTop: 12, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  emptyIconCircle: { width: 72, height: 72, borderRadius: 999, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
});

const cardStyles = StyleSheet.create({
  card: { marginBottom: 12, backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  left: { marginRight: 12 },
  iconCircle: { width: 48, height: 48, borderRadius: 20, backgroundColor: '#EBFAF7', alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1 },
  rowDetails: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 6, backgroundColor: '#D1D5DB', marginHorizontal: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  deleteBtn: { marginLeft: 12, marginBottom: 40},
  registerBtn: { backgroundColor: '#2FCCAC', borderRadius: 20, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
});
