import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { PrimaryGradient } from "@/src/shared/ui/components/Gradients";
import ProgressBar from "@/src/shared/ui/ProgressBar";
import OnboardingCard from "@/src/shared/ui/OnboardingCard";
import AppText from "@/src/shared/ui/components/Typography";
import { useOnboarding } from "@/src/features/onboarding/application/OnboardingProvider";
import type { OnboardingActions } from "@/src/features/onboarding/application/store";
import WeightScale from "@/src/shared/ui/WeightScale";
import OnboardingFooter from '@/src/shared/ui/OnboardingFooter';

const clamp1 = (n: number) => Number(n.toFixed(1));
const SECTION_GAP = 70; // espacio vertical entre bloques

export default function StepGoalWeight() {
  const router = useRouter();
  const [state, actions] = useOnboarding();

  // altura desde el provider (seteada en StepHeight)
  const heightCm = state.heightCm ?? 170;
  const h = heightCm / 100;

  // IMC saludable (adultos) 18.5–24.9
  const healthyMin = clamp1(18.5 * h * h);
  const healthyMax = clamp1(24.9 * h * h);

  // valor inicial
  const initial =
    typeof state.goalWeightKg === "number"
      ? clamp1(state.goalWeightKg)
      : clamp1((healthyMin + healthyMax) / 2);

  const [goal, setGoal] = useState<number>(initial);
  const [containerW, setContainerW] = useState<number | null>(null);

  const onContinue = () => {
    (actions as OnboardingActions).setGoalWeightKg?.(goal);
    router.push("/onboarding/step-activity-level");
  };

  const isValid = goal >= healthyMin && goal <= healthyMax;
  
  return (
    <View className="flex-1 bg-[#FFFFFF]">
      <PrimaryGradient style={{ position: "absolute", top: 0, left: 0, right: 0 }} height={200} />

      <View className="flex-1">
        <View className="h-28 px-8 pt-16">
          <ProgressBar step={5} total={8} containerStyle={{ paddingHorizontal: 32 }} />
        </View>

        <OnboardingCard paddingHorizontal={32} paddingTop={24} style={{ paddingBottom: 16 }}>
          {/* usamos un contenedor con gap consistente */}
          <View style={{ gap: SECTION_GAP }}>
            {/* Header */}
            <View style={{ alignItems: "center" }}>
              <View className="w-20 h-20 rounded-full items-center justify-center mb-2" style={{ backgroundColor: "#E6FAF5" }}>
                <Text className="text-3xl">🎯</Text>
              </View>
              <AppText variant="ag3" align="center" color="#111827">¿Cuál es tu peso objetivo?</AppText>
              <AppText variant="ag9" align="center" color="#6B7280">Debe estar dentro de un rango saludable</AppText>
            </View>

            {/* Contenedor adaptable para báscula + chip (mejora layout en Android) */}
            <View
              style={{ width: '100%', alignItems: 'center',  marginBottom: 2 }}
              onLayout={(e) => {
                const w = e.nativeEvent.layout.width || 0;
                setContainerW(w);
              }}
            >
              {/* Calcula glassWidth en función del ancho disponible (reserva padding visual) */}
              {/**
               * glassWidth: preferente hasta 420, mínimo 260 — se adapta al ancho del card
               */}
              {containerW !== null ? (
                <WeightScale
                  value={goal}
                  onChange={setGoal}
                  glassWidth={Math.max(260, Math.min(420, containerW - 48))}
                />
              ) : (
                // fallback mientras se mide
                <WeightScale value={goal} onChange={setGoal} />
              )}

              {/* Chip con rango saludable: flexibles y centrados */}
              <View style={{ marginTop: 30, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 16, backgroundColor: '#EFF6FF', alignItems: 'center', width: '100%', maxWidth: 420 }}>
                <AppText variant="ag10" align="center" color="#6B7280">
                  Rango saludable basado en tu altura y peso actual:
                </AppText>
                <AppText variant="ag9" align="center" color="#111827">
                  {healthyMin.toFixed(1)} – {healthyMax.toFixed(1)} kg
                </AppText>
              </View>
            </View>
          </View>
        </OnboardingCard>
      </View>

      {/* Footer */}
      <OnboardingFooter onBack={() => router.back()} onContinue={onContinue} disabledContinue={!isValid} />
    </View>
  );
}
