import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import { useTheme } from '@/src/shared/styles/useTheme';
import ProgressIcon from '@/assets/icons/activity/progressIcon.svg';
import ActivitiesStatsCard from './cards/ActivitiesStatsCard';
import ActivityCard from './cards/ActivityCard';
import type { ActivityListItem } from '@/src/features/activity/application/usePhysicalActivity';

type Props = {
  activities?: ActivityListItem[];
  preview?: boolean;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRegisterPress?: () => void;
  onDeleteActivity?: (id: string) => void;
};

const PREVIEW_ACTIVITIES: ActivityListItem[] = [
];

export default function ActivitiesToday({
  activities,
  preview = true,
  isLoading,
  errorMessage,
  onRegisterPress,
  onDeleteActivity,
}: Props) {
  const { colors } = useTheme();
  const theme = colors as any;
  const styles = createStyles(theme);
  const cardStyles = createCardStyles(theme);

  const list = activities && activities.length > 0
    ? activities
    : preview
      ? PREVIEW_ACTIVITIES
      : [];

  return (
    <View style={{ marginTop: 2 }}>
      <View style={{ marginBottom: 16 }}>
            <TouchableOpacity activeOpacity={0.9} onPress={onRegisterPress} style={cardStyles.registerBtn}>
              <AppText
                variant="ag7"
                color={theme.primaryOnBrand ?? '#FFFFFF'}
                children="+  Registrar Actividad"
              />
            </TouchableOpacity>
      </View>

      <AppText
        variant="ag7"
        color={theme.text ?? '#1A1A1A'}
        children="Actividades de Hoy"
      />

      {isLoading ? (
        <View style={[styles.emptyCard, { flexDirection: 'row' }] }>
          <ActivityIndicator size="small" color={theme.brandA ?? '#2FCCAC'} />
          <AppText
            variant="ag9"
            color={theme.subtext ?? '#6A7282'}
            style={{ marginLeft: 12 }}
            children="Cargando tus actividades…"
          />
        </View>
      ) : list.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <ProgressIcon width={32} height={32} strokeWidth={2.667} color={theme.subtext ?? '#99A1AF'} />
          </View>
          <AppText
            variant="ag7"
            color={theme.muted ?? '#4A5565'}
            style={{ marginTop: 12, textAlign: 'center' }}
            children={errorMessage || 'No hay actividades registradas'}
          />
          {!errorMessage && (
            <AppText
              variant="ag9"
              color={theme.subtext ?? '#6A7282'}
              style={{ marginTop: 8, textAlign: 'center' }}
              children="¡Comienza a moverte!"
            />
          )}
        </View>
      ) : (
        <View style={{ marginTop: 12 }}>
          <View style={{ height: 12 }} />
          {list.map((a) => (
            <ActivityCard key={a.id} activity={a} onDelete={onDeleteActivity} />
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
