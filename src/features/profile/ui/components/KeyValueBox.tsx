import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "@/src/shared/ui/components/Typography";
import { s } from "../tokens";
import { useTheme } from '@/src/shared/styles/useTheme';

export default function KeyValueBox({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.box, { backgroundColor: (colors as any)?.mealRowBg ?? (colors as any)?.mealsCard }]}> 
      <AppText variant="ag10" color={(colors as any)?.muted}>{label}</AppText>
      <AppText variant="ag6" color={(colors as any)?.text}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    padding: s(12),
    borderRadius: s(20),
    width: "47%",
    gap: s(4),
  },
});
