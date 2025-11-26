import React from 'react';
import { View } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import { Text } from 'react-native';
import { styles } from './styles';
import { useTheme } from '@/src/shared/styles/useTheme';

export default function ImcCard({ value, label, compact = false, heightCm, weightKg }: { value?: number | null; label?: string | null; compact?: boolean; heightCm?: number | null; weightKg?: number | null }) {
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
    const l = String(lab).trim().toLowerCase();
    // Explicit exact matches based on deriveLabelFromValue output
    if (l === 'bajo peso') return 'underweight';
    if (l === 'normal') return 'normal';
    if (l === 'sobrepeso') return 'overweight';
    if (l === 'obesidad i' || l === 'obesidad 1') return 'overweightI';
    if (l === 'obesidad ii' || l === 'obesidad 2') return 'overweightII';
    if (l === 'obesidad iii' || l === 'obesidad 3') return 'overweightIII';
    return 'obese';
  };

  const key = statusKey(displayLabel);
  // If the derived key is 'obese' map it to 'overweightIII' for color selection
  const colorKey = key === 'obese' ? 'overweightIII' : key;

  const pillBg = (colors as any)?.imc?.pillBg?.[colorKey] ?? (styles.imcPill as any)?.backgroundColor ?? '#D0F7DC';
  const pillTextColor = (colors as any)?.imc?.pillText?.[colorKey] ?? (styles.imcPill as any)?.color ?? '#00C950';
  // Prefer per-status bubble color (match pillBg) when available, otherwise fall back to bubbleBg token
  const bubbleBg = (colors as any)?.imc?.pillBg?.[colorKey] ?? (colors as any)?.imc?.bubbleBg ?? '#E8FAF6';
 
  return (
    <>
      <AppText variant="ag8" style={{ color: colors.subtext }}><Text>IMC Actual</Text></AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: compact ? 12 : 16 }}>
          <View style={[styles.imcBubble, { width: compact ? 68 : 80, height: compact ? 68 : 80, backgroundColor: bubbleBg }]}>
          <AppText variant="ag3" style={{ color: pillTextColor }}>
            <Text>{displayValue != null ? String(displayValue) : '—'}</Text>
          </AppText>
        </View>
        <View style={{ marginLeft: 16, flex: 1 }}>
          <AppText variant="ag9" style={{ color:colors.subtext }}><Text>Índice de Masa Corporal</Text></AppText>
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
        <View style={[styles.imcGrid, 
      { 
        borderTopColor: colors.border,
        marginTop: compact ? 12 : 16, paddingTop: compact ? 12 : 16 
      }
      ]}>
        <View style={styles.imcCell}>
          <AppText variant="ag10" style={styles.muted}><Text>Peso</Text></AppText>
          <AppText variant="ag6" style={{ color: colors.subtext }}>
            <Text>{weightKg != null ? `${weightKg} kg` : '—'}</Text>
          </AppText>
        </View>
        <View style={styles.imcCell}>
          <AppText variant="ag10" style={styles.muted}><Text>Altura</Text></AppText>
          <AppText variant="ag6" style={{ color: colors.subtext }}>
            <Text>{heightCm != null ? `${heightCm} cm` : '—'}</Text>
          </AppText>
        </View>
      </View>
    </>
  );
}
