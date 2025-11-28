import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppText from '@/src/shared/ui/components/Typography';
import { useTheme } from '@/src/shared/styles/useTheme';
import useSteps from '@/src/shared/hooks/useSteps';
import useProfile from '@/src/features/profile/application/useProfile';
import ShoeIcon from '@/assets/icons/activity/shoeIcon.svg';
import LandPlotIcon from '@/assets/icons/activity/landPlotIcon.svg';
import { ASYNC_STORAGE_KEYS } from '@/src/shared/constants/storage';

type Props = {
  onRegisterPress?: () => void;
};

export default function ActivitySummaryCombined({ onRegisterPress }: Props) {
  const { width } = Dimensions.get('window');
  const designW = 430;
  const scale = Math.min(1, width / designW);
  const s = (n: number) => Math.round(n * scale);

  const { colors } = useTheme();
  const theme = colors as any;
  const styles = createStyles(s, theme);

  const { available, steps, uploading, pending, lastStepISO } = useSteps();
  const { profile } = useProfile();

  const activityStepsMap: Record<string, number> = {
    Sedentario: 3000,
    Ligero: 4000,
    Moderado: 5000,
    Activo: 6000,
    'Muy activo': 7000,
  };
  const computedGoal = profile?.activity ? (activityStepsMap[profile.activity] ?? 10000) : 10000;

  const effectiveSteps = typeof steps === 'number' && steps > 0 ? steps : 0;
  const stepProgress = Math.min(1, (effectiveSteps || 0) / (computedGoal || 10000));

  const strideMeters = profile?.heightCm ? (profile.heightCm * 0.415) / 100 : 0.7;
  const distanceKm = (effectiveSteps * strideMeters) / 1000;
  const kcalPerKgPerKm = 1.0;
  const caloriesBurned = profile?.weightKg ? Math.round(profile.weightKg * distanceKm * kcalPerKgPerKm) : 0;

  const now = new Date();
  const hours = now.getHours();
  const period = hours >= 12 ? 'p.m.' : 'a.m.';
  const displayHours = hours % 12 || 12;
  const timeDisplay = `${displayHours} - ${displayHours + 1}${period}`;

  // If the pedometer reports a last step time, use that for the Distancia card
  let distanceTimeDisplay = timeDisplay;
  // first preference: last stored activity with distance
  const [lastStoredActivity, setLastStoredActivity] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.ACTIVITIES);
        if (!raw) return;
        const list = JSON.parse(raw) as any[];
        if (!Array.isArray(list) || list.length === 0) return;
        // find last activity that likely includes distance (simple heuristic)
        const DISTANCE_TYPES = ['Correr', 'Ciclismo', 'Caminata', 'Caminar', 'Running', 'Walking'];
        const last = [...list].reverse().find((a) => {
          if (!a) return false;
          if (a.type && DISTANCE_TYPES.includes(a.type)) return true;
          // fallback: if duration >= 10 minutes, consider it a distance session
          return (a.duration || 0) >= 10;
        });
        if (mounted && last) setLastStoredActivity(last);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (lastStoredActivity && (lastStoredActivity.startTime || lastStoredActivity.createdAt)) {
    try {
      const timestamp = lastStoredActivity.startTime || lastStoredActivity.createdAt;
      const startDate = new Date(timestamp);
      const durMin = Number(lastStoredActivity.duration) || 0;
      const endDate = new Date(startDate.getTime() + durMin * 60 * 1000);
      
      const startH = startDate.getHours();
      const endH = endDate.getHours();
      const startPeriod = startH >= 12 ? 'p.m.' : 'a.m.';
      const endPeriod = endH >= 12 ? 'p.m.' : 'a.m.';
      const startH12 = startH % 12 || 12;
      const endH12 = endH % 12 || 12;
      
      // Formato: "2 - 3a.m." o "11a.m. - 2p.m."
      if (startPeriod === endPeriod) {
        distanceTimeDisplay = `${startH12} - ${endH12}${startPeriod}`;
      } else {
        distanceTimeDisplay = `${startH12}${startPeriod} - ${endH12}${endPeriod}`;
      }
    } catch (e) {
      // fallback below to lastStepISO or now
    }
  } else if (lastStepISO) {
    try {
      const d = new Date(lastStepISO);
      const h = d.getHours();
      const p = h >= 12 ? 'p.m.' : 'a.m.';
      const dh = h % 12 || 12;
      distanceTimeDisplay = `${dh} - ${dh + 1}${p}`;
    } catch (e) {
      // fallback to current hour
    }
  }

  const cardHeight = s(220);

  return (
    <View style={[styles.row, { minHeight: cardHeight }] }>
      <View style={[styles.card, { marginRight: s(12), minHeight: cardHeight }] }>
        <View style={styles.headerRow}>
          <ShoeIcon width={s(24)} height={s(24)} stroke={theme.brandA ?? '#2FCCAC'} />
          <AppText variant="ag7" color={theme.text ?? '#1A1A1A'} style={styles.title}>Pasos</AppText>
        </View>
        
        <View style={styles.contentColumn}>
          <View style={styles.stepsRow}>
            <AppText style={styles.stepsNumber} color={theme.brandA ?? '#2FCCAC'}>{effectiveSteps.toLocaleString()}</AppText>
            <AppText variant="ag9" color={theme.subtext ?? '#6A7282'} style={styles.pasosLabel}>pasos</AppText>
          </View>

          <View style={styles.statsColumn}>
            <AppText variant="ag9" color={theme.subtext ?? '#6A7282'} style={styles.kcalText}>{caloriesBurned} kcal aprox.</AppText>
            <AppText variant="ag10" color={theme.subtext ?? '#6A7282'} style={styles.metaText}>Meta: { (computedGoal || 10000).toLocaleString() }</AppText>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressTrack, { backgroundColor: 'rgba(47,204,172,0.12)' }]}>
              <View style={[styles.progressFill, { width: `${Math.round(stepProgress * 100)}%`, backgroundColor: theme.brandA ?? '#2FCCAC' }]} />
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.card, { minHeight: cardHeight }] }>
        <View style={styles.headerRow}>
          <LandPlotIcon width={s(24)} height={s(24)} stroke="#ED6149" />
          <AppText variant="ag7" color={theme.text ?? '#1A1A1A'} style={styles.title}>Distancia</AppText>
        </View>
        
        <View style={styles.contentColumn}>
          <AppText style={[styles.stepsNumber, { color: '#ED6149' }]}>{distanceKm.toFixed(1)} km</AppText>
          
          <View style={styles.statsColumn}>
            <AppText variant="ag9" color={theme.subtext ?? '#6A7282'} style={styles.kcalText}>{distanceTimeDisplay}</AppText>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressTrack, { backgroundColor: 'rgba(237,97,73,0.12)' }]}>
              <View style={[styles.progressFill, { width: `${Math.round(Math.min(1, distanceKm / 5) * 100)}%`, backgroundColor: '#ED6149' }]} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const createStyles = (s: (n:number)=>number, theme: any) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'stretch' },
  card: {
    backgroundColor: theme.mealsCard ?? '#FFFFFF',
    borderRadius: s(16),
    padding: s(18),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    flex: 1,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: s(8), marginBottom: s(16) },
  title: { fontSize: s(16), lineHeight: s(24), fontWeight: '500' },
  contentColumn: { flex: 1, justifyContent: 'space-between' },
  centerColumn: { alignItems: 'flex-start', flex: 1, justifyContent: 'center' },
  circleContainer: { width: s(94), height: s(94), position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: s(16), alignSelf: 'center' },
  circleBackground: { position: 'absolute', width: s(94), height: s(94), borderRadius: s(47) },
  iconCircle: { width: s(80), height: s(80), borderRadius: s(40), backgroundColor: theme.mealsCard ?? '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  stepsRow: { flexDirection: 'row', alignItems: 'baseline', gap: s(2) },
  stepsNumber: { fontSize: s(30), lineHeight: s(36), fontWeight: '600' },
  pasosLabel: { fontSize: s(12), lineHeight: s(16), color: theme.subtext ?? '#6A7282' },
  statsColumn: { alignSelf: 'stretch', marginTop: s(8), marginBottom: s(12) },
  kcalText: { fontSize: s(16), lineHeight: s(22), marginTop: s(-3) },
  metaText: { fontSize: s(14), lineHeight: s(20), marginTop: s(4) },
  progressBarContainer: { marginTop: 'auto' },
  progressTrack: { height: s(15), borderRadius: s(4), overflow: 'hidden' },
  progressFill: { height: s(15), borderRadius: s(4) },
});
