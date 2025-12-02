import React from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import { useTheme } from '@/src/shared/styles/useTheme';
import ActivityHeader from '@/src/shared/ui/components/ActivityHeader';
import DailyGoals from '@/src/features/progress/ui/components/goals/DailyGoals';
import WeeklyCompliance from '@/src/features/progress/ui/components/goals/evolution/WeeklyCompliance';
import WeightEvolution from '@/src/features/progress/ui/components/weight/evolution/WeightEvolution';
import WeightCard from '@/src/features/progress/ui/components/weight/WeightCard';
import useSession from '@/src/shared/hooks/useSession';
import { useRouter, usePathname } from 'expo-router';


export default function ProgressScreen() {
  const { colors } = useTheme();
  const theme = colors as any;
  const router = useRouter();
  const pathname = usePathname();
  // Placeholder data — real implementation should query progress/application layer
  const calories = 0;
  const minutes = 0;

  // Read current profile from session
  const [sessionState] = useSession();
  const currentWeight = typeof sessionState?.user?.weightKg === 'number' ? sessionState.user.weightKg : undefined;
  const desired = (sessionState?.user as any)?.goalWeight ?? (sessionState?.user as any)?.desired_weight_kg;
  const goalType = (sessionState?.user as any)?.goalType;
  const progressToGoal = typeof currentWeight === 'number' && typeof desired === 'number' ? Math.max(0, +(currentWeight - desired).toFixed(1)) : '';

  return (
    <View style={[styles.safe, { backgroundColor: theme.bg ?? '#F9FAFB' }]}>
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
            weight={currentWeight ?? ''}
            unit="kg"
            goalType={goalType}
            progressToGoal={progressToGoal}
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

});
