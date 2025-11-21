import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "@/src/shared/ui/components/Typography";
import { useTheme } from '@/src/shared/styles/useTheme';
import { s, cardShadow } from "../tokens";

export default function BMIBlock({ bmi, label }: { bmi: number; label?: string }) {
  const { colors } = useTheme();

  const deriveLabelFromValue = (v: number | null | undefined) => {
    if (v == null) return '—';
    if (v < 18.5) return 'Bajo peso';
    if (v < 25) return 'Normal';
    if (v < 30) return 'Sobrepeso';
    if (v < 35) return 'Obesidad I';
    if (v < 40) return 'Obesidad II';
    return 'Obesidad III';
  };

  const statusKey = (lab: string | null | undefined) => {
    if (!lab) return 'normal';
    const l = String(lab).trim().toLowerCase();
    if (l === 'bajo peso') return 'underweight';
    if (l === 'normal') return 'normal';
    if (l === 'sobrepeso') return 'overweight';
    if (l === 'obesidad i' || l === 'obesidad 1') return 'overweightI';
    if (l === 'obesidad ii' || l === 'obesidad 2') return 'overweightII';
    if (l === 'obesidad iii' || l === 'obesidad 3') return 'overweightIII';
    return 'obese';
  };

  const displayLabel = label ?? deriveLabelFromValue(bmi);
  const key = statusKey(displayLabel);
  const colorKey = key === 'obese' ? 'overweightIII' : key;

  const pillBg = (colors as any)?.imc?.pillBg?.[colorKey] ?? (colors as any)?.imc?.bubbleBg ?? '#D0F7DC';
  const pillTextColor = (colors as any)?.imc?.pillText?.[colorKey] ?? (colors as any)?.text ?? '#00C950';

  return (
    <View style={[{ backgroundColor: (colors as any)?.bg, padding: s(16), borderRadius: s(20), marginTop: s(8), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}> 
      <View style={{ gap: s(4) }}>
        <AppText variant="ag9" color={(colors as any)?.muted}>IMC Actual</AppText>
        <AppText variant="ag1" color={(colors as any)?.brandA}>{bmi}</AppText>
      </View>
      <View style={{ backgroundColor: pillBg, paddingHorizontal: s(16), paddingVertical: s(8), borderRadius: s(18) }}>
        <AppText variant="ag9" color={pillTextColor}>{displayLabel}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: s(16),
    borderRadius: s(20),
    marginTop: s(8),
  },
  badge: {
    paddingHorizontal: s(16),
    paddingVertical: s(8),
    borderRadius: s(18),
  },
});
