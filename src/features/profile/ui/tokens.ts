import { Dimensions, Platform } from "react-native";

export const COLORS = {
  bg: "#F8FAFC",
  card: "#FFFFFF",
  text: "#1A1A1A",
  subtext: "#4A5565",
  mutetext: "#6A7282",
  border: "#F3F4F6",
  brandA: "#2FCCAC",
  brandB: "#24A88C",
  successBg: "#D1FAE5",
  success: "#00C950",
  chipBg: "#F8FAFC",
  danger: "#EF4444",
};

const { width } = Dimensions.get("window");
const DESIGN_W = 430;
const SCALE = Math.min(1, width / DESIGN_W);

export const s = (n: number) => Math.round(n * SCALE);

export function cardShadow(md = false) {
  if (Platform.OS === "android") return { elevation: md ? 2 : 1 };
  return {
    borderRadius: s(13),
    backgroundColor: COLORS.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: md ? 2 : 0.5 }, // más cercano al componente
    shadowOpacity: 0.06, // más transparente
    shadowRadius: md ?  3 : 1.5, // difuminado más pequeño
  };
}
