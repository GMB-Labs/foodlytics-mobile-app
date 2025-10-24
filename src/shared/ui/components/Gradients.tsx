
import { LinearGradient } from "expo-linear-gradient";
import { ViewProps } from "react-native";

export function PrimaryGradient(props: ViewProps & { height?: number }) {
  const { style, height = 220, children, ...rest } = props;
  return (
    <LinearGradient
      colors={["#2FCCAC", "#24A88C"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ height }, style]}
      {...rest}
    >
      {children}
    </LinearGradient>
  );
}
