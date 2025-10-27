
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ReactNode } from "react";

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1">{children}</View>
    </SafeAreaView>
  );
}
