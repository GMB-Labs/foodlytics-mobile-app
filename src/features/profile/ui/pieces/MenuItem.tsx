import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import AppText from "@/src/shared/ui/components/Typography";
import { COLORS, s } from "../tokens";
import Flecha from "@/assets/icons/flehaIcon.svg";

export default function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.item} android_ripple={{ color: "#00000010" }}>
      <View style={styles.left}>
        <View style={styles.icon}>{icon}</View>
        <View>
          <AppText variant="ag9" color={COLORS.text}>{title}</AppText>
          {subtitle ? <AppText variant="ag10" color={COLORS.mutetext}>{subtitle}</AppText> : null}
        </View>
      </View>
      {showChevron ? <Flecha width={16} height={16} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: s(20),
    paddingVertical: s(16),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  left: { flexDirection: "row", alignItems: "center", gap: s(12) },
  icon: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
});
