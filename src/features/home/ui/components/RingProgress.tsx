import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import AppText from '@/src/shared/ui/components/Typography';

type Props = { size?: number; thickness?: number; progress?: number; label?: string };

export default function RingProgress({ size = 64, thickness = 10, progress = 0, label = '0%'}: Props) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * (progress ?? 0);
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
