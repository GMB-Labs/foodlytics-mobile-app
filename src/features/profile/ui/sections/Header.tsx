import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import AppText from "@/src/shared/ui/components/Typography";
import ProfileIcon from "@/assets/icons/profile-icon.svg";
import { COLORS, s, cardShadow } from "../tokens";

export default function Header({
  name, email, imageUri, onPick,
}: {
  name: string;
  email: string;
  imageUri: string | null;
  onPick: () => void;
}) {
  return (
    <LinearGradient colors={[COLORS.brandA, COLORS.brandB]} style={styles.header}>
      <View style={styles.row}>
        <Pressable
          onPress={onPick}
          accessibilityLabel="Cambiar foto"
          accessibilityRole="imagebutton"
          style={[styles.avatar, imageUri && styles.clip, cardShadow(true)]}
          hitSlop={10}
        >
          {imageUri
            ? <Image source={{ uri: imageUri }} style={styles.img} contentFit="cover" />
            : <ProfileIcon width={40} height={40} color={COLORS.brandA} strokeWidth={2.5} />
          }
        </Pressable>
        <View style={{ flex: 1 }}>
          <AppText variant="ag3" color="white">{name}</AppText>
          <AppText variant="ag9" color="rgba(255,255,255,0.9)">{email}</AppText>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { height: s(168), paddingTop: s(56), paddingHorizontal: s(24), borderBottomLeftRadius: s(32), borderBottomRightRadius: s(32) },
  row: { flexDirection: "row", alignItems: "center", height: s(80), gap: s(16) },
  avatar: { width: s(80), height: s(80), borderRadius: s(40), backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  clip: { overflow: "hidden" },
  img: { width: "100%", height: "100%" },
});
