import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import AppText from "@/src/shared/ui/components/Typography";
import { s } from "../tokens";
import { useTheme } from '@/src/shared/styles/useTheme';
import Flecha from "@/assets/icons/flehaIcon.svg";

type IconRenderer = (color: string) => React.ReactNode;

// Small helper: convert hex color to rgba string with given alpha
function hexToRgba(hex: string, alpha = 1) {
  try {
    const normalized = hex.replace('#', '');
    const bigint = parseInt(normalized.length === 3 ? normalized.split('').map(c => c + c).join('') : normalized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch (e) {
    return hex; // fallback to original if parsing fails
  }
}

export default function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  active = false, // ← controla el highlight desde fuera si quieres
  iconActiveColor,
  iconIdleColor,
  iconActiveBg,
  iconIdleBg,
}: {
  icon: IconRenderer | React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  active?: boolean;
  iconActiveColor?: string | undefined;
  iconIdleColor?: string | undefined;
  iconActiveBg?: string | undefined;
  iconIdleBg?: string | undefined;
}) {
  const { colors, mode } = useTheme();
  const styles = React.useMemo(() => createStyles(colors as any), [colors]);

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: mode === 'dark' ? '#FFFFFF10' : '#00000010' }}
      style={styles.item}
    >
      {({ pressed }) => {
        const isActive = active || pressed; // mantiene look al presionar y permite forzar activo
        const rawIconBg = isActive
          ? (iconActiveBg ?? colors?.icons?.activeBg ?? colors?.brandA ?? '#2FCCAC')
          : (iconIdleBg ?? colors?.icons?.idleBg ?? colors?.chipBg ?? '#F3F4F6');
        const rawIconColor = isActive
          ? (iconActiveColor ?? colors?.icons?.active ?? colors?.white ?? '#FFFFFF')
          : (iconIdleColor ?? colors?.icons?.idle ?? colors?.subtext ?? '#4A5565');

        // apply subtle transparency to icon background so it's less strong
        const bgAlpha = mode === 'dark' ? 1 : 0.95;
        const iconBg = typeof rawIconBg === 'string' && rawIconBg.startsWith('#')
          ? hexToRgba(rawIconBg, bgAlpha)
          : rawIconBg;
        const iconColor = rawIconColor;

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
                <AppText variant="ag9" color={colors?.text}>{title}</AppText>
                {subtitle ? (
                  <AppText variant="ag10" color={colors?.muted}>{subtitle}</AppText>
                ) : null}
              </View>
            </View>
            {showChevron ? <Flecha width={16} height={16} color={(colors as any)?.muted} /> : null}
          </>
        );
      }}
    </Pressable>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    item: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: s(20),
      paddingVertical: s(16),
      borderBottomWidth: 1,
      borderBottomColor: colors?.border,
    },
    left: { flexDirection: "row", alignItems: "center", gap: s(12) },
    icon: {
      width: s(40),
      height: s(40),
      borderRadius: s(20),
      alignItems: "center",
      justifyContent: "center",
    },
  });
}




