/* eslint-disable react-native/no-raw-text */
import React, { useMemo, useState } from 'react';
import {
  View, StyleSheet, Pressable, FlatList,
  NativeSyntheticEvent, NativeScrollEvent, useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppText from '@/src/shared/ui/components/Typography';
import { PrimaryGradient } from '@/src/shared/ui/components/Gradients';
import BottomNav from '@/src/shared/ui/BottomNav';
import { PixelRatio } from 'react-native';

// local icons still used by Home header
import Profile from '@/assets/icons/profile-icon.svg';

// split widgets 
import CaloriesCard from '../components/CaloriesCard';
import MacrosCard from '../components/MacrosCard';
import ImcCard from '../components/ImcCard';
import MealsList from '../components/MealsList';
import { styles } from '../components/styles';

// ===== Datos fake para demo
const data = {
  calories: { consumed: 954, burned: 0, goal: 1789 },
  macros: {
    protein: { done: 91, goal: 134, color: '#2B7FFF', label: 'Proteínas' },
    carbs:   { done: 90, goal: 179, color: '#FF6900', label: 'Carbohidratos' },
    fats:    { done: 29, goal: 60,  color: '#F0B100', label: 'Grasas' },
  },
  imc: { value: 24.2, label: 'Normal' },
  meals: [
    { key: 'breakfast', title: 'Desayuno', calories: '', chipBg: '#FFEDD4' },
    { key: 'lunch',     title: 'Almuerzo', calories: '238 kcal', chipBg: '#FEF9C2' },
    { key: 'dinner',    title: 'Cena',     calories: '306 kcal', chipBg: '#E9D5FF' },
  ],
};

const BG = '#F9FAFB';

// =====================================================
// Home
// =====================================================
export default function Home() {
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

  // Derivados
  const remaining = Math.max(0, data.calories.goal - data.calories.consumed);
  const progress = Math.max(0, Math.min(1, data.calories.consumed / data.calories.goal)); // 0..1

  return (
    <SafeAreaView style={styles.screen} edges={['left','right']}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Área superior con gradiente */}
      <View style={{ backgroundColor: BG }}>
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
                <Pressable onPress={() => {}} style={[styles.headerAvatar, { width: AVATAR, height: AVATAR }]}>
                  <Profile width={s(28)} height={s(28)} color="#FFFFFF" strokeWidth={2} />
                </Pressable>
                <View style={{ marginLeft: s(10) }}>
                  <AppText variant="ag5" style={{ color: '#FFFFFF' }}>Hola, Liliana</AppText>
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
              <View style={[styles.card, { width: CARD_W, height: CARD_H, marginRight: CARD_GAP }]}>
                <View style={{ padding: s(18) }}>
                  {item === 'calories' && (
                    <CaloriesCard
                      consumed={data.calories.consumed}
                      burned={data.calories.burned}
                      goal={data.calories.goal}
                      remaining={remaining}
                      progress={progress}
                      ringSize={RING_SIZE}
                      ringThickness={RING_THICK}
                    />
                  )}
                  {item === 'macros' && <MacrosCard macros={data.macros} compact={COMPACT} />}
                  {item === 'imc' && <ImcCard value={data.imc.value} label={data.imc.label} compact={COMPACT} />}
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
                    backgroundColor: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                    transform: [{ scale: isActive ? 1.08 : 1 }],
                  }}
                />
              );
            })}
          </View>
        </View>
      </View>
        {/* Sin scroll vertical: sección inferior compacta */}
        <View style={{ flex: 1, backgroundColor: BG }}>
          <MealsList
            meals={data.meals}
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
