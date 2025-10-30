import React from 'react';
import { View } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import { styles } from './styles';

export default function ImcCard({ value = 0, label = '—', compact = false }: { value?: number; label?: string; compact?: boolean; }) {
  return (
    <>
      <AppText variant="ag7">IMC Actual</AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: compact ? 12 : 16 }}>
        <View style={[styles.imcBubble, { width: compact ? 68 : 80, height: compact ? 68 : 80 }]}>
          <AppText variant="ag2" style={{ color: '#2FCCAC' }}>{value != null ? value.toString() : '—'}</AppText>
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
