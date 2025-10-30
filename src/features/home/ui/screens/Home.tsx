/* eslint-disable react-native/no-raw-text */
import React, { useMemo, useState } from 'react';
import {
  View, StyleSheet, Pressable, FlatList,
  NativeSyntheticEvent, NativeScrollEvent, useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle } from 'react-native-svg';

import AppText from '@/src/shared/ui/components/Typography';
import { PrimaryGradient } from '@/src/shared/ui/components/Gradients';
import BottomNav from '@/src/shared/ui/BottomNav';
import { PixelRatio } from 'react-native';



// ===== SVGS
import Profile from '@/assets/icons/profile-icon.svg';
import ConsumedIcon from '@/assets/icons/ConsumedIcon.svg';
import BurnedIcon from '@/assets/icons/BurnedIcon.svg';
import RemainingIcon from '@/assets/icons/RemainingIcon.svg';
import BreakfastIcon from '@/assets/icons/BreakfastIcon.svg';
import LunchIcon from '@/assets/icons/LunchIcon.svg';
import DinnerIcon from '@/assets/icons/DinnerIcon.svg';

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
    { key: 'breakfast', title: 'Desayuno', calories: '410 kcal', chipBg: '#FFEDD4', Icon: BreakfastIcon },
    { key: 'lunch',     title: 'Almuerzo', calories: '238 kcal', chipBg: '#FEF9C2', Icon: LunchIcon },
    { key: 'dinner',    title: 'Cena',     calories: '306 kcal', chipBg: '#E9D5FF', Icon: DinnerIcon },
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

      <BottomNav />
    </SafeAreaView>
  );
}

/* ============================
 * Widgets
 * ============================
 */

function CaloriesCard({
  consumed, burned, goal, remaining, progress, ringSize = 80, ringThickness = 12,
}: {
  consumed: number; burned: number; goal: number; remaining: number; progress: number;
  ringSize?: number; ringThickness?: number;
}) {
  return (
    <>
      <AppText variant="ag9" style={{ color: '#4A5565' }}>Calorías de Hoy</AppText>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
        <AppText variant="ag1" style={{ color: '#2FCCAC' }}>{consumed.toString()}</AppText>
        <AppText variant="ag7" style={{ color: '#99A1AF', marginLeft: 8 }}>/ {goal}</AppText>
        <View style={{ flex: 1 }} />
        <RingProgress size={ringSize} thickness={ringThickness} progress={progress} label={`${Math.round(progress * 100)}%`} />
      </View>

      <View style={styles.divider} />

      <View style={[styles.metricsRow, { gap: 6 }]}>
        <View style={styles.metricCol}>
          <View style={styles.metricIcon}><ConsumedIcon width={16} height={16} color="#2FCCAC" /></View>
          <AppText variant="ag10" style={styles.muted}>Consumidas</AppText>
          <AppText variant="ag6">{consumed.toString()}</AppText>
        </View>
        <View style={styles.metricCol}>
          <View style={styles.metricIcon}><BurnedIcon width={16} height={16} color="#FF5A3D" /></View>
          <AppText variant="ag10" style={styles.muted}>Quemadas</AppText>
          <AppText variant="ag6">{burned.toString()}</AppText>
        </View>
        <View style={styles.metricCol}>
          <View style={styles.metricIcon}><RemainingIcon width={16} height={16} color="#2B7FFF" /></View>
          <AppText variant="ag10" style={styles.muted}>Restantes</AppText>
          <AppText variant="ag6">{remaining.toString()}</AppText>
        </View>
      </View>
    </>
  );
}

function MacrosCard({
  macros, compact = false
}: {
  macros: {
    protein: { done: number; goal: number; color: string; label: string; };
    carbs:   { done: number; goal: number; color: string; label: string; };
    fats:    { done: number; goal: number; color: string; label: string; };
  };
  compact?: boolean;
}) {
  type Row = { emoji: string; label: string; done: number; goal: number; color: string; };
  const rows: Row[] = [
    { emoji: '💪', label: 'Proteínas',     done: macros.protein.done, goal: macros.protein.goal, color: '#2B7FFF' },
    { emoji: '🍞', label: 'Carbohidratos', done: macros.carbs.done,   goal: macros.carbs.goal,   color: '#FF6900' },
    { emoji: '🥑', label: 'Grasas',        done: macros.fats.done,    goal: macros.fats.goal,    color: '#F0B100' },
  ];

  const ROW_GAP = compact ? 12 : 16;
  const TRACK_H = compact ? 6 : 8;

  return (
    <>
      <AppText variant="ag7">Macronutrientes</AppText>

      {rows.map((r, i) => {
        const pct = r.goal > 0 ? Math.min(100, Math.round((r.done / r.goal) * 100)) : 0;
        return (
          <View key={r.label} style={{ marginTop: i === 0 ? ROW_GAP : ROW_GAP }}>
            {/* Fila: emoji + label | valor derecha */}
            <View style={[styles.macroRow, { height: compact ? 24 : 28 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <AppText variant="ag6">{r.emoji}</AppText>
                <AppText variant="ag9">{r.label}</AppText>
              </View>
              <AppText variant="ag9" style={{ color: r.color }}>
                {r.done}g / {r.goal}g
              </AppText>
            </View>

            {/* Barra de progreso */}
            <View style={[styles.macroTrack, { height: TRACK_H }]}>
              <View style={[styles.macroFill, { width: `${pct}%`, height: TRACK_H, backgroundColor: r.color }]} />
            </View>
          </View>
        );
      })}
    </>
  );
}

function ImcCard({ value, label, compact = false }: { value: number; label: string; compact?: boolean; }) {
  return (
    <>
      <AppText variant="ag7">IMC Actual</AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: compact ? 12 : 16 }}>
        <View style={[styles.imcBubble, { width: compact ? 68 : 80, height: compact ? 68 : 80 }]}>
          <AppText variant="ag2" style={{ color: '#2FCCAC' }}>{value.toString()}</AppText>
        </View>
        <View style={{ marginLeft: 16, flex: 1 }}>
          <AppText variant="ag9" style={{ color: '#4A5565' }}>Índice de Masa Corporal</AppText>
          <View style={{ marginTop: 4 }}>
            <AppText variant="ag10" style={[styles.imcPill, { paddingHorizontal: compact ? 10 : 12, paddingVertical: compact ? 3 : 4 }]}>{label}</AppText>
          </View>
        </View>
      </View>
      <View style={[styles.imcGrid, { marginTop: compact ? 12 : 16, paddingTop: compact ? 12 : 16 }]}>
        <View style={styles.imcCell}>
          <AppText variant="ag10" style={styles.muted}>Peso</AppText>
          <AppText variant="ag6">70 kg</AppText>
        </View>
        <View style={styles.imcCell}>
          <AppText variant="ag10" style={styles.muted}>Altura</AppText>
          <AppText variant="ag6">170 cm</AppText>
        </View>
      </View>
    </>
  );
}

function MealsList({
  meals, onAdd, compact = false, rowH = 74, iconSize = 44, radius = 16, horizontalPad = 20,
}: {
  meals: { key: string; title: string; calories: string; chipBg: string; Icon: any; }[];
  onAdd: (k: string) => void;
  compact?: boolean;
  rowH?: number; iconSize?: number; radius?: number; horizontalPad?: number;
}) {
  return (
    <View style={[styles.mealsWrapper, { paddingHorizontal: horizontalPad, marginTop: compact ? 30 : 40 }]}>
      <View style={[styles.mealsCard, { padding: compact ? 20 : 30,  }]}>
        <View style={[styles.mealsHeader, { paddingBottom: compact ? 2 : 0 }]}>
          <AppText variant="ag7">Comidas de Hoy</AppText>
          <Pressable><AppText variant="ag9" style={{ color: '#2FCCAC' }}>Ver todas</AppText></Pressable>
        </View>

        <View style={{ marginTop: compact ? 8 : 12 }}>
          {meals.map(({ key, title, calories, chipBg, Icon }) => (
            <View
              key={key}
              style={[
                styles.mealRow,
                {
                  height: rowH,
                  paddingVertical: compact ? 12 : 14,
                  paddingHorizontal: compact ? 12 : 16,
                  borderRadius: radius,
                  marginBottom: compact ? 8 : 12,
                }
              ]}
            >
              <View
                style={[
                  styles.mealChip,
                  {
                    width: iconSize,
                    height: iconSize,
                    borderRadius: Math.round(iconSize * 0.42),
                    marginRight: compact ? 12 : 16,
                    backgroundColor: chipBg
                  }
                ]}
              >
                <Icon width={Math.round(iconSize * 0.5)} height={Math.round(iconSize * 0.5)} color="#1A1A1A" />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="ag9" style={{ color: '#1A1A1A' }} numberOfLines={1}>{title}</AppText>
                <AppText variant="ag9" style={{ color: '#2FCCAC' }} numberOfLines={1}>{calories}</AppText>
              </View>
              <View style={[styles.arrowContainer, { width: 18, height: 18 }]}>
                <AppText variant="ag7" style={{ color: '#99A1AF' }}>›</AppText>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

/* ============================
 * RingProgress
 * ============================
 */
function RingProgress({
  size = 64, thickness = 10, progress = 0, label = '0%',
}: { size?: number; thickness?: number; progress?: number; label?: string; }) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * progress;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        {/* track */}
        <Circle cx={size/2} cy={size/2} r={r} stroke="#EEF2F7" strokeWidth={thickness} fill="none" />
        {/* progress */}
        <Circle
          cx={size/2}
          cy={size/2}
          r={r}
          stroke="#2FCCAC"
          strokeWidth={thickness}
          fill="none"
          strokeDasharray={`${dash},${c}`}
          strokeLinecap="round"
          rotation="-90"
          originX={size/2}
          originY={size/2}
        />
      </Svg>
      <AppText variant="ag10" style={{ position: 'absolute', color: '#4A5565' }}>{label}</AppText>
    </View>
  );
}

/* ============================
 * Styles
 * ============================
 */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },

  headerRow: {
    height: 132,
    paddingHorizontal: 24,
    paddingTop: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerAvatar: {
    width: 60, height: 60, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4
  },

  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E6EEF0', marginHorizontal: 6 },
  dotActive: { backgroundColor: '#FFFFFF' },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metricCol: { alignItems: 'center', width: 90 },
  metricIcon: { marginBottom: 6 },

  mealsWrapper: { paddingHorizontal: 20, marginTop: 16 },
  mealsCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, elevation: 2 },
  mealsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  mealRow: {
    
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 20, paddingHorizontal: 16,
    backgroundColor: '#F8FAFC', borderRadius: 16, marginBottom: 12,
    height: 80,
  },
  mealChip: { width: 48, height: 48, borderRadius: 20, marginRight: 16, alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2FCCAC', alignItems: 'center', justifyContent: 'center' },
  arrowContainer: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },

  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 28,
  },
  macroTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    marginTop: 8,
  },
  macroFill: {
    height: 8,
    borderRadius: 999,
  },

  imcBubble: { width: 80, height: 80, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8FAF6' },
  imcPill: {  backgroundColor: '#D0F7DC', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, color: '#00C950' },
  imcGrid: { borderTopWidth: 1, borderTopColor: '#F1F5F9', marginTop: 16, paddingTop: 16, flexDirection: 'row', gap: 12 },
  imcCell: { flex: 1, alignItems: 'center' },

  muted: { color: '#6A7282' },
});
