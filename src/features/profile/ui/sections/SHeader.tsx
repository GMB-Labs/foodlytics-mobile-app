import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackIcon from '@/assets/icons/backIcon.svg';

import { s } from '@/src/features/profile/ui/tokens';
import { useTheme } from '@/src/shared/styles/useTheme';
import AppText from '@/src/shared/ui/components/Typography';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;        
  colors?: string[];                  
  containerStyle?: ViewStyle;        
};

export default function SHeader({
  title,
  subtitle,
  onBack,
  rightSlot,
  colors = undefined,
  containerStyle,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors: themeColors, mode } = useTheme();

  // helper to convert hex to rgba with alpha
  const hexToRgba = (hex: string, alpha = 1) => {
    try {
      const normalized = hex.replace('#', '');
      const full = normalized.length === 3 ? normalized.split('').map(c => c + c).join('') : normalized;
      const bigint = parseInt(full, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch (e) {
      return hex;
    }
  };

  const gradientColors =
    colors ?? [(themeColors as any)?.gradient?.primaryFrom ?? themeColors?.brandA, (themeColors as any)?.gradient?.primaryTo ?? themeColors?.brandB];

  const styles = React.useMemo(() => createStyles(themeColors as any), [themeColors]);

  return (
    <LinearGradient
      colors={gradientColors as any}
      style={[styles.gradient, { paddingTop: Math.max(insets.top, s(20)) + s(36) }, containerStyle]}
    >
      <View style={styles.topRow}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={[styles.backCircle, { backgroundColor: hexToRgba(themeColors?.white ?? '#FFFFFF', mode === 'dark' ? 0.12 : 0.16) }]}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <BackIcon width={20} height={20} />
          </Pressable>
        ) : <View style={{ width: s(40) }} />}

        {/* allow title to wrap to two lines on smaller devices */}
        <AppText variant="ag2" color={themeColors?.white} style={styles.title} numberOfLines={2}>{title}</AppText>

        {/* espacio para botón derecho opcional */}
        <View style={{ width: s(40), alignItems: 'flex-end' }}>
          {rightSlot ?? null}
        </View>
      </View>

      {!!subtitle && (
        <AppText variant="ag10" color={themeColors?.white} style={styles.subtitle}>{subtitle}</AppText>
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

function createStyles(colors: any) {
  return StyleSheet.create({
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
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      flex: 1,
      marginLeft: s(12),
      color:  '#FFFFFF',
      fontFamily: 'Poppins',
      fontSize: 24,
      lineHeight: 32,
      flexWrap: 'wrap',
    },
    subtitle: {
      marginTop: s(8),
      paddingHorizontal: s(2),
      color: colors?.white ? 'rgba(255,255,255,0.95)' : '#FFFFFF',
      fontFamily: 'Poppins',
      fontSize: 14,
      lineHeight: 20,
    },
  });
}
