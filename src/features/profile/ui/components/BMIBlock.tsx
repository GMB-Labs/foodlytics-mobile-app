import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "@/src/shared/ui/components/Typography";
import { COLORS, s, cardShadow } from "../tokens";

export default function BMIBlock({ bmi, label }: { bmi: number; label: string }) {
  return (
    <View style={[styles.wrap, cardShadow()]}>
      <View style={{ gap: s(4) }}>
        <AppText variant="ag9" color={COLORS.subtext}>IMC Actual</AppText>
        <AppText variant="ag1" color={COLORS.brandA}>{bmi}</AppText>
      </View>
      <View style={styles.badge}>
        <AppText variant="ag9" color={COLORS.success}>{label}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    padding: s(16),
    borderRadius: s(20),
    marginTop: s(8),
  },
  badge: {
    backgroundColor: COLORS.successBg,
    paddingHorizontal: s(16),
    paddingVertical: s(8),
    borderRadius: s(18),
  },
});
