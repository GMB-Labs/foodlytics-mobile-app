/* eslint-disable react-native/no-raw-text */
import React, { useMemo, useState } from 'react';
import {
  View, StyleSheet, Pressable, FlatList,
  NativeSyntheticEvent, NativeScrollEvent, useWindowDimensions, Image as RNImage, Text
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from 'expo-router';
import AppText from '@/src/shared/ui/components/Typography';
import { useTodayISO } from '@/src/shared/hooks/useTodayISO';
import { getAllMeals, DetectedItem } from '@/src/features/meals/infrastructure/mealsApi';
import { PrimaryGradient } from '@/src/shared/ui/components/Gradients';
import { PixelRatio } from 'react-native';
import { useTheme } from '@/src/shared/styles/useTheme';
import useProfile from '@/src/features/profile/application/useProfile';
import { useSession } from '@/src/shared/hooks/useSession';
import { fetchDailySummaryCached } from '@/src/shared/api/profileGateway';

// local icons still used by Home header
import Profile from '@/assets/icons/profile-icon.svg';
// alias RN Image imported above as RNImage

// split widgets 
import CaloriesCard from '../components/CaloriesCard';
import MacrosCard from '../components/MacrosCard';
import ImcCard from '../components/ImcCard';
import MealsList from '../components/MealsList';
import { styles } from '../components/styles';

// ===== Datos fake para demo
const data = {
  calories: { consumed: 0, burned: 0, goal: 0 },
  macros: {
    protein: { done: 0, goal: 0, color: '#2B7FFF', label: 'Proteínas' },
    carbs:   { done: 0, goal: 0, color: '#FF6900', label: 'Carbohidratos' },
    fats:    { done: 0, goal: 0,  color: '#F0B100', label: 'Grasas' },
  },
  imc: { value: 0, label: 'Normal' },
  meals: [
    { key: 'breakfast', title: 'Desayuno', calories: '', chipBg: '#FFEDD4' },
    { key: 'lunch',     title: 'Almuerzo', calories: '', chipBg: '#FEF9C2' },
    { key: 'dinner',    title: 'Cena',     calories: '', chipBg: '#E9D5FF' },
  ],
};

// Background now comes from theme tokens

// =====================================================
// Home
// =====================================================
export default function Home() {
  const { colors} = useTheme();
  const { width, height } = useWindowDimensions();

  // === base para 390 x 844
  const DESIGN_W = 390;
  const DESIGN_H = 844;

  // Escala, sin crecer más que el diseño
  const ui = Math.min(1, Math.min(width / DESIGN_W, height / DESIGN_H));
  const s = (n: number) => Math.round(n * ui);

    // tiers por ALTO de pantalla (puntos lógicos)
    type Tier = 'plus' | 'tall';
    const tier: Tier =
    height < 900 ? 'plus'
    :                'tall';

    // helper para elegir valores por tier
    const byTier = <T,>(vals: {  plus: T; tall: T }) => vals[tier];

    // opcional: compensar si el usuario tiene font scale grande
    const fontScale = PixelRatio.getFontScale();
    const fsFix = fontScale > 1.1 ? 0.92 : 1; // reduce un poco alturas si la tipografía “crece”


  // Modo compacto en alturas hasta 844
  const COMPACT = height <= 844;

  // Tamaños clave
  const TOP_H = Math.round(
    byTier({ plus: s(395), tall: s(410) }) * fsFix
    );

    const HEADER_PT = byTier({ plus: s(50), tall: s(36) });
    const HEADER_MBOTTOM = byTier({plus: s(20), tall: s(18) });
    const AVATAR = byTier({  plus: s(48), tall: s(52) });



  const CARD_W      = Math.min(s(320), width - s(48));
  const CARD_H = Math.round(
    byTier({  plus: s(230), tall: s(250) }) * fsFix
 );
  const CARD_GAP    = s(16);
  const SNAP        = CARD_W + CARD_GAP;
  const sidePad     = (width - CARD_W) / 2;

  const DOT         = s(8);
  const DOT_ACTIVE  = s(10);
  const DOT_BOTTOM = byTier({  plus: s(18), tall: s(23) });


  const RING_SIZE   = s(68);
  const RING_THICK  = s(10);

  const MEAL_ROW_H  = s(70);
  const MEAL_ICON   = s(38);
  const MEAL_RADIUS = s(16);
  const H_PAD       = s(20);

  const [page, setPage] = useState(0);
  const slides = useMemo(() => ['calories', 'macros', 'imc'] as const, []);
  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SNAP);
    setPage(idx);
  };

  // Fetch the single GET (all meals) and compute today's calories locally.
  const todayISO = useTodayISO();
  const [allMeals, setAllMeals] = useState<Record<string, Record<string, DetectedItem[]>> | null>(null);
  const [allMealsLoading, setAllMealsLoading] = useState(false);
  const [allMealsError, setAllMealsError] = useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setAllMealsLoading(true);
    getAllMeals()
      .then((res) => { if (!mounted) return; setAllMeals(res); })
      .catch((err) => { if (!mounted) return; setAllMealsError(String(err ?? 'Error fetching meals')); setAllMeals(null); })
      .finally(() => { if (mounted) setAllMealsLoading(false); });
    return () => { mounted = false; };
  }, []);

  // Derivados: compute consumed calories for today from the fetched map (or fall back to demo data)
  const consumed = React.useMemo(() => {
    const byDate = allMeals && allMeals[todayISO] ? allMeals[todayISO] : null;
    if (byDate) {
      return Object.values(byDate).flat().reduce((acc, it) => acc + (it?.kcal ?? 0), 0);
    }
    return data.calories.consumed;
  }, [allMeals, todayISO]);

  const { profile } = useProfile();
  const [session] = useSession();

  const [dailySummary, setDailySummary] = React.useState<any | null>(null);
  const [dailySummaryLoading, setDailySummaryLoading] = React.useState(false);
  const [dailySummaryError, setDailySummaryError] = React.useState<string | null>(null);

  const loadDailySummary = React.useCallback((force = false) => {
    if (!session?.isAuthenticated || !session?.sub) {
      setDailySummary(null);
      return;
    }

    setDailySummaryLoading(true);
    setDailySummaryError(null);
    fetchDailySummaryCached({ patientId: session.sub, token: session.accessToken ?? undefined, day: todayISO, force })
      .then((res) => { try { console.log('[Home] dailySummary', res); } catch (e) {} setDailySummary(res); })
      .catch((err) => { setDailySummaryError(String(err ?? 'Error fetching daily summary')); setDailySummary(null); })
      .finally(() => { setDailySummaryLoading(false); });
  }, [session?.isAuthenticated, session?.sub, session?.accessToken, todayISO]);

  React.useEffect(() => {
    loadDailySummary(false);
  }, [loadDailySummary]);

  // Refetch when screen comes into focus (e.g., after registering activity)
  useFocusEffect(
    React.useCallback(() => {
      if (session?.isAuthenticated && session?.sub) {
        loadDailySummary(true);
      }
    }, [session?.isAuthenticated, session?.sub, loadDailySummary])
  );

  // If we have any dailySummary object from the API, prefer its values (even if some nested keys are missing).
  // This is more robust than checking both `target` and `consumed` because some server responses may omit one of them.
  const hasDaily = dailySummary != null;
  const caloriesSource = hasDaily ? {
    consumed: Number(dailySummary?.consumed?.calories ?? 0),
    burned: Number(dailySummary?.activity_burned ?? 0),
    goal: Number(dailySummary?.target?.calories ?? 0),
  } : data.calories;

  const macrosSource = hasDaily ? {
    protein: { done: Number(dailySummary?.consumed?.protein ?? 0), goal: Number(dailySummary?.target?.protein ?? 0), color: '#2B7FFF', label: 'Proteínas' },
    carbs:   { done: Number(dailySummary?.consumed?.carbs ?? 0),   goal: Number(dailySummary?.target?.carbs ?? 0),   color: '#FF6900', label: 'Carbohidratos' },
    fats:    { done: Number(dailySummary?.consumed?.fats ?? 0),    goal: Number(dailySummary?.target?.fats ?? 0),    color: '#F0B100', label: 'Grasas' },
  } : data.macros;

  // Use calorie values from API when available for progress calculations
  const caloriesConsumedForProgress = typeof caloriesSource.consumed === 'number' ? caloriesSource.consumed : consumed;
  const remaining = Math.max(0, (caloriesSource.goal ?? 0) - (caloriesConsumedForProgress ?? 0));
  const progress = Math.max(0, Math.min(1, (caloriesConsumedForProgress ?? 0) / (caloriesSource.goal ?? 1))); // 0..1

  React.useEffect(() => {
    try {
      console.log('[Home] debug', {
        todayISO,
        sessionSub: session?.sub,
        dailySummaryReceived: dailySummary != null,
        dailySummary,
        caloriesSource,
        macrosSource,
        consumedFromMeals: consumed,
        caloriesConsumedForProgress,
        remaining,
        progress,
      });
    } catch (e) {}
  }, [dailySummary, consumed, caloriesSource, macrosSource, caloriesConsumedForProgress, remaining, progress, todayISO, session?.sub]);

  // Build meals array for MealsList using the fetched data when available
  const mealsForList = React.useMemo(() => {
    // Read per-meal chip tokens from the theme so other components can reuse them
    const defs = [
      { key: 'breakfast', title: 'Desayuno', chipBg: (colors as any).mealChips?.breakfast?.bg ?? '#FFEDD4', iconColor: (colors as any).mealChips?.breakfast?.icon ?? (colors as any).text ?? '#1A1A1A' },
      { key: 'lunch',     title: 'Almuerzo', chipBg: (colors as any).mealChips?.lunch?.bg ?? '#FEF9C2',     iconColor: (colors as any).mealChips?.lunch?.icon ?? (colors as any).text ?? '#1A1A1A' },
      { key: 'dinner',    title: 'Cena',     chipBg: (colors as any).mealChips?.dinner?.bg ?? '#E9D5FF',    iconColor: (colors as any).mealChips?.dinner?.icon ?? (colors as any).text ?? '#1A1A1A' },
    ];

    // Map demo data by key so we keep demo calories text when falling back
    const demoMap: Record<string, { calories?: string | null }> = Object.fromEntries(
      data.meals.map((m) => [m.key, { calories: m.calories }])
    );

    const byDate = allMeals && allMeals[todayISO] ? allMeals[todayISO] : null;
    // If no fetched meals for today, return themed defs (so chip/icon colors reflect the active theme)
    if (!byDate) return defs.map((m) => ({ key: m.key, title: m.title, calories: demoMap[m.key]?.calories ?? '', chipBg: m.chipBg, iconColor: m.iconColor }));

    // When there are fetched items, compute kcal sums and include themed iconColor
    return defs.map((m) => {
      const items = byDate[m.key] ?? [];
      const kcalSum = items.reduce((acc, it) => acc + (it?.kcal ?? 0), 0);
      return { key: m.key, title: m.title, calories: kcalSum > 0 ? `${kcalSum} kcal` : '', chipBg: m.chipBg, iconColor: m.iconColor };
    });
  }, [allMeals, todayISO, colors]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]} edges={['left','right']}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Área superior con gradiente */}
      <View style={{ backgroundColor: colors.bg }}>
        <View
          style={{
            height: TOP_H,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            overflow: 'visible',
          }}
        >
          <PrimaryGradient style={StyleSheet.absoluteFillObject as any} height={TOP_H} />

          {/* Header */}
          <View style={{ marginBottom: HEADER_MBOTTOM }}>
            <View style={[styles.headerRow, { paddingHorizontal: s(24), paddingTop: HEADER_PT, height: undefined }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Pressable onPress={() => {}} 
                style={[styles.headerAvatar,
                 {
                   backgroundColor: colors.iconbase,
                   width: AVATAR, 
                   height: AVATAR,
                   borderRadius: AVATAR / 2,
                   overflow: 'hidden',
                   alignItems: 'center',
                   justifyContent: 'center',
                   }
                 ]}
                 >
                  {profile?.avatar ? (
                    <RNImage
                      source={{ uri: profile.avatar }}
                      style={{ width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Profile width={s(28)} height={s(28)} color={colors.white} strokeWidth={2} />
                  )}
                </Pressable>
                <View style={{ marginLeft: s(10) }}>
                  <AppText variant="ag5" style={{ color: '#FFFFFF' }}><Text>{`Hola, ${profile?.name ?? 'Usuario'}`}</Text></AppText>
                </View>
              </View>
            </View>
          </View>

          {/* Carrusel */}
          <FlatList
            data={slides}
            keyExtractor={(k) => k}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: sidePad, paddingRight: sidePad }}
            style={{ marginTop: s(-1) }}
            snapToInterval={SNAP}
            decelerationRate="fast"
            onMomentumScrollEnd={onMomentumEnd}
            renderItem={({ item }) => (
              <View style={[styles.card,{
                backgroundColor: colors.mealsCard
              }, { width: CARD_W, height: CARD_H, marginRight: CARD_GAP }]}>
                <View style={{ padding: s(18) }}>
                  {item === 'calories' && (
                    <CaloriesCard
                      consumed={caloriesSource.consumed}
                      burned={caloriesSource.burned}
                      goal={caloriesSource.goal}
                      remaining={remaining}
                      progress={progress}
                      ringSize={RING_SIZE}
                      ringThickness={RING_THICK}
                    />
                  )}
                  {item === 'macros' && <MacrosCard macros={macrosSource} compact={COMPACT} />}
                  {item === 'imc' && (
                    <ImcCard
                      value={profile?.bmi}
                      heightCm={profile?.heightCm}
                      weightKg={profile?.weightKg}
                      compact={COMPACT}
                    />
                  )}
                </View>
              </View>
            )}
          />

          {/* DOTS */}
          <View
            style={{
              position: 'absolute',
              bottom: DOT_BOTTOM,
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: s(8),
            }}
          >
            {slides.map((_, i) => {
              const isActive = i === page;
              return (
                <View
                  key={i}
                  style={{
                    width: isActive ? DOT_ACTIVE : DOT,
                    height: isActive ? DOT_ACTIVE : DOT,
                    borderRadius: s(5),
                    backgroundColor: isActive ? colors.dotActive : colors.dot,
                    transform: [{ scale: isActive ? 1.08 : 1 }],
                  }}
                />
              );
            })}
          </View>
        </View>
      </View>
        {/* Sin scroll vertical: sección inferior compacta */}
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          <MealsList
            meals={mealsForList}
            onAdd={(k) => {}}
            compact={COMPACT}
            rowH={MEAL_ROW_H}
            iconSize={MEAL_ICON}
            radius={MEAL_RADIUS}
            horizontalPad={H_PAD}
          />
        </View>
      </SafeAreaView>
    );
}
