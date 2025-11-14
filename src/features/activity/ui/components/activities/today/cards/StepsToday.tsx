import React, {useEffect} from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import useSteps from '@/src/shared/hooks/useSteps';
import { useProfile } from '@/src/features/profile/application/useProfile';

type Props = {
  steps?: number;
  stepsGoal?: number;
  onRegisterPress?: () => void;
};

export default function StepsToday({ steps: stepsProp = 0, stepsGoal = 10000 }: Props) {
  const { width } = Dimensions.get('window');
  const designW = 430;
  const scale = Math.min(1, width / designW);
  const s = (n: number) => Math.round(n * scale);

  // For now we keep the permission request as a TODO. This is the right place
  // to ask for pedometer/fitness permissions (expo-sensors / expo-permissions / react-native-permissions).
  useEffect(() => {
    // TODO: Request runtime permission to access step counter / activity data here.
    // Example: use expo-sensors (Pedometer) or react-native-permissions depending on project choice.
  }, []);

  const { available, steps, uploading, pending } = useSteps();
  const { profile } = useProfile();

  // Determine computed goal from activity or prop
  const activityStepsMap: Record<string, number> = {
    Sedentario: 3000,
    Ligero: 4000,
    Moderado: 5000,
    Activo: 6000,
    'Muy activo': 7000,
  };

  const computedGoal = profile?.activity ? (activityStepsMap[profile.activity] ?? stepsGoal) : stepsGoal;

  const effectiveSteps = typeof steps === 'number' && steps > 0 ? steps : stepsProp;
  const stepProgress = Math.min(1, (effectiveSteps || 0) / (computedGoal || stepsGoal));

  // Estimate calories burned from walking: kcal = weightKg * distance_km * factor
  // stride approx = height(cm) * 0.415 (in cm -> convert to meters)
  const strideMeters = profile?.heightCm ? (profile.heightCm * 0.415) / 100 : 0.7; // default 0.7m
  const distanceKm = (effectiveSteps * strideMeters) / 1000;
  const kcalPerKgPerKm = 1.0; // approximation
  const caloriesBurned = profile?.weightKg ? Math.round(profile.weightKg * distanceKm * kcalPerKgPerKm) : 0;

  return (
    <View>
      <View style={styles.stepsCard}>
        <View style={styles.stepsLeft}>
          <View style={styles.shoeIconBox}>
            <AppText>👟</AppText>
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <AppText variant="ag7" color="#1A1A1A">Pasos Hoy</AppText>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <AppText variant="ag9" color="#6A7282">{caloriesBurned} kcal</AppText>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${stepProgress * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.stepsRight}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AppText variant="ag2" color="#2FCCAC">{String(effectiveSteps)}</AppText>
            {uploading ? <ActivityIndicator size="small" color="#2FCCAC" /> : null}
          </View>
          <AppText variant="ag10" color="#6A7282">
            Meta: {(computedGoal || stepsGoal).toLocaleString()}
          </AppText>
          {stepProgress >= 1 && <AppText variant="ag10" color="#2FCCAC">Meta alcanzada</AppText>}
          {pending ? <AppText variant="ag10" color="#6A7282">Pendiente: {pending}</AppText> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    paddingBottom: 24,
  },
  stepsLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  shoeIconBox: { width: 48, height: 48, borderRadius: 20, backgroundColor: 'rgba(47,204,172,0.1)', alignItems: 'center', justifyContent: 'center' },
  stepsRight: { alignItems: 'flex-end', marginLeft: 12 },
  progressBarBg: { height: 12, backgroundColor: '#F3F4F6', borderRadius: 999, marginTop: 12, overflow: 'hidden' },
  progressBarFill: { height: 12, backgroundColor: '#2FCCAC', borderRadius: 999 },
  
});
