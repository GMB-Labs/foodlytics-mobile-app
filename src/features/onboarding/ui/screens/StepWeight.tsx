import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PrimaryGradient } from "@/src/shared/ui/components/Gradients";
import ProgressBar from "@/src/shared/ui/ProgressBar";
import OnboardingCard from "@/src/shared/ui/OnboardingCard";
import AppText from "@/src/shared/ui/components/Typography";
import { useOnboarding } from "@/src/features/onboarding/application/OnboardingProvider";
import type { OnboardingActions } from "@/src/features/onboarding/application/store";
import * as Haptics from "expo-haptics";
import { Pressable } from "react-native";
import { Platform, PixelRatio } from "react-native";

// ====== Config ======
const MIN = 20;
const MAX = 300;
const STEP = 0.5;
const ITEM_W = 84;       // ancho por “paso” de 0.5 kg
  const DEFAULT_SCALE_W = 300; // fallback ancho del panel “vidrio"
  const SCALE_H = 140; // alto del panel “vidrio"
const DEFAULT_WEIGHT = 70;
const px = (n: number) => (Platform.OS === 'android' ? Math.round(n) : n);

// ====== Helper: Pressable con auto-repeat (tap y press&hold) ======
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
      onPress={() => {
        onStep();
        Haptics.selectionAsync().catch(() => {});
      }}
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
      style={{ position: "absolute" }}
    >
      {children}
    </Pressable>
  );
}

export default function StepWeight() {
  const router = useRouter();
  const [state, actions] = useOnboarding();

  // valor inicial (o 70 kg)
  const initial = state.weightKg ?? DEFAULT_WEIGHT;
  const [weight, setWeight] = useState<number>(initial);

  // datos: 20 .. 300 en pasos de 0.5
  const count = Math.round((MAX - MIN) / STEP) + 1;
  const data = useMemo(
    () =>
      Array.from({ length: count }, (_, i) =>
        Math.round((MIN + i * STEP) * 10) / 10
      ),
    [count]
  );

  const clamp = (v: number) =>
    Math.min(MAX, Math.max(MIN, Math.round(v * 10) / 10));

  const listRef = useRef<FlatList<number>>(null);
  const [scaleWidth, setScaleWidth] = useState<number>(DEFAULT_SCALE_W);

  const scrollToValue = useCallback((v: number, animated = true) => {
    const idx = Math.round((clamp(v) - MIN) / STEP);
    listRef.current?.scrollToOffset({ offset: idx * ITEM_W, animated });
  }, []);

    const onMomentumEnd = (x: number) => {
    const idx = Math.round(x / ITEM_W);
    const targetX = idx * ITEM_W;

    if (Platform.OS === 'android' && Math.abs(targetX - x) > 0.5) {
        // corrige el offset al centro exacto del ítem
        listRef.current?.scrollToOffset({ offset: targetX, animated: false });
    }

    const v = clamp(MIN + idx * STEP);
    if (v !== weight) {
        setWeight(v);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    };

  // sincroniza al montar una vez que conocemos el ancho real del panel (Android puede reportar distinto)
  useEffect(() => {
    if (scaleWidth > 0) {
      // small timeout to ensure FlatList measured
      const id = setTimeout(() => scrollToValue(initial, false), 0);
      return () => clearTimeout(id);
    }
  }, [scaleWidth]);

  // helpers de stepping invisible (zonas laterales)
  const stepDown = () => {
    const v = clamp(weight - STEP);
    setWeight(v);
    scrollToValue(v);
  };
  const stepUp = () => {
    const v = clamp(weight + STEP);
    setWeight(v);
    scrollToValue(v);
  };

  const isValid = weight >= MIN && weight <= MAX;

  const onContinue = () => {
    if (!isValid) return;
    (actions as OnboardingActions).setWeightKg(weight);
    router.push("/onboarding/step-goal-weight");
  };

  return (
    <View className="flex-1 bg-[#F3F4F6]">
      <PrimaryGradient
        style={{ position: "absolute", top: 0, left: 0, right: 0 }}
        height={200}
      />

      <View className="flex-1">
        <View className="h-28 px-8 pt-16">
          <ProgressBar
            step={4}
            total={7}
            containerStyle={{ paddingHorizontal: 32 }}
          />
        </View>

        <OnboardingCard paddingHorizontal={32} paddingTop={24}>
          {/* Header */}
          <View className="items-center mb-4">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-2"
              style={{ backgroundColor: "#E6FAF5" }}
            >
              <Text className="text-3xl">⚖️</Text>
            </View>
            <AppText variant="ag3" align="center" color="#111827">
              ¿Cuánto pesas?
            </AppText>
            <AppText variant="ag9" align="center" color="#6B7280">
              Desliza o toca los lados para ajustar en kilogramos
            </AppText>
          </View>

          {/* ====== BÁSCULA ====== */}
          <View className="flex-1 items-center justify-center -mt-40">
            {/* display “digital” */}
            <View style={{ alignItems: "center", marginBottom: 12 }}>
                  <Text style={{ fontSize: 36, fontFamily: 'Poppins-SemiBold', color: '#111827' }}>
                    {weight.toFixed(1)}
                    <Text style={{ fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B7280' }}> kg</Text>
                  </Text>
            </View>

            {/* panel “vidrio” con ruler + aguja */}
                <View
                  onLayout={(e) => {
                    const w = e.nativeEvent.layout.width || DEFAULT_SCALE_W;
                    setScaleWidth(w);
                  }}
                  style={{
                    width: '100%',
                    maxWidth: DEFAULT_SCALE_W,
                    height: SCALE_H,
                    borderRadius: 18,
                    backgroundColor: "rgba(255,255,255,0.96)",
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    overflow: "hidden",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
              {/* brillo superior */}
              <LinearGradient
                colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0)"]}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 22,
                }}
              />

              {/* aguja central */}
              <View
                style={{
                  position: "absolute",
                  top: 24,
                  bottom: 24,
                  left: "50%",
                  width: 3,
                  marginLeft: -1.5,
                  backgroundColor: "#2FCCAC",
                  borderRadius: 3,
                  zIndex: 3,
                }}
              />
              {/* “botón” de aguja */}
              <View
                style={{
                  position: "absolute",
                  bottom: 22,
                  left: "50%",
                  marginLeft: -8,
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: "#2FCCAC",
                  zIndex: 3,
                }}
              />

              {/* fades laterales */}
              <LinearGradient
                colors={["#FFFFFF", "rgba(255,255,255,0)"]}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 40,
                  zIndex: 2,
                }}
              />
              <LinearGradient
                colors={["rgba(255,255,255,0)", "#FFFFFF"]}
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 40,
                  zIndex: 2,
                }}
              />

              {/* RULER horizontal con ticks */}
                  <FlatList
                ref={listRef}
                data={data}
                horizontal
                keyExtractor={(v) => String(v)}
                showsHorizontalScrollIndicator={false}
                getItemLayout={(_, index) => ({
                  length: ITEM_W,
                  offset: ITEM_W * index,
                  index,
                })}
                snapToInterval={ITEM_W}
                decelerationRate="fast"
                  contentContainerStyle={{
                    paddingHorizontal: Math.max(0, (scaleWidth - ITEM_W) / 2),
                  }}
                onScrollEndDrag={(e) =>
                  onMomentumEnd(e.nativeEvent.contentOffset.x)
                }
                onMomentumScrollEnd={(e) =>
                  onMomentumEnd(e.nativeEvent.contentOffset.x)
                }
                renderItem={({ item }) => {
                  // STEP=0.5 → marcamos 0.5 (pequeño), 1 (medio), 5 (alto con etiqueta)
                  const isInt =
                    Math.abs(item * 10 - Math.round(item * 10)) < 0.0001 &&
                    Math.round(item * 10) % 10 === 0;
                  const isFive = isInt && Math.round(item) % 5 === 0;

                  const lineH = isFive ? 28 : isInt ? 18 : 10;
                  const lineColor = isFive ? "#94A3B8" : "#CBD5E1";

                  return (
                    <View
                        style={{
                        width: ITEM_W,
                        height: SCALE_H,
                        alignItems: 'center',
                        justifyContent: 'center',
                        }}
                    >
                        {/* tick - CENTRADO */}
                        <View
                        style={{
                            position: 'absolute',
                            top: 40,
                            left: ITEM_W / 2 - 1, // <- centra el tick de 2px
                            width: 2,
                            height: lineH,
                            backgroundColor: lineColor,
                            borderRadius: 2,
                        }}
                        />

                        {/* etiqueta cada 5 kg - CENTRADA */}
                        {isFive && (
                        <Text
                            style={{
                            position: 'absolute',
                            top: 40 + lineH + 6,
                            left: 0,                  // <- ocupa todo el ancho del ítem
                            right: 0,
                            textAlign: 'center',      // <- centro real
                            fontSize: 12,
                            color: '#6B7280',
                            fontVariant: ['tabular-nums'],
                            fontFamily: 'Poppins-Regular',
                            }}
                            allowFontScaling={false}
                        >
                            {Math.round(item)}
                        </Text>
                      )}
                    </View>
                  );
                }}
              />
            </View>

            {/* zonas táctiles invisibles para step -/+ */}
            <AutoRepeatPressable onStep={stepDown}>
              <View
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 100,
                }}
              />
            </AutoRepeatPressable>
            <AutoRepeatPressable onStep={stepUp}>
              <View
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 100,
                }}
              />
            </AutoRepeatPressable>
          </View>
          {/* ====== /BÁSCULA ====== */}
        </OnboardingCard>
      </View>

      {/* footer */}
      <View className="absolute left-0 right-0 bottom-10 px-8">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              backgroundColor: "white",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 16,
            }}
          >
            <Text style={{ color: "#374151", fontSize: 20 }}>‹</Text>
          </Pressable>

          <Pressable
            onPress={onContinue}
            disabled={!isValid}
            style={{
              flex: 1,
              height: 56,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isValid ? "#2FCCAC" : "#D1D5DB",
              opacity: isValid ? 1 : 0.6,
            }}
          >
            <AppText
              variant="ag9"
              align="center"
              color="#FFFFFF"
              style={{ fontFamily: "Poppins-Medium" }}
            >
              Continuar
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
