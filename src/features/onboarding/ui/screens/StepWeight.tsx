import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { PrimaryGradient } from "@/src/shared/ui/components/Gradients";
import ProgressBar from "@/src/shared/ui/ProgressBar";
import OnboardingCard from "@/src/shared/ui/OnboardingCard";
import AppText from "@/src/shared/ui/components/Typography";
import { useOnboarding } from "@/src/features/onboarding/application/OnboardingProvider";
import type { OnboardingActions } from "@/src/features/onboarding/application/store";
import WeightScale from "@/src/shared/ui/WeightScale";

// ====== Config ======
const MIN = 20;
const MAX = 300;
const DEFAULT_WEIGHT = 70;

export default function StepWeight() {
  const router = useRouter();
  const [state, actions] = useOnboarding();

  // valor inicial (o 70 kg)
  const initial = state.weightKg ?? DEFAULT_WEIGHT;
  const [weight, setWeight] = useState<number>(initial);

  const isValid = weight >= MIN && weight <= MAX;

  const onContinue = () => {
    if (!isValid) return;
    (actions as OnboardingActions).setWeightKg(weight);
    router.push("/onboarding/step-goal-weight");
  };

  return (
    <View className="flex-1 bg-[#F3F4F6]">
      <PrimaryGradient style={{ position: "absolute", top: 0, left: 0, right: 0 }} height={200} />

      <View className="flex-1">
        <View className="h-28 px-8 pt-16">
          <ProgressBar step={4} total={7} containerStyle={{ paddingHorizontal: 32 }} />
        </View>

        <OnboardingCard paddingHorizontal={32} paddingTop={26}>
          {/* Header */}
          <View className="items-center mb-4">
            <View className="w-20 h-20 rounded-full items-center justify-center mb-2" style={{ backgroundColor: "#E6FAF5" }}>
              <Text className="text-3xl">⚖️</Text>
            </View>
            <AppText variant="ag3" align="center" color="#111827">¿Cuánto pesas?</AppText>
            <AppText variant="ag9" align="center" color="#6B7280">Desliza o toca los lados para ajustar en kilogramos</AppText>
          </View>

          {/* ====== BÁSCULA (misma caja y espacio que tenías) ====== */}
          <View className="flex-1 items-center justify-center -mt-80">
            {/* display “digital” que ya usabas */}
            <View style={{ alignItems: "center", marginBottom: 12 }}>
              <Text style={{ fontSize: 36, fontFamily: "Poppins-SemiBold", color: "#111827" }}>
                {weight.toFixed(1)}
                <Text style={{ fontSize: 14, fontFamily: "Poppins-Regular", color: "#6B7280" }}> kg</Text>
              </Text>
            </View>

            {/* Reemplazo todo el panel + FlatList por el componente reusable */}
            <WeightScale value={weight} onChange={setWeight} showReadout={false} />
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
            <AppText variant="ag9" align="center" color="#FFFFFF" style={{ fontFamily: "Poppins-Medium" }}>
              Continuar
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
