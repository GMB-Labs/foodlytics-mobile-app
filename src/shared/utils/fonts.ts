import { Text, TextInput } from "react-native";

/**
 * Sets a global default font family for all Text and TextInput components.
 * Call this AFTER fonts are loaded with expo-font.
 */
export function setDefaultFontFamily(family: string = "Poppins-Regular") {
  const T: any = Text as any;
  const TI: any = TextInput as any;

  if (T.defaultProps == null) T.defaultProps = {};
  if (TI.defaultProps == null) TI.defaultProps = {};

  // Preserve any existing default style and append our font family
  T.defaultProps.style = [T.defaultProps.style, { fontFamily: family }];
  TI.defaultProps.style = [TI.defaultProps.style, { fontFamily: family }];
}
