import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, FlatList, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

type ScalePickerProps = {
  min: number;
  max: number;
  step?: number;
  value: number;
  onValueChange: (v: number) => void;
  unit?: string;
  width?: number; // max width
  height?: number;
  highlightRange?: { min: number; max: number } | null;
  showNeedleLabel?: boolean;
};

const DEFAULT_ITEM_W = 84;
const DEFAULT_SCALE_W = 300;
const DEFAULT_SCALE_H = 140;

export default function ScalePicker({ min, max, step = 1, value, onValueChange, unit = 'kg', width = DEFAULT_SCALE_W, height = DEFAULT_SCALE_H, highlightRange = null, showNeedleLabel = true }: ScalePickerProps) {
  const listRef = useRef<FlatList<number> | null>(null);
  const [scaleWidth, setScaleWidth] = useState<number>(width);
  const [itemWidth, setItemWidth] = useState<number>(DEFAULT_ITEM_W);

  const count = useMemo(() => Math.round((max - min) / step) + 1, [min, max, step]);
  const data = useMemo(() => Array.from({ length: count }, (_, i) => Math.round((min + i * step) * 10) / 10), [count, min, step]);

  const clamp = useCallback((v: number) => Math.min(max, Math.max(min, Math.round(v * 10) / 10)), [min, max]);

  const scrollToValue = useCallback((v: number, animated = true) => {
    const idx = Math.round((clamp(v) - min) / step);
    listRef.current?.scrollToOffset({ offset: idx * itemWidth, animated });
  }, [clamp, itemWidth, min, step]);

  useEffect(() => {
    // wait until measured
    const id = setTimeout(() => scrollToValue(value, false), 0);
    return () => clearTimeout(id);
  }, [value, scrollToValue]);

  const onMomentumEnd = useCallback((x: number) => {
    const padding = Math.max(0, (scaleWidth - itemWidth) / 2);
    const idx = Math.round((x + padding) / itemWidth);
    const v = clamp(min + idx * step);
    if (v !== value) {
      onValueChange(v);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [clamp, itemWidth, min, onValueChange, scaleWidth, step, value]);

  // auto step areas
  const stepDown = useCallback(() => {
    const v = clamp(value - step);
    onValueChange(v);
    scrollToValue(v);
  }, [clamp, onValueChange, scrollToValue, step, value]);
  const stepUp = useCallback(() => {
    const v = clamp(value + step);
    onValueChange(v);
    scrollToValue(v);
  }, [clamp, onValueChange, scrollToValue, step, value]);

  return (
    <View style={{ width: '100%', maxWidth: width, height, alignItems: 'center', justifyContent: 'center' }}>
      {/* center display */}
      <View style={{ position: 'absolute', top: 12, alignItems: 'center' }} pointerEvents="none">
        <Text style={{ fontSize: 36, fontFamily: 'Poppins-SemiBold', color: '#111827' }}>{value.toFixed(1)}<Text style={{ fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B7280' }}> {unit}</Text></Text>
      </View>

      <View onLayout={(e) => setScaleWidth(e.nativeEvent.layout.width || width)} style={{ width: '100%', maxWidth: width, height, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.96)', borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
        {/* top sheen */}
        <LinearGradient colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0)']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 22 }} />

        {/* center needle */}
        <View style={{ position: 'absolute', top: 20, bottom: 28, left: '50%', width: 3, marginLeft: -1.5, backgroundColor: '#2FCCAC', borderRadius: 3, zIndex: 3 }} />
        <View style={{ position: 'absolute', bottom: 18, left: '50%', marginLeft: -8, width: 16, height: 16, borderRadius: 8, backgroundColor: '#2FCCAC', zIndex: 3 }} />

        {/* small label near needle (right) */}
        {showNeedleLabel && (
          <View pointerEvents="none" style={{ position: 'absolute', top: 18, left: '50%', marginLeft: 14, zIndex: 4 }}>
            <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Poppins-Regular' }}>{Number.isInteger(value) ? String(Math.round(value)) : String(value)}</Text>
          </View>
        )}

        {/* side fades */}
        <LinearGradient colors={['#FFFFFF', 'rgba(255,255,255,0)']} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 40, zIndex: 2 }} />
        <LinearGradient colors={['rgba(255,255,255,0)', '#FFFFFF']} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 40, zIndex: 2 }} />

        <FlatList
          ref={listRef}
          data={data}
          horizontal
          keyExtractor={(v) => String(v)}
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, index) => ({ length: itemWidth, offset: itemWidth * index, index })}
          snapToInterval={itemWidth}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: Math.max(0, (scaleWidth - itemWidth) / 2) }}
          onScrollEndDrag={(e) => onMomentumEnd(e.nativeEvent.contentOffset.x)}
          onMomentumScrollEnd={(e) => onMomentumEnd(e.nativeEvent.contentOffset.x)}
          renderItem={({ item }) => {
            const isInt = Math.abs(item * 10 - Math.round(item * 10)) < 0.0001 && Math.round(item * 10) % 10 === 0;
            const isFive = isInt && Math.round(item) % 5 === 0;
            const lineH = isFive ? 28 : isInt ? 18 : 10;
            const inRange = highlightRange ? (item >= highlightRange.min && item <= highlightRange.max) : false;
            const lineColor = inRange ? '#2FCCAC' : (isFive ? '#94A3B8' : '#CBD5E1');

            return (
              <View onLayout={(e) => {
                const w = e.nativeEvent.layout.width;
                if (w && Math.abs(w - itemWidth) > 0.5) setItemWidth(w);
              }} style={{ width: itemWidth, height, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ position: 'absolute', top: 40, left: itemWidth / 2 - 1, width: 2, height: lineH, backgroundColor: lineColor, borderRadius: 2 }} />
                {isFive && (
                  <Text style={{ position: 'absolute', top: 40 + lineH + 6, left: 0, right: 0, textAlign: 'center', fontSize: 12, color: inRange ? '#2FCCAC' : '#6B7280', fontFamily: 'Poppins-Regular' }} allowFontScaling={false}>
                    {Math.round(item)}
                  </Text>
                )}
              </View>
            );
          }}
        />

        {/* invisible touch zones for continuous stepping */}
        <Pressable onPress={stepDown} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 100 }} />
        <Pressable onPress={stepUp} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 100 }} />
      </View>
    </View>
  );
}
