import React from "react";
import { Redirect } from "expo-router";
import useSession from "@/src/shared/hooks/useSession";

export default function Index() {
  const [session] = useSession();

  if (session.loading) return null;

  return <Redirect href={session.isAuthenticated ? "/(tabs)" : "/login"} />;
}
