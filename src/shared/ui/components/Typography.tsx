// src/shared/ui/components/Typography.tsx
import React from "react";
import { Text as RNText } from "react-native";
import type { TextProps, TextStyle } from "react-native";

const variants = {
  ag1:  { fontSize: 36, lineHeight: 40 },
  ag2:  { fontSize: 30, lineHeight: 36 },
  ag3:  { fontSize: 24, lineHeight: 32 },
  ag4:  { fontSize: 24, lineHeight: 24 },
  ag5:  { fontSize: 20, lineHeight: 28 },
  ag6:  { fontSize: 18, lineHeight: 28 },
  ag7:  { fontSize: 16, lineHeight: 24 },
  ag8:  { fontSize: 15, lineHeight: 24 },
  ag9:  { fontSize: 14, lineHeight: 20 },
  ag10: { fontSize: 12, lineHeight: 16 },
} as const;

type Variant = keyof typeof variants;

type Props = TextProps & {
  variant?: Variant;
  align?: TextStyle["textAlign"];
  color?: string;
};

export default function AppText({
  variant = "ag7",
  align,
  color = "#1A1A1A",
  style,
  ...rest
}: Props) {
  const v = variants[variant];
  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily: "Poppins-Regular",
          fontSize: v.fontSize,
          lineHeight: v.lineHeight,
          color,
          letterSpacing: 0,
        },
        align ? { textAlign: align } : null,
        style,
      ]}
    />
  );
}
