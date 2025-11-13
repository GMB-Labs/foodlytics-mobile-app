import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import AppText from "@/src/shared/ui/components/Typography";
import { COLORS, s } from "../tokens";
import Flecha from "@/assets/icons/flehaIcon.svg";

type IconRenderer = (color: string) => React.ReactNode;

export default function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  active = false, // ← controla el highlight desde fuera si quieres
  iconActiveColor = "#2FCCAC",
  iconIdleColor = "#4A5565",
  iconActiveBg = "#EBFAF7",
  iconIdleBg = "#F3F4F6",
}: {
  icon: IconRenderer | React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  active?: boolean;
  iconActiveColor?: string;
  iconIdleColor?: string;
  iconActiveBg?: string;
  iconIdleBg?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "#00000010" }}
      style={styles.item}
    >
      {({ pressed }) => {
        const isActive = active || pressed; // mantiene look al presionar y permite forzar activo
        const iconBg = isActive ? iconActiveBg : iconIdleBg;
        const iconColor = isActive ? iconActiveColor : iconIdleColor;

        const renderedIcon =
          typeof icon === "function"
            ? (icon as IconRenderer)(iconColor)
            : React.isValidElement(icon)
            ? React.cloneElement(icon as any, { color: iconColor })
            : icon;

        return (
          <>
            <View style={styles.left}>
              <View style={[styles.icon, { backgroundColor: iconBg }]}>
                {renderedIcon}
              </View>
              <View>
                <AppText variant="ag9" color={COLORS.text}>{title}</AppText>
                {subtitle ? (
                  <AppText variant="ag10" color={COLORS.mutetext}>{subtitle}</AppText>
                ) : null}
              </View>
            </View>
            {showChevron ? <Flecha width={16} height={16} /> : null}
          </>
        );
      }}
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
