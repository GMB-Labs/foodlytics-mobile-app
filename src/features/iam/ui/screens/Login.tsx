import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import AppText from "@/src/shared/ui/components/Typography";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  function handleLogin() {
    // TODO: Integrar Auth0 login flow
    // Por ahora va directo a onboarding
    router.replace("/onboarding/step-dob");
  }

  function handleRegister() {
    // TODO: Integrar Auth0 signup flow
    router.push("/register");
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient colors={["#2fccac", "#24a88c"]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          {/* Header centrado */}
          <View className="flex-1 items-center justify-center px-6 pt-16 pb-8">
            {/* Logo/Icon */}
            <View className="bg-white rounded-3xl shadow-lg w-24 h-24 items-center justify-center mb-6">
              <Image
                source={require("@/assets/icons/fork-icon.svg")}
                style={{ width: 40, height: 60 }}
                contentFit="contain"
              />
            </View>

            {/* Título */}
            <AppText variant="ag1" align="center" color="#FFFFFF">
              Foodlytics
            </AppText>

            {/* Subtítulo */}
            <AppText variant="ag7" align="center" color="rgba(255,255,255,0.9)">
              Monitorea tus macros con IA
            </AppText>
          </View>

          {/* Botones en la parte inferior */}
          <View 
            className="px-8 pb-8"
            style={{ paddingBottom: Math.max(32, insets.bottom + 16) }}
          >
            {/* Botón Registrarse (blanco) */}
            <TouchableOpacity
              onPress={handleRegister}
              className="bg-white rounded-[20px] mb-4 items-center justify-center"
              style={{ height: 56 }}
            >
              <AppText variant="ag9" align="center" color="#000000">
                Registrarse
              </AppText>
            </TouchableOpacity>

            {/* Botón Iniciar Sesión (verde) */}
            <TouchableOpacity
              onPress={handleLogin}
              className="bg-[#2fccac] rounded-[20px] items-center justify-center"
              style={{ height: 56 }}
            >
              <AppText variant="ag9" align="center" color="#FFFFFF">
                Iniciar Sesión
              </AppText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
