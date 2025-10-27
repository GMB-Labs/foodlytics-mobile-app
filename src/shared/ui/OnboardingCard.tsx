import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';

type OnboardingCardProps = ViewProps & {
  children: React.ReactNode;
  paddingHorizontal?: number;
  paddingTop?: number;
};

export default function OnboardingCard({ children, paddingHorizontal = 32, paddingTop = 32, style, ...rest }: OnboardingCardProps) {
  return (
    <View style={[styles.container, { paddingHorizontal, paddingTop }, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    flex: 1,
  },
});
