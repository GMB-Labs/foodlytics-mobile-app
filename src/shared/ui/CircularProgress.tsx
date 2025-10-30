import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import AppText from '@/src/shared/ui/components/Typography';

type Props = {
  percent: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
};

export default function CircularProgress({ percent, size = 64, strokeWidth = 6, color = '#2FCCAC' }: Props) {
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="#F2F4F7"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          rotation={-90}
          origin={`${cx}, ${cy}`}
        />
      </Svg>

      <View style={[StyleSheet.absoluteFillObject, styles.labelWrap]}> 
        <AppText variant="ag10" style={{ color: '#111827' }}>{`${Math.round(percent)}%`}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelWrap: { alignItems: 'center', justifyContent: 'center' },
});
