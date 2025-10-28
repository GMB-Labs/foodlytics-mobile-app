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

  const onContinue = () => {
    (actions as OnboardingActions).setGoalWeightKg?.(goal);
    router.push("/onboarding/step-activity-level");
  };

  return (
    <View className="flex-1 bg-[#F3F4F6]">
      <PrimaryGradient style={{ position: "absolute", top: 0, left: 0, right: 0 }} height={200} />

      <View className="flex-1">
        <View className="h-28 px-8 pt-16">
          <ProgressBar step={5} total={7} containerStyle={{ paddingHorizontal: 32 }} />
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

            {/* Báscula: sin flex-1 ni margin negativos, y con margen inferior */}
            <View style={{ alignItems: "center", justifyContent: "center", marginTop: 4, marginBottom: 8 }}>
              {/* si quieres un poco más de aire vertical dentro de la báscula, puedes
                 pasar glassHeight={150} */}
              <WeightScale value={goal} onChange={setGoal} />
            </View>

            {/* Chip con rango saludable */}
            <View className="px-3 py-3 rounded-2xl" style={{ backgroundColor: "#EFF6FF" }}>
              <AppText variant="ag10" align="center" color="#6B7280">
                Rango saludable basado en tu altura y peso actual:
              </AppText>
              <AppText variant="ag9" align="center" color="#111827">
                {healthyMin.toFixed(1)} – {healthyMax.toFixed(1)} kg
              </AppText>
            </View>
          </View>
        </OnboardingCard>
      </View>

      {/* Footer */}
      <View className="absolute left-0 right-0 bottom-10 px-8">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-14 h-14 rounded-[12px] bg-white border border-gray-200 items-center justify-center mr-4"
          >
            <Text className="text-gray-700 text-xl">‹</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onContinue}
            className="flex-1 h-14 rounded-[20px] items-center justify-center bg-[#2FCCAC]"
          >
            <AppText variant="ag9" align="center" color="#FFFFFF" style={{ fontFamily: "Poppins-Medium" }}>
              Continuar
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
