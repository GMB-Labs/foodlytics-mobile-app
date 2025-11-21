import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "@/src/shared/ui/components/Typography";
import { s, cardShadow } from "../tokens";
import { useTheme } from '@/src/shared/styles/useTheme';

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
  const { colors } = useTheme();

  const cardStyle = [styles.card, cardShadow(), { backgroundColor: (colors as any)?.mealsCard }];
  const headerStyle = [styles.header, !right && styles.headerSimple, { borderBottomColor: (colors as any)?.border }];

  return (
    <View style={cardStyle}>
      {(title || right) && (
        <View style={headerStyle}>
          {title ? <AppText variant="ag7" color={(colors as any)?.text}>{title}</AppText> : <View />}
          {right}
        </View>
      )}
      <View style={padded ? styles.body : undefined}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: s(16) },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: s(20),
    paddingVertical: s(20),
    borderBottomWidth: 1,
  },
  headerSimple: { justifyContent: "flex-start" },
  body: { padding: s(20) },
});
