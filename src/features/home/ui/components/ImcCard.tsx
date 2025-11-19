import React from 'react';
import { View } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import { styles } from './styles';
import { useTheme } from '@/src/shared/styles/useTheme';

export default function ImcCard({ value, label, compact = false }: { value?: number | null; label?: string | null; compact?: boolean; }) {
  const { colors } = useTheme();
  // The IMC value comes from backend. Use it to derive a label/status key.
  const displayValue: number | null = value == null ? null : Number(value);

  const deriveLabelFromValue = (v: number | null | undefined) => {
    if (v == null) return '—';
    if (v < 18.5) return 'Bajo peso';
    if (v < 25) return 'Normal';
    if (v < 30) return 'Sobrepeso';
    if (v < 35) return 'Obesidad I';
    if (v < 40) return 'Obesidad II';
    return 'Obesidad III';
  };

  const displayLabel = label ?? deriveLabelFromValue(displayValue);

  const statusKey = (lab: string | null | undefined) => {
    if (!lab) return 'normal';
    const l = String(lab).toLowerCase();
    if (l.includes('bajo')) return 'underweight';
    if (l.includes('normal')) return 'normal';
    if (l.includes('sobre')) return 'overweight';
    return 'obese';
  };

  const key = statusKey(displayLabel);
  const pillBg = (colors as any)?.imc?.pillBg?.[key] ?? (styles.imcPill as any)?.backgroundColor ?? '#D0F7DC';
  const pillTextColor = (colors as any)?.imc?.pillText?.[key] ?? (styles.imcPill as any)?.color ?? '#00C950';
  return (
    <>
      <AppText variant="ag7" style={{ color: colors.subtext }}>IMC Actual</AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: compact ? 12 : 16 }}>
          <View style={[styles.imcBubble, { width: compact ? 68 : 80, height: compact ? 68 : 80 }]}>
          <AppText variant="ag2" style={{ color: colors.brandA }}>{displayValue != null ? String(displayValue) : '—'}</AppText>
        </View>
        <View style={{ marginLeft: 16, flex: 1 }}>
          <AppText variant="ag9" style={{ color:colors.subtext }}>Índice de Masa Corporal</AppText>
          <View style={{ marginTop: 4 }}>
            <AppText
              variant="ag10"
              style={[
                styles.imcPill,
                { paddingHorizontal: compact ? 10 : 12, paddingVertical: compact ? 3 : 4, backgroundColor: pillBg, color: pillTextColor },
              ]}
            >
              {displayLabel}
            </AppText>
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
