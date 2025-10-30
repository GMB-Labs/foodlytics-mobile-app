import React from 'react';
import { View } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import ConsumedIcon from '@/assets/icons/ConsumedIcon.svg';
import BurnedIcon from '@/assets/icons/BurnedIcon.svg';
import RemainingIcon from '@/assets/icons/RemainingIcon.svg';
import RingProgress from './RingProgress';
import { styles } from './styles';

type Props = {
  consumed?: number; burned?: number; goal?: number; remaining?: number; progress?: number; ringSize?: number; ringThickness?: number;
};

export default function CaloriesCard({ consumed = 0, burned = 0, goal = 0, remaining = 0, progress = 0, ringSize = 80, ringThickness = 12 }: Props) {
  const consumedStr = consumed != null && consumed !== 0 ? consumed.toString() : '0';
  const goalStr = goal != null && goal !== 0 ? goal.toString() : '0';
  return (
    <>
      <AppText variant="ag9" style={{ color: '#4A5565' }}>Calorías de Hoy</AppText>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
        <AppText variant="ag1" style={{ color: '#2FCCAC' }}>{consumedStr}</AppText>
        <AppText variant="ag7" style={{ color: '#99A1AF', marginLeft: 8 }}>/ {goalStr}</AppText>
        <View style={{ flex: 1 }} />
        <RingProgress size={ringSize} thickness={ringThickness} progress={progress ?? 0} label={`${Math.round((progress ?? 0) * 100)}%`} />
      </View>

      <View style={styles.divider} />

      <View style={[styles.metricsRow, { gap: 6 }] }>
        <View style={styles.metricCol}>
          <View style={styles.metricIcon}><ConsumedIcon width={16} height={16} color="#2FCCAC" /></View>
          <AppText variant="ag10" style={styles.muted}>Consumidas</AppText>
          <AppText variant="ag6">{consumed != null ? consumed.toString() : '0'}</AppText>
        </View>
        <View style={styles.metricCol}>
          <View style={styles.metricIcon}><BurnedIcon width={16} height={16} color="#FF5A3D" /></View>
          <AppText variant="ag10" style={styles.muted}>Quemadas</AppText>
          <AppText variant="ag6">{burned != null ? burned.toString() : '0'}</AppText>
        </View>
        <View style={styles.metricCol}>
          <View style={styles.metricIcon}><RemainingIcon width={16} height={16} color="#2B7FFF" /></View>
          <AppText variant="ag10" style={styles.muted}>Restantes</AppText>
          <AppText variant="ag6">{remaining != null ? remaining.toString() : '0'}</AppText>
        </View>
      </View>
    </>
  );
}
