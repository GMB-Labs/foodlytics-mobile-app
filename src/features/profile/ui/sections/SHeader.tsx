import React from 'react';
import { View, Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackIcon from '@/assets/icons/backIcon.svg';

// Si usas tokens propios, impórtalos
import { COLORS, s } from '@/src/features/profile/ui/tokens';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;        // ej. botón info
  colors?: string[];                  // gradiente superior
  containerStyle?: ViewStyle;         // estilos extra si necesitas
};

export default function SHeader({
  title,
  subtitle,
  onBack,
  rightSlot,
  colors = [COLORS.brandA, COLORS.brandB],
  containerStyle,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={colors as any}
      style={[styles.gradient, { paddingTop: Math.max(insets.top, s(20)) + s(36) }, containerStyle]}
    >
      <View style={styles.topRow}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={styles.backCircle}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <BackIcon width={20} height={20} />
          </Pressable>
        ) : <View style={{ width: s(40) }} />}

        {/* allow title to wrap to two lines on smaller devices */}
        <Text style={styles.title} numberOfLines={2}>{title}</Text>

        {/* espacio para botón derecho opcional */}
        <View style={{ width: s(40), alignItems: 'flex-end' }}>
          {rightSlot ?? null}
        </View>
      </View>

      {!!subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingHorizontal: s(24),
    paddingBottom: s(16),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // allow the row to grow vertically if title wraps
    minHeight: s(40),
    paddingVertical: s(2),
  },
  backCircle: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    marginLeft: s(12),
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    fontSize: 24,
    lineHeight: 32,
    flexWrap: 'wrap',
  },
  subtitle: {
    marginTop: s(8),
    paddingHorizontal: s(2),
    color: 'rgba(255,255,255,0.95)',
    fontFamily: 'Poppins',
    fontSize: 14,
    lineHeight: 20,
  },
});
