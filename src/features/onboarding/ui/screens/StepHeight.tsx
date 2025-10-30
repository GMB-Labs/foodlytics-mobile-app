import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { View, TouchableOpacity, Text, FlatList, LayoutChangeEvent } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PrimaryGradient } from "@/src/shared/ui/components/Gradients";
import ProgressBar from "@/src/shared/ui/ProgressBar";
import OnboardingCard from "@/src/features/onboarding/ui/OnboardingCard";
import AppText from "@/src/shared/ui/components/Typography";
import { useOnboarding } from "@/src/features/onboarding/application/OnboardingProvider";
import type { OnboardingActions } from "@/src/features/onboarding/application/store";
import * as Haptics from 'expo-haptics';
import { Pressable } from 'react-native';
import OnboardingFooter from '@/src/features/onboarding/ui/OnboardingFooter';

const MIN = 50;
const MAX = 250;
const ITEM_H = 50; 
function AutoRepeatPressable({
  children,
  onStep,
  delay = 350, 
  interval = 70, 
}: {
  children: React.ReactNode;
  onStep: () => void;
  delay?: number;
  interval?: number;
}) {
  const timer = React.useRef<NodeJS.Timeout | null>(null);
  const repeater = React.useRef<NodeJS.Timeout | null>(null);

  const clearAll = () => {
    if (timer.current) clearTimeout(timer.current);
    if (repeater.current) clearInterval(repeater.current as unknown as number);
    timer.current = null;
    repeater.current = null;
  };

  return (
    <Pressable
      onPress={() => { onStep(); Haptics.selectionAsync().catch(() => {}); }}
      onPressIn={() => {
        timer.current = setTimeout(() => {
          onStep();
          Haptics.selectionAsync().catch(() => {});
          repeater.current = setInterval(() => {
            onStep();
            Haptics.selectionAsync().catch(() => {});
          }, interval) as unknown as NodeJS.Timeout;
        }, delay) as unknown as NodeJS.Timeout;
      }}
      onPressOut={clearAll}
      onTouchEnd={clearAll}
      style={{ position: 'absolute' }}
    >
      {children}
    </Pressable>
  );
}

export default function StepHeight() {
  const router = useRouter();
  const [state, actions] = useOnboarding();
  // default to 150cm if onboarding state has no value yet
  const initial = state.heightCm ?? 150;
  const [height, setHeight] = useState<number>(initial);

  const listRef = useRef<FlatList<number>>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  const data = useMemo(() => Array.from({ length: MAX - MIN + 1 }, (_, i) => MIN + i), []);

  const clamp = (v: number) => Math.min(MAX, Math.max(MIN, Math.round(v)));

  const scrollToValue = useCallback((v: number, animated = true) => {
    const idx = clamp(v) - MIN;
    listRef.current?.scrollToOffset({ offset: idx * ITEM_H, animated });
  }, []);

  const increase = () => {
    const next = clamp(height + 1);
    setHeight(next);
    scrollToValue(next);
  };

  const decrease = () => {
    const next = clamp(height - 1);
    setHeight(next);
    scrollToValue(next);
  };

  const isValid = height >= MIN && height <= MAX;

  const onContinue = () => {
    if (!isValid) return;
    (actions as OnboardingActions).setHeightCm(height);
    router.push("/onboarding/step-weight");
  };

  const onMomentumEnd = (y: number) => {
    const v = clamp(MIN + Math.round(y / ITEM_H));
    if (v !== height) setHeight(v);
  };

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerHeight(e.nativeEvent.layout.height);
  };

  useEffect(() => {
    if (containerHeight > 0) scrollToValue(initial, false);
  }, [containerHeight]);

  return (
    <View className="flex-1 bg-[#FFFFFF]">
      <PrimaryGradient style={{ position: "absolute", top: 0, left: 0, right: 0 }} height={200} />

      <View className="flex-1">
        <View className="h-28 px-8 pt-16">
          <ProgressBar step={3} total={8} containerStyle={{ paddingHorizontal: 32 }} />
        </View>

        <OnboardingCard paddingHorizontal={32} paddingTop={24}>
<View className="flex-1">
  {/* Header */}
  <View className="items-center mb-6">
    <View className="w-20 h-20 rounded-full items-center justify-center mb-2" style={{ backgroundColor: '#E6FAF5' }}>
      <Text className="text-3xl">📏</Text>
    </View>
    <AppText variant="ag3" align="center" color="#111827">¿Cuál es tu altura?</AppText>
    <AppText variant="ag9" align="center" color="#6B7280">Desliza para ajustar en centímetros</AppText>
  </View>

  {/* Picker CENTRADO en la tarjeta */}
<View className="flex-1 items-center justify-center -mt-20" onLayout={onLayout}>
    <View style={{ width: 220, height: ITEM_H * 5, alignItems: 'center', justifyContent: 'center' }}>
      {/* Guías finas del activo */}
      <View style={{ position: 'absolute', top: ITEM_H * 2, left: 24, right: 24, height: 0.5, backgroundColor: '#E5E7EB' }} />
      <View style={{ position: 'absolute', top: ITEM_H * 3, left: 24, right: 24, height: 0.5, backgroundColor: '#E5E7EB' }} />

      {/* Fades */}
      <LinearGradient colors={['#FFFFFF', 'rgba(255,255,255,0)']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: ITEM_H * 1.2, zIndex: 1 }} />
      <LinearGradient colors={['rgba(255,255,255,0)', '#FFFFFF']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: ITEM_H * 1.2, zIndex: 1 }} />

      {/* Lista vertical con snap */}
      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(v) => String(v)}
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({ length: ITEM_H, offset: ITEM_H * index, index })}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: (ITEM_H * 5) / 2 - ITEM_H / 2 }}
        onScrollEndDrag={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          const v = clamp(MIN + Math.round(y / ITEM_H));
          if (v !== height) { setHeight(v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); }
        }}
        onMomentumScrollEnd={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          const v = clamp(MIN + Math.round(y / ITEM_H));
          if (v !== height) { setHeight(v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); }
        }}
        renderItem={({ item }) => {
          const dist = Math.abs(item - height);
          const active = dist === 0;
          const opacity = dist === 0 ? 1 : dist === 1 ? 0.6 : dist === 2 ? 0.35 : 0.18;
          const size = active ? 30 : 18;

          return (
            <View style={{ height: ITEM_H, alignItems: 'center', justifyContent: 'center' }}>
              <Text
                style={{
                  fontSize: size,
                  fontFamily: 'Poppins-Medium',
                  color: active ? '#111827' : '#6B7280',
                  opacity,
                  fontVariant: ['tabular-nums'],
                }}
                allowFontScaling={false}
              >
                {item} cm
              </Text>
            </View>
          );
        }}
      />

      {/* ZONAS TÁCTILES INVISIBLES para step -/+ */}
      <AutoRepeatPressable onStep={() => { const v = clamp(height - 1); setHeight(v); listRef.current?.scrollToOffset({ offset: (v - MIN) * ITEM_H, animated: true }); }}>
        <View style={{ position: 'absolute', left: -60, top: 0, bottom: 0, width: 60 }} />
      </AutoRepeatPressable>
      <AutoRepeatPressable onStep={() => { const v = clamp(height + 1); setHeight(v); listRef.current?.scrollToOffset({ offset: (v - MIN) * ITEM_H, animated: true }); }}>
        <View style={{ position: 'absolute', right: -60, top: 0, bottom: 0, width: 60 }} />
      </AutoRepeatPressable>
    </View>
  </View>
</View>
</OnboardingCard>
</View>

 <OnboardingFooter onBack={() => router.back()} onContinue={onContinue} disabledContinue={!isValid} />
    </View>
  );
}
