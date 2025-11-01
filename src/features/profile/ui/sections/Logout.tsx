import React from "react";
import { Pressable, StyleSheet } from "react-native";
import AppText from "@/src/shared/ui/components/Typography";
import { COLORS, s, cardShadow } from "../tokens";
import LogoutIcon from "@/assets/icons/profile/logoutIcon.svg";

export default function Logout({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={[cardShadow(), styles.btn]} onPress={onPress} accessibilityRole="button">
      <LogoutIcon width={16} height={16} style={{ marginRight: 8 }} />
      <AppText variant="ag9" color="white">Cerrar Sesión</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: COLORS.danger,
    paddingVertical: s(18),
    borderRadius: s(20),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: s(8),
    marginHorizontal: s(21),
    marginTop: s(2),
  },
});
