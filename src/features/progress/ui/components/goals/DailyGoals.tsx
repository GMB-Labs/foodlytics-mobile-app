import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import AppText from '@/src/shared/ui/components/Typography';
import GoalIcon from '@/assets/icons/activity/goalIcon.svg';
import { useTheme } from '@/src/shared/styles/useTheme';
import useSession from '@/src/shared/hooks/useSession';
import { fetchCalorieTargetsCached } from '@/src/shared/api/profileGateway';

type Goal = { label: string; value: string; color?: string };

const defaultGoals: Goal[] = [
  { label: 'Calorías', value: '1789', color: '#2FCCAC' },
  { label: 'Proteínas', value: '134g', color: '#2B7FFF' },
  { label: 'Carbohidratos', value: '179g', color: '#FF6900' },
  { label: 'Grasas', value: '60g', color: '#F0B100' },
];

export default function DailyGoals({ goals = defaultGoals }: { goals?: Goal[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sessionState] = useSession();
  const [remoteGoals, setRemoteGoals] = useState<Goal[] | null>(null);

  const { colors } = useTheme();
  const theme = colors as any;

  const onAdjust = () => {
    const safeFrom = (() => {
      if (!pathname || pathname === '/') return '/(tabs)';
      if (pathname.startsWith('/(auth)') || pathname.startsWith('/login')) return '/(tabs)';
      return pathname;
    })();
    router.push({ pathname: '/modals/edit-goals', params: { from: safeFrom } } as any);
  };

  useEffect(() => {
    let mounted = true;
    const patientId = sessionState?.sub;
    const token = sessionState?.accessToken ?? undefined;
    if (!patientId) return;

    const force = !!(sessionState?.user as any)?.calorieTargetsRefreshedAt;

    (async () => {
      try {
        const data: any = await fetchCalorieTargetsCached({ patientId, token, force });
        if (!mounted || !data) return;
        const g: Goal[] = [
          { label: 'Calorías', value: String(data.calories ?? ''), color: '#2FCCAC' },
          { label: 'Proteínas', value: `${data.protein_grams ?? ''}g`, color: '#2B7FFF' },
          { label: 'Carbohidratos', value: `${data.carb_grams ?? ''}g`, color: '#FF6900' },
          { label: 'Grasas', value: `${data.fat_grams ?? ''}g`, color: '#F0B100' },
        ];
        setRemoteGoals(g);
      } catch (e) {
        // ignore, keep defaults
      }
    })();

    return () => {
      mounted = false;
    };
  }, [
    sessionState?.sub,
    (sessionState?.user as any)?.goalWeight,
    sessionState?.user?.activity,
    sessionState?.user?.goalType,
    (sessionState?.user as any)?.calorieTargetsRefreshedAt,
  ]);

  const styles = createStyles(theme);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <AppText variant="ag7" color={theme.text ?? '#1A1A1A'}><Text>Metas Diarias</Text></AppText>
        <TouchableOpacity style={styles.adjustBtn} activeOpacity={0.85} onPress={onAdjust}>
          <GoalIcon width={16} height={16} color={theme.text ?? '#1A1A1A'} />
          <AppText variant="ag9" color={theme.text ?? '#1A1A1A'} style={{ marginLeft: 8 }}><Text>Ajustar</Text></AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {(remoteGoals ?? goals).map((g, i) => (
          <View key={i} style={[styles.gridItem, { backgroundColor: theme.mealRowBg ?? '#F8FAFC' }]}>
            <AppText variant="ag10" color={theme.subtext ?? '#4A5565'}><Text>{g.label}</Text></AppText>
            <AppText variant="ag6" color={g.color ?? theme.brandB ?? '#2FCCAC'} style={{ marginTop: 4 }}>
              <Text>{g.value}</Text>
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

function createStyles(themeColors: any) {
  return StyleSheet.create({
    card: { 
      backgroundColor: themeColors.mealsCard ?? '#FFFFFF', 
      borderRadius: 16, 
      padding: 20, 
      marginTop: 12, 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 1 }, 
      shadowOpacity: 0.08, 
      shadowRadius: 4, 
      elevation: 2 
    },
    headerRow: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    },
    adjustBtn: { 
      backgroundColor: themeColors.card ?? '#FFFFFF', 
      borderWidth: 1, 
      borderColor: themeColors.border ?? '#E5E7EB', 
      borderRadius: 20, 
      paddingHorizontal: 12, 
      paddingVertical: 6,
      flexDirection: 'row',
      alignItems: 'center',
    },
    grid: { 
      marginTop: 16, 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      gap: 12,
    },
    gridItem: { 
      width: '48%', 
      backgroundColor: themeColors.surface ?? '#F8FAFC', 
      borderRadius: 20, 
      paddingVertical: 12, 
      paddingHorizontal: 12,
    },
  });
}
