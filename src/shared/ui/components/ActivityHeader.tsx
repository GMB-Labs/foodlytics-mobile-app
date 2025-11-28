import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from '@/src/shared/ui/components/Typography';
import { useTheme } from '@/src/shared/styles/useTheme';
import useSession from '@/src/shared/hooks/useSession';
import { fetchDailySummaryCached } from '@/src/shared/api/profileGateway';
import { useRouter, useSegments } from 'expo-router';
import ActivityIcon from '@/assets/icons/activity-icon.svg';
import ProgressIcon from '@/assets/icons/activity/progressIcon.svg';
import FireIcon from '@/assets/icons/activity/fireIcon.svg';
import TimeIcon from '@/assets/icons/activity/timeIcon.svg';
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
  const { colors } = useTheme();
  const theme = colors as any;
  const styles = createStyles(s, theme);

  // session (for patient id / token)
  const [sessionState] = useSession();
  const token = sessionState?.accessToken;
  const patientId = sessionState?.sub;

  const [computedAdherence, setComputedAdherence] = useState<number | null>(null);
  const [adherenceLoading, setAdherenceLoading] = useState(false);
  const [computedStreak, setComputedStreak] = useState<number | null>(null);
  const [streakLoading, setStreakLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function computeAdherence() {
      if (activeSegment !== 'progress') return;
      if (!patientId) return;
      setAdherenceLoading(true);
      try {
        const days: string[] = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          days.push(d.toISOString().slice(0, 10));
        }

        const promises = days.map((day) =>
          fetchDailySummaryCached({ patientId: String(patientId), day, token: token ?? undefined }).catch((e) => {
            // treat errors as not within target
            return null;
          })
        );

        const results = await Promise.all(promises);
        let within = 0;
        for (const r of results) {
          if (r && r.status === 'within_target') within += 1;
        }

        const pct = Math.round((within / 7) * 100);
        if (mounted) setComputedAdherence(pct);
      } catch (e) {
        // ignore — keep computedAdherence as-is
      } finally {
        if (mounted) setAdherenceLoading(false);
      }
    }

    computeAdherence();
    return () => {
      mounted = false;
    };
  }, [activeSegment, patientId, token]);

  useEffect(() => {
    let mounted = true;
    async function computeStreak() {
      if (activeSegment !== 'progress') return;
      if (!patientId) return;
      setStreakLoading(true);
      try {
        let streakCount = 0;
        // look back up to 30 days (stop early if a non-within_target day is found)
        for (let i = 0; i < 30; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const day = d.toISOString().slice(0, 10);
          try {
            const res = await fetchDailySummaryCached({ patientId: String(patientId), day, token: token ?? undefined });
            if (!res || res.status !== 'within_target') {
              // if today (i===0) is not within_target, streak is 0
              break;
            }
            streakCount += 1;
          } catch (e) {
            // on error, stop counting (treat as not within target)
            break;
          }
        }

        if (mounted) setComputedStreak(streakCount);
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setStreakLoading(false);
      }
    }

    computeStreak();
    return () => {
      mounted = false;
    };
  }, [activeSegment, patientId, token]);


  const goTo = (path: string) => router.replace(path as any);

  return (
    <LinearGradient
      colors={[theme.gradient?.primaryFrom ?? '#2FCCAC', theme.gradient?.primaryTo ?? '#24A88C']}
      style={[styles.header, { paddingTop: s(56), paddingHorizontal: s(24) }]}
    >
      <View style={[styles.segmentWrapper,{backgroundColor: theme.iconbase2 ?? 'rgba(255,255,255,0.2)'}]}>
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
            color={activeSegment === 'activity' ? (theme.brandA ?? '#2FCCAC') : (theme.headerOnPrimary ?? '#FFFFFF')}
          />
          <AppText variant="ag7" color={activeSegment === 'activity' ? (theme.brandA ?? '#2FCCAC') : (theme.headerOnPrimary ?? '#FFFFFF')} style={{ marginLeft: 8 }}>
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
            color={activeSegment === 'progress' ? (theme.brandA ?? '#2FCCAC') : (theme.headerOnPrimary ?? '#FFFFFF')}
          />
          <AppText variant="ag7" color={activeSegment === 'progress' ? (theme.brandA ?? '#2FCCAC') : (theme.headerOnPrimary ?? '#FFFFFF')} style={{ marginLeft: 8 }}>
            Progreso
          </AppText>
        </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsRow}>
        {/* Show different stat cards depending on active tab */}
        {activeSegment === 'activity' ? (
          <>
            <View style={[styles.statCard, { backgroundColor: theme.iconbase2 ?? 'rgba(255,255,255,0.2)' }] }>
              <View style={styles.statTitleRow}>
                <FireIcon width={s(20)} height={s(20)} color={theme.headerOnPrimary ?? '#FFFFFF'} />
                <AppText variant="ag10" color={theme.headerOnPrimary90 ?? 'rgba(255,255,255,0.9)'} style={{ marginLeft: 8 }}>
                  Calorías
                </AppText>
              </View>
              <AppText variant="ag3" color={theme.headerOnPrimary ?? '#FFFFFF'} style={{ marginTop: 6 }}>{String(calories)}</AppText>
              <AppText variant="ag10" color={theme.headerOnPrimary70 ?? 'rgba(255,255,255,0.7)'} style={{ marginTop: 6 }}>quemadas</AppText>
            </View>

            <View style={[styles.statCard, { marginLeft: s(12), backgroundColor: theme.iconbase2 ?? 'rgba(255,255,255,0.2)' }]}>
              <View style={styles.statTitleRow}>
                <TimeIcon width={s(20)} height={s(20)} color={theme.headerOnPrimary ?? '#FFFFFF'} />
                <AppText variant="ag10" color={theme.headerOnPrimary90 ?? 'rgba(255,255,255,0.9)'} style={{ marginLeft: 8 }}>
                  Tiempo
                </AppText>
              </View>
              <AppText variant="ag3" color={theme.headerOnPrimary ?? '#FFFFFF'} style={{ marginTop: 6 }}>{String(minutes)}</AppText>
              <AppText variant="ag10" color={theme.headerOnPrimary70 ?? 'rgba(255,255,255,0.7)'} style={{ marginTop: 6 }}>minutos</AppText>
            </View>
          </>
        ) : (
          <>
            <View style={[styles.statCard, { backgroundColor: theme.iconbase2 ?? 'rgba(255,255,255,0.2)' }]}>
              <View style={styles.statTitleRow}>
                <AdherenceIcon width={s(20)} height={s(20)} color="#FFFFFF" />
                <AppText variant="ag10" color="rgba(255,255,255,0.9)" style={{ marginLeft: 8 }}>
                  Adherencia
                </AppText>
              </View>
                {/* adherence % for last 7 days (computed) */}
                <View style={{ marginTop: 6 }}>
                  {adherenceLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <AppText variant="ag3" color="#FFFFFF">{String(computedAdherence !== null ? computedAdherence : adherence)}%</AppText>
                  )}
                </View>
              <AppText variant="ag10" color="rgba(255,255,255,0.7)" style={{ marginTop: 6 }}>Últimos 7 días</AppText>
            </View>

            <View style={[styles.statCard, { marginLeft: s(12), backgroundColor: theme.iconbase2 ?? 'rgba(255,255,255,0.2)' }]}>
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

const createStyles = (s: (n:number)=>number, theme: any) => StyleSheet.create({

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
    backgroundColor: theme.card??'#FFFFFF',
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
