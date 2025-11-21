import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack, Redirect } from "expo-router";
import useSession from "@/src/shared/hooks/useSession";

/**
 * Layout para pantallas públicas de autenticación:
 * - Muestra loader mientras se restaura la sesión
 * - Redirige a tabs si ya está autenticado (evita mostrar login innecesariamente)
 * - Renderiza stack de auth si no está autenticado
 */
export default function AuthLayout() {
  const [session] = useSession();

  // Mostrar loader mientras se restaura la sesión
  if (session.loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2fccac" />
      </View>
    );
  }

  // Si ya está autenticado, redirigir directamente a tabs (sesión restaurada)
  if (session.isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  // Renderizar stack de autenticación
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "transparent" },
      }}
    />
  );
}
