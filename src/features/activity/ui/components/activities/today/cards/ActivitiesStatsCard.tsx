import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import { useTheme } from '@/src/shared/styles/useTheme';

type Activity = {
  id: string;
  name: string;
  minutes: number;
  intensity: string;
  calories: number;
};

type Props = {
  activities: Activity[];
};

export default function ActivitiesStatsCard({ activities }: Props) {
  const totalActivities = activities.length;
  const totalCalories = activities.reduce((s, a) => s + (a.calories || 0), 0);
  const avgPerSession = totalActivities > 0 ? Math.round(totalCalories / totalActivities) : 0;

  const freq: Record<string, number> = {};
  activities.forEach((a) => {
    freq[a.name] = (freq[a.name] || 0) + 1;
  });
  const favorite = Object.keys(freq).length ? Object.entries(freq).sort(([, a], [, b]) => b - a)[0][0] : '-';

  const { colors } = useTheme();
  const theme = colors as any;
  const styles = createStyles(theme);

  return (
    <View style={styles.card}>
      <AppText
        variant="ag7"
        color={theme.text ?? '#0F172A'}
        children="Estadísticas de actividad"
      />

      <View style={{ height: 12 }} />

      <View style={styles.row}>
        <AppText
          variant="ag9"
          color={theme.subtext ?? '#9CA3AF'}
          children="Total actividades"
        />
        <AppText
          variant="ag8"
          color={theme.text ?? '#0F172A'}
          children={`${totalActivities}`}
        />
      </View>

      <View style={styles.row}>
        <AppText
          variant="ag9"
          color={theme.subtext ?? '#9CA3AF'}
          children="Calorías quemadas (total)"
        />
        <AppText
          variant="ag8"
          color={theme.text ?? '#0F172A'}
          children={`${totalCalories} kcal`}
        />
      </View>

      <View style={styles.row}>
        <AppText
          variant="ag9"
          color={theme.subtext ?? '#9CA3AF'}
          children="Promedio por sesión"
        />
        <AppText
          variant="ag8"
          color={theme.text ?? '#0F172A'}
          children={`${avgPerSession} kcal`}
        />
      </View>

      <View style={styles.row}>
        <AppText
          variant="ag9"
          color={theme.subtext ?? '#9CA3AF'}
          children="Actividad favorita"
        />
        <AppText
          variant="ag8"
          color={theme.text ?? '#0F172A'}
          children={`${favorite}`}
        />
      </View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  card: {
    marginTop: 12,
    backgroundColor: theme.mealsCard ?? '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
});
