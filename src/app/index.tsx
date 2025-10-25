import React from "react";
import { Redirect } from "expo-router";

export default function IndexRedirect() {
  // Use the declarative Redirect component so navigation happens when the
  // router is ready. This avoids calling router.replace too early.
  return <Redirect href="/login" />;
}
