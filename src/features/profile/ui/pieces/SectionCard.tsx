import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "@/src/shared/ui/components/Typography";
import { COLORS, s, cardShadow } from "../tokens";

export default function SectionCard({
  title,
  right,
  children,
  padded = true,
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  padded?: boolean;
}) {
  return (
    <View style={[styles.card, cardShadow()]}>
      {(title || right) && (
        <View style={[styles.header, !right && styles.headerSimple]}>
          {title ? <AppText variant="ag7" color={COLORS.text}>{title}</AppText> : <View />}
          {right}
        </View>
      )}
      <View style={padded ? styles.body : undefined}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: s(16) },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: s(20),
    paddingVertical: s(20),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerSimple: { justifyContent: "flex-start" },
  body: { padding: s(20) },
});
