import React, {useEffect} from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';

type Props = {
  steps?: number;
  stepsGoal?: number;
  onRegisterPress?: () => void;
};

export default function StepsToday({ steps = 0, stepsGoal = 10000, onRegisterPress }: Props) {
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

  const stepProgress = Math.min(1, steps / stepsGoal);

  return (
    <View>
      <View style={styles.stepsCard}>
        <View style={styles.stepsLeft}>
          <View style={styles.shoeIconBox}>
            <AppText>👟</AppText>
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <AppText variant="ag7" color="#1A1A1A">Pasos Hoy</AppText>
            <AppText variant="ag9" color="#6A7282">~225 calorías</AppText>
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
          <AppText variant="ag2" color="#2FCCAC">{String(steps)}</AppText>
          <AppText variant="ag10" color="#6A7282">
            Meta: {stepsGoal.toLocaleString()}
          </AppText>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onRegisterPress}
        style = {styles.registerBtn}
      >
        <AppText variant="ag7" color="#FFFFFF">+  Registrar Actividad</AppText>
      </TouchableOpacity>
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
  registerBtn: {backgroundColor: '#2FCCAC', marginTop: 16, borderRadius: 20, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
});
