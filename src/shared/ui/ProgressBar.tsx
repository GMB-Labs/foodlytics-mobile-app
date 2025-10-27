import React from 'react';
import { View, ViewProps, Text, StyleSheet } from 'react-native';

type ProgressBarProps = {
  step: number;
  total: number;
  height?: number;
  containerStyle?: ViewProps['style'];
};

export default function ProgressBar({ step, total, height = 8, containerStyle }: ProgressBarProps) {
  const progress = Math.max(0, Math.min(1, total > 0 ? step / total : 0));

  return (
    <View style={[{ paddingHorizontal: 16 }, containerStyle] as any}>
      <View style={[styles.track, { height, borderRadius: height / 2 }] as any}>
        <View style={[styles.fill, { width: `${Math.round(progress * 100)}%`, height } as any]} />
      </View>
      <View style={{ marginTop: 6 }}>
        <Text style={styles.label}>{`${step} de ${total}`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
  },
  label: {
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'right',
    fontSize: 13,
  },
});

