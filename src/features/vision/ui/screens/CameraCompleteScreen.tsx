// src/features/vision/ui/screens/CameraCompleteScreen.tsx
import React from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { CompletionScreen } from "@/src/shared/ui/screens/CompletionScreen";
import { useTodayISO } from "@/src/shared/hooks/useTodayISO";

export default function CameraCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as any;
  const todayISO = useTodayISO();

  const dateISO = (params?.dateISO as string | undefined) ?? todayISO;
  const det = params?.det as string | undefined;

  let message =
    "Se ha agregado Plátano y Aguacate a tu registro diario";

  if (det) {
    try {
      const parsed = JSON.parse(decodeURIComponent(det));
      if (parsed?.items?.length) {
        const names = parsed.items.map((it: any) => it.name).slice(0, 3);
        const list =
          names.length === 1
            ? names[0]
            : names.length === 2
            ? `${names[0]} y ${names[1]}`
            : `${names[0]}, ${names[1]} y más`;
        message = `Se ha agregado ${list} a tu registro diario`;
      }
    } catch {}
  }

  const goToMeals = () => {
    router.push(`/(tabs)/meals?dateISO=${encodeURIComponent(dateISO)}` as any);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <CompletionScreen
        heading="¡Comida registrada!"
        message={message}
        icon={require("@/assets/lottie/verify.json")}
        autoRedirectMs={4000}
        onAutoRedirect={goToMeals}
      />
    </>
  );
}
