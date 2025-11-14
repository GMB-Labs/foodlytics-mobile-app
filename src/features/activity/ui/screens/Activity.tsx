import React from 'react';
import { ScrollView, View, StyleSheet, Dimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import ActivityHeader from '@/src/shared/ui/components/ActivityHeader';
import StepsToday from '@/src/features/activity/ui/components/activities/today/cards/StepsToday';
import ActivitiesToday from '@/src/features/activity/ui/components/activities/today/ActivitiesToday';
import StreakWidget from '@/src/features/activity/ui/components/activities/month/StreakWidget';

export default function ActivityScreen() {
  const router = useRouter();
  const { width } = Dimensions.get('window');
  const designW = 430;
  const scale = Math.min(1, width / designW);
  const s = (n: number) => Math.round(n * scale);

  const calories = 0;
  const minutes = 0;
  const pathname = usePathname();

  const openAddActivity = () => {
    const safeFrom = (() => {
      if (!pathname || pathname === '/') return '/(tabs)';
      if (pathname.startsWith('/(auth)') || pathname.startsWith('/login')) return '/(tabs)';
      return pathname;
    })();
    try {
      router.push({ pathname: '/modals/add-activity', params: { from: safeFrom } } as any);
    } catch (err) {
    }
  };

  return (
    <View style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}              
        alwaysBounceVertical={false} 
        overScrollMode="never"       
      >
        <ActivityHeader calories={calories} minutes={minutes} />

        <View style={styles.container}>
          <StepsToday onRegisterPress={openAddActivity} />

          <ActivitiesToday onRegisterPress={openAddActivity} />

          {/* Placeholder streak widget (heatmap) */}

          <StreakWidget />

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { paddingBottom: 100 },
  container: { paddingHorizontal: 24, paddingTop: 24 },
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
  emptyCard: { marginTop: 12, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 999, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
});
