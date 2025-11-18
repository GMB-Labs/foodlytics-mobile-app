
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { ViewProps, useColorScheme } from "react-native";
import { useTheme } from '@/src/shared/styles/useTheme';

type Mode = "light" | "dark" | "system";

export function PrimaryGradient(
  props: ViewProps & { height?: number; mode?: Mode; colors?: string[] }
) {
  const { style, height = 220, children, mode, colors, ...rest } = props;
  const scheme = useColorScheme();
  const { mode: themeMode } = useTheme();

  // resolution order: explicit colors prop -> explicit mode prop -> provider mode -> system
  const effectiveMode: "light" | "dark" = (() => {
    if (colors && colors.length > 0) return scheme === 'dark' ? 'dark' : 'light';
    const chosen = mode ?? themeMode ?? 'system';
    const resolved = chosen === 'system' ? (scheme === 'dark' ? 'dark' : 'light') : chosen;
    return resolved as "light" | "dark";
  })();

  let gradientColors = colors;
  let start = { x: 0, y: 0 };
  let end = { x: 1, y: 1 };

  if (!gradientColors) {
    if (effectiveMode === "dark") {
      // dark: linear-gradient
      gradientColors = ["#0B4B3E", "#142D28"];
      start = { x: 0, y: 0 };
      end = { x: 0, y: 1 };
    } else {
      // light: original diagonal gradient
      gradientColors = ["#2FCCAC", "#24A88C"];
      start = { x: 0, y: 0 };
      end = { x: 1, y: 1 };
    }
  }

  return (
    <LinearGradient
      colors={gradientColors as any}
      start={start}
      end={end}
      style={[{ height }, style]}
      {...rest}
    >
      {children}
    </LinearGradient>
  );
}
