import React from 'react';
import { ScrollView, View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/src/shared/styles/useTheme';
import { useRouter, usePathname } from 'expo-router';
import ActivityHeader from '@/src/shared/ui/components/ActivityHeader';
import ActivitySummaryCombined from '@/src/features/activity/ui/components/activities/today/cards/ActivitySummary';
import ActivitiesToday from '@/src/features/activity/ui/components/activities/today/ActivitiesToday';
import StreakWidget from '@/src/features/activity/ui/components/activities/month/StreakWidget';
import usePhysicalActivity from '@/src/features/activity/application/usePhysicalActivity';
import * as activitiesLocalApi from '@/src/features/activity/infrastructure/activitiesApi';
import { useCallback } from 'react';

export default function ActivityScreen() {
  const router = useRouter();
  const { width } = Dimensions.get('window');
  const designW = 430;
  const scale = Math.min(1, width / designW);
  const s = (n: number) => Math.round(n * scale);
  const { colors } = useTheme();
  const theme = colors as any;
  const styles = createStyles(s, theme);

  const { today, month } = usePhysicalActivity();
  const handleDeleteActivity = useCallback(async (id: string) => {
    try {
      // Optimistic UI: delete from local storage so preview/dev flows still work
      await activitiesLocalApi.deleteActivityById(id);
      // refetch today's list and month map to keep UI consistent
      try { await today.refetch({ force: true }); } catch (e) { /* ignore */ }
      try { await month.refetch({ force: true }); } catch (e) { /* ignore */ }
    } catch (err) {
      // swallow for now; in a real app show an error toast
      console.error('[Activity] delete failed', err);
    }
  }, [today, month]);
  const calories = today.totalCalories;
  const minutes = today.totalMinutes;
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
          <ActivitySummaryCombined  onRegisterPress={openAddActivity} />
          
          <ActivitiesToday
            activities={today.activities}
            isLoading={today.fetching}
            errorMessage={today.error}
            preview={!today.activities.length && !today.fetching}
            onRegisterPress={openAddActivity}
            onDeleteActivity={handleDeleteActivity}
          />

          {/* Placeholder streak widget (heatmap) */}

          <StreakWidget
            records={Object.keys(month.records).length ? month.records : undefined}
            preview={!Object.keys(month.records).length}
          />

        </View>
      </ScrollView>
    </View>
  );
}
const createStyles = (s: (n:number)=>number, theme: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg ?? '#F9FAFB' },
  scroll: { paddingBottom: s(120) },
  container: { paddingHorizontal: s(25), paddingTop: s(24), gap: s(24) },
});

// create runtime styles inside module scope to be replaced at render time
// Component will call createStyles(s, theme) to get styles
