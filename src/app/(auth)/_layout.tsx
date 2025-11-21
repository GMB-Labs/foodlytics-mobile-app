import React from "react";
import { Stack, Redirect } from "expo-router";
import useSession from "@/src/shared/hooks/useSession";

export default function AuthLayout() {
  const [session] = useSession();

  if (session.loading) return null;
  if (session.isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

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
