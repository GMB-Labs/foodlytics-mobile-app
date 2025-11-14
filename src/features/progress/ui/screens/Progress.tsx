import React from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import ActivityHeader from '@/src/shared/ui/components/ActivityHeader';
import DailyGoals from '@/src/features/progress/ui/components/goals/DailyGoals';
import WeeklyCompliance from '@/src/features/progress/ui/components/goals/evolution/WeeklyCompliance';
import WeightEvolution from '@/src/features/progress/ui/components/weight/evolution/WeightEvolution';
import WeightCard from '@/src/features/progress/ui/components/weight/WeightCard';
import { useRouter, usePathname } from 'expo-router';


export default function ProgressScreen() {
  const router = useRouter();
  const pathname = usePathname();
  // Placeholder data — real implementation should query progress/application layer
  const calories = 0;
  const minutes = 0;

  return (
    <View style={styles.safe}>
      <ScrollView 
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}              // <- evita que se estire hacia abajo en iOS
        alwaysBounceVertical={false} // <- refuerzo extra
        overScrollMode="never"       // <- evita overscroll en Android
      >
      <ActivityHeader calories={calories} minutes={minutes} adherence={14} streak={1} />

        <View style={styles.container}>
          {/* Top card: Peso y Progreso */}
          {/* Weight card component */}
          <WeightCard
            weight={"69.0"}
            unit="kg"
            delta="1.0 kg"
            progressToGoal={"4.0"}
            onRegisterPress={() => {
              const safeFrom = (() => {
                if (!pathname || pathname === '/') return '/(tabs)';
                if (pathname.startsWith('/(auth)') || pathname.startsWith('/login')) return '/(tabs)';
                return pathname;
              })();
              router.push({ pathname: '/modals/add-weight', params: { from: safeFrom } } as any);
            }}
          />

          {/* Weight chart */}
          <WeightEvolution />

          {/* Weekly compliance */}
          <WeeklyCompliance />

          {/* Daily goals (nutrients) */}
          <DailyGoals />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { paddingBottom: 115 },
  container: { paddingHorizontal: 24, paddingTop: 24 },
  placeholderCard: { marginTop: 12, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  topRow: { marginTop: 12 },
  topCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  topCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  registerBtn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  topGrid: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-between' },
  weightBox: { width: '48%' },
  progressBox: { width: '48%' },
});
