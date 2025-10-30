import React from 'react';
import { View } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import { styles } from './styles';

type Macro = { done: number; goal: number; color: string; label: string };

export default function MacrosCard({ macros, compact = false }: { macros: { protein: Macro; carbs: Macro; fats: Macro }; compact?: boolean }) {
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
            <View style={[styles.macroRow, { height: compact ? 24 : 28 }]}> 
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <AppText variant="ag6">{r.emoji}</AppText>
                <AppText variant="ag9">{r.label}</AppText>
              </View>
              <AppText variant="ag9" style={{ color: r.color }}>{r.done}g / {r.goal}g</AppText>
            </View>

            <View style={[styles.macroTrack, { height: TRACK_H }]}> 
              <View style={[styles.macroFill, { width: `${pct}%`, height: TRACK_H, backgroundColor: r.color }]} />
            </View>
          </View>
        );
      })}
    </>
  );
}
