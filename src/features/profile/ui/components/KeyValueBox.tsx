import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "@/src/shared/ui/components/Typography";
import { COLORS, s } from "../tokens";

export default function KeyValueBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.box}>
      <AppText variant="ag10" color={COLORS.subtext}>{label}</AppText>
      <AppText variant="ag6" color={COLORS.text}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: COLORS.chipBg,
    padding: s(12),
    borderRadius: s(20),
    width: "47%",
    gap: s(4),
  },
});
