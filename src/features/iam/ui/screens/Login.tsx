import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AppText from "@/src/shared/ui/components/Typography";
import ForkIcon from "@/assets/icons/fork-icon.svg";
import useSession from "@/src/shared/hooks/useSession";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [session, sessionActions] = useSession();
  const [loading, setLoading] = useState(false);

  const runAuth = async (screenHint?: 'signup' | 'login') => {
    setLoading(true);
    try {
      await sessionActions.login({ screenHint });
      // After login we wait for session state to update (see effect below)
    } catch (err: any) {
      // handled inside the session hook
    } finally {
      setLoading(false);
    }
  };

  // When session updates after login, perform conditional navigation
  useEffect(() => {
    // Only react when authentication finished restoring
    if (session.loading) return;

    if (!session.isAuthenticated) return;

    // If backend indicates profile incomplete -> onboarding
    const profileCompleted = session.user?.user_profile_completed;
    // eslint-disable-next-line no-console
    console.log('[Login] session updated after auth', { profileCompleted, user: session.user });

    if (profileCompleted === false) {
      router.replace('/onboarding/step-dob');
    } else {
      router.replace('/(tabs)');
    }
  }, [session, router]);
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
              <ForkIcon width={40} height={50} fill="#2FCCAC" />
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
              onPress={() => runAuth('signup')}
              className="bg-white rounded-[20px] mb-4 items-center justify-center"
              style={{ height: 56, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              <AppText variant="ag9" align="center" color="#000000">
                {loading ? "Abriendo..." : "Registrarse"}
              </AppText>
            </TouchableOpacity>

            {/* Botón Iniciar Sesión (verde) */}
            <TouchableOpacity
              onPress={() => runAuth('login')}
              className="bg-[#2fccac] rounded-[20px] items-center justify-center"
              style={{ height: 56, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              <AppText variant="ag9" align="center" color="#FFFFFF">
                {loading ? "Conectando..." : "Iniciar Sesión"}
              </AppText>
            </TouchableOpacity>
            {loading && (
              <View style={{ marginTop: 12, alignItems: "center" }}>
                <ActivityIndicator color="#FFFFFF" />
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
