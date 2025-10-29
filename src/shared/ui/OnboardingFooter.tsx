import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '@/src/shared/ui/components/Typography';

type Props = {
  onBack?: () => void;
  onContinue: () => void;
  disabledContinue?: boolean;
  /** 'inline' = fijo ocupando espacio; 'absolute' = flotante (como antes) */
  variant?: 'inline' | 'absolute';
  bottomOffset?: number;        // solo para 'absolute' (default 40)
  horizontalPadding?: number;   // padding lateral (default 32)
  containerStyle?: ViewStyle;
};

export default function OnboardingFooter({
  onBack,
  onContinue,
  disabledContinue,
  variant = 'inline',
  bottomOffset = 40,
  horizontalPadding = 32,
  containerStyle,
}: Props) {
  if (variant === 'absolute') {
    return (
      <View
        pointerEvents="box-none"
        style={[
          styles.absoluteWrap,
          { bottom: bottomOffset, paddingHorizontal: horizontalPadding },
          containerStyle,
        ]}
      >
        <View style={styles.row}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onContinue}
            disabled={disabledContinue}
            activeOpacity={disabledContinue ? 1 : 0.5}
            style={[styles.continueBtn, disabledContinue && styles.continueDisabled]}
          >
            <AppText variant="ag9" align="center" color="#FFFFFF" style={{ fontFamily: 'Poppins-Medium' }}>
              Continuar
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // variante "inline" (fijo ocupando espacio + respeta safe area)
  return (
    <SafeAreaView edges={['bottom']} style={[{ paddingHorizontal: horizontalPadding }, containerStyle]}>
      <View style={[styles.row, { paddingTop: 8, paddingBottom: 8 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onContinue}
          disabled={disabledContinue}
          activeOpacity={disabledContinue ? 1 : 0.5}
          style={[styles.continueBtn, disabledContinue && styles.continueDisabled]}
        >
          <AppText variant="ag9" align="center" color="#FFFFFF" style={{ fontFamily: 'Poppins-Medium' }}>
            Continuar
          </AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  absoluteWrap: { position: 'absolute', left: 0, right: 0, zIndex: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  backBtn: {
    width: 56, height: 56, borderRadius: 12,
    backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  backIcon: { color: '#374151', fontSize: 20 },
  continueBtn: {
    flex: 1, height: 56, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#2FCCAC',
  },
  continueDisabled: { backgroundColor: '#D1D5DB', opacity: 0.6 },
});
