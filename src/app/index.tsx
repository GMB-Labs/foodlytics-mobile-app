import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import useSession from "@/src/shared/hooks/useSession";

/**
 * Pantalla raíz que maneja la navegación inicial:
 * - Muestra loader mientras se restaura la sesión
 * - Redirige a tabs si está autenticado
 * - Redirige a login si no está autenticado
 */
export default function Index() {
  const [session] = useSession();

  // Mostrar loader mientras se restaura la sesión desde SecureStore
  if (session.loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2fccac" />
      </View>
    );
  }

  // Redirigir según estado de autenticación y perfil completado
  if (!session.isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Si está autenticado pero no ha completado el perfil, redirigir a onboarding (primera pantalla)
  if (session.userProfileCompleted === false) {
    return <Redirect href="/onboarding/step-name" />;
  }

  // Si está autenticado y tiene perfil completado, ir a tabs
  return <Redirect href="/(tabs)" />;
}
