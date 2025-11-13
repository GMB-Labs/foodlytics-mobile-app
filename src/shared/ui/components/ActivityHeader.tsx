import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from '@/src/shared/ui/components/Typography';
import { useRouter, useSegments } from 'expo-router';
import ActivityIcon from '@/assets/icons/activity-icon.svg';
import ProgressIcon from '@/assets/icons/activity/progressIcon.svg';
import FireIcon from '@/assets/icons/activity/fireIcon.svg';
import TimeIcon from '@/assets/icons/activity/timeIcon.svg';
import GoalIcon from '@/assets/icons/activity/goalIcon.svg';
import StrikeIcon from '@/assets/icons/activity/strikeIcon.svg';
import AdherenceIcon from '@/assets/icons/activity/adherenceIcon.svg';

export default function ActivityHeader({
  calories = 0,
  minutes = 0,
  adherence = 0,
  streak = 0,
}: {
  calories?: number;
  minutes?: number;
  adherence?: number;
  streak?: number;
}) {
  const router = useRouter();
  const segments = useSegments();
  const activeSegment = String(segments[segments.length - 1] || '');
  // NOTE: we intentionally do NOT read safe-area insets here because
  // most screens already apply a SafeArea wrapper at the screen level.
  // Using insets here caused double-spacing on iOS (extra white bar).

  const { width } = Dimensions.get('window');
  const designW = 430;
  const scale = Math.min(1, width / designW);
  const s = (n: number) => Math.round(n * scale);

  const goTo = (path: string) => router.replace(path as any);

  return (
    <LinearGradient
      colors={['#2FCCAC', '#24A88C']}
      style={[styles.header, { paddingTop: s(56), paddingHorizontal: s(24) }]}
    >
      <View style={styles.segmentWrapper}>
        <View style={styles.segmentRow}>
        {/* Actividad tab */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => goTo('/(tabs)/activity')}
          style={[
            styles.segmentBtn,
            activeSegment === 'activity' && styles.segmentBtnActive,
            { flexDirection: 'row', alignItems: 'center' },
          ]}
        >
          <ActivityIcon
            width={s(20)}
            height={s(20)}
            color={activeSegment === 'activity' ? '#2FCCAC' : '#FFFFFF'}
          />
          <AppText variant="ag7" color={activeSegment === 'activity' ? '#2FCCAC' : '#FFFFFF'} style={{ marginLeft: 8 }}>
            Actividad
          </AppText>
        </TouchableOpacity>

        {/* Progreso tab */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => goTo('/(tabs)/activity/progress')}
          style={[
            styles.segmentBtn,
            activeSegment === 'progress' && styles.segmentBtnActive,
            { marginLeft: s(8), flexDirection: 'row', alignItems: 'center' },
          ]}
        >
          <ProgressIcon
            width={s(20)}
            height={s(20)}
            color={activeSegment === 'progress' ? '#2FCCAC' : '#FFFFFF'}
          />
          <AppText variant="ag7" color={activeSegment === 'progress' ? '#2FCCAC' : '#FFFFFF'} style={{ marginLeft: 8 }}>
            Progreso
          </AppText>
        </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsRow}>
        {/* Show different stat cards depending on active tab */}
        {activeSegment === 'activity' ? (
          <>
            <View style={styles.statCard}>
              <View style={styles.statTitleRow}>
                <FireIcon width={s(20)} height={s(20)} color="#FFFFFF" />
                <AppText variant="ag10" color="rgba(255,255,255,0.9)" style={{ marginLeft: 8 }}>
                  Calorías
                </AppText>
              </View>
              <AppText variant="ag3" color="#FFFFFF" style={{ marginTop: 6 }}>{String(calories)}</AppText>
              <AppText variant="ag10" color="rgba(255,255,255,0.7)" style={{ marginTop: 6 }}>quemadas</AppText>
            </View>

            <View style={[styles.statCard, { marginLeft: s(12) }]}>
              <View style={styles.statTitleRow}>
                <TimeIcon width={s(20)} height={s(20)} color="#FFFFFF" />
                <AppText variant="ag10" color="rgba(255,255,255,0.9)" style={{ marginLeft: 8 }}>
                  Tiempo
                </AppText>
              </View>
              <AppText variant="ag3" color="#FFFFFF" style={{ marginTop: 6 }}>{String(minutes)}</AppText>
              <AppText variant="ag10" color="rgba(255,255,255,0.7)" style={{ marginTop: 6 }}>minutos</AppText>
            </View>
          </>
        ) : (
          <>
            <View style={styles.statCard}>
              <View style={styles.statTitleRow}>
                <AdherenceIcon width={s(20)} height={s(20)} color="#FFFFFF" />
                <AppText variant="ag10" color="rgba(255,255,255,0.9)" style={{ marginLeft: 8 }}>
                  Adherencia
                </AppText>
              </View>
              {/* adherence % for last 7 days (prop) */}
              <AppText variant="ag3" color="#FFFFFF" style={{ marginTop: 6 }}>{String(adherence)}%</AppText>
              <AppText variant="ag10" color="rgba(255,255,255,0.7)" style={{ marginTop: 6 }}>Últimos 7 días</AppText>
            </View>

            <View style={[styles.statCard, { marginLeft: s(12) }]}>
              <View style={styles.statTitleRow}>
                <StrikeIcon width={s(20)} height={s(20)} color="#FFFFFF" />
                <AppText variant="ag10" color="rgba(255,255,255,0.9)" style={{ marginLeft: 8 }}>
                  Racha
                </AppText>
              </View>
              <AppText variant="ag3" color="#FFFFFF" style={{ marginTop: 6 }}>{String(streak)}</AppText>
              <AppText variant="ag10" color="rgba(255,255,255,0.7)" style={{ marginTop: 6 }}>Días consecutivos</AppText>
            </View>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 24,
  },
  segmentRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  segmentBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  statsRow: { 
    flexDirection: 'row', 
    marginTop: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 16,
  },
  statTitleRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  segmentWrapper: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 4,
  },
  segmentInnerActive: {
    backgroundColor: '#FFFFFF',
  },
});
