import React from 'react';
import { View, Pressable, StyleSheet, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from '@/src/shared/ui/components/Typography';
import { useRouter, useSegments } from 'expo-router';

import Home from '@/assets/icons/home-icon.svg';
import Activity from '@/assets/icons/activity-icon.svg';
import Meals from '@/assets/icons/meals-icon.svg';
import Profile from '@/assets/icons/profile-icon.svg';
import Add from '@/assets/icons/add-icon.svg';

export default function BottomNav() {
  const router = useRouter();
  const segments = useSegments();
  // All hooks must run unconditionally. Call hooks first to satisfy Rules of Hooks.
  const insets = useSafeAreaInsets();
  // Hide bottom nav on routes where we want a full-screen UI (Notifications, etc.).
  const hiddenRoutes = ['notifications', 'language', 'privacy', 'terms', 'privacy-policy', ''];
  const shouldHideBottomNav = segments.some((seg) => hiddenRoutes.includes(String(seg)));
  if (shouldHideBottomNav) return null;
  const active = segments[segments.length - 1] || 'index';

  // --- Escala responsiva base 430 (Figma)
  const { width } = Dimensions.get('window');
  const designW = 430;
  const scale = Math.min(1, width / designW);
  const s = (n: number) => Math.round(n * scale);

  // --- Tokens responsivos
  const BAR_H = s(56);
  const INNER_H = s(48);
  const ICON_BOX = s(36);
  const ICON_SIZE = s(22);
  const CENTER_OUTER = s(56);
  const CENTER_DOT = s(48);
  const GAP_X = s(16);
  const SHOW_LABELS = width >= 360;

  const isActive = (tab: string) => {
    if (tab === 'home') return active === 'index' || active === '(tabs)';
    return String(active).includes(tab);
  };
  const go = (route: string) => router.push(route as any);

  return (
    <View
      style={[
        styles.container,
        {
          height: BAR_H + insets.bottom,
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 10),
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.inner,
          {
            height: INNER_H,
            paddingHorizontal: GAP_X,
            maxWidth: 500,
          },
        ]}
      >
        {/* Inicio */}
        <Tab
          label="Inicio"
          active={isActive('home')}
          iconBox={ICON_BOX}
          icon={
            <Home
              width={ICON_SIZE}
              height={ICON_SIZE}
              color={isActive('home') ? '#2FCCAC' : '#99A1AF'}
              strokeWidth={isActive('home') ? 2.5 : 2}
            />
          }
          onPress={() => go('/(tabs)')}
          showLabel={SHOW_LABELS}
        />

        {/* Comidas */}
        <Tab
          label="Comidas"
          active={isActive('meals')}
          iconBox={ICON_BOX}
          icon={
            <Meals
              width={ICON_SIZE}
              height={ICON_SIZE}
              color={isActive('meals') ? '#2FCCAC' : '#99A1AF'}
              strokeWidth={isActive('meals') ? 2.5 : 2}
            />
          }
          onPress={() => go('/(tabs)/meals')}
          showLabel={SHOW_LABELS}
        />

        {/* Botón central (no tocar) */}
        <Pressable
          style={[
            styles.centerButton,
            {
              width: CENTER_OUTER,
              height: CENTER_OUTER,
            },
          ]}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          onPress={() => go('/modals/add-activity')}
        >
          <LinearGradient
            colors={['#2FCCAC', '#24A88C']}
            style={[
              styles.centerGradient,
              { width: CENTER_DOT, height: CENTER_DOT, borderRadius: CENTER_DOT / 2 },
            ]}
          >
            <Add width={s(24)} height={s(24)} strokeWidth={2.5} />
          </LinearGradient>
        </Pressable>

        {/* Actividad */}
        <Tab
          label="Actividad"
          active={isActive('activity')}
          iconBox={ICON_BOX}
          icon={
            <Activity
              width={ICON_SIZE}
              height={ICON_SIZE}
              color={isActive('activity') ? '#2FCCAC' : '#99A1AF'}
              strokeWidth={isActive('activity') ? 2.5 : 2}
            />
          }
          onPress={() => go('/(tabs)/activity')}
          showLabel={SHOW_LABELS}
        />

        {/* Perfil */}
        <Tab
          label="Perfil"
          active={isActive('profile')}
          iconBox={ICON_BOX}
          icon={
            <Profile
              width={ICON_SIZE}
              height={ICON_SIZE}
              color={isActive('profile') ? '#2FCCAC' : '#99A1AF'}
              strokeWidth={isActive('profile') ? 2.5 : 2}
            />
          }
          onPress={() => go('/(tabs)/profile')}
          showLabel={SHOW_LABELS}
        />
      </View>
    </View>
  );
}

/* ----------------------------
 * Subcomponente Tab
 * ---------------------------- */
function Tab({
  label,
  icon,
  active,
  onPress,
  showLabel,
  iconBox,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onPress: () => void;
  showLabel: boolean;
  iconBox: number;
}) {
  return (
    <Pressable
      style={styles.tab}
      onPress={onPress}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      {/* Wrapper CIRCULAR que clippea el fondo (fix Android) */}
      <View
        style={[
          {
            width: iconBox,
            height: iconBox,
            borderRadius: iconBox / 2,        
            overflow: 'hidden',               
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: active ? 'rgba(47, 204, 172, 0.12)' : 'transparent',
          },
          styles.iconContainer, // mantiene marginBottom
        ]}
      >
        {icon}
      </View>

      {showLabel && (
        <AppText variant="ag10" color={active ? '#2FCCAC' : '#99A1AF'}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

/* ----------------------------
 * Styles
 * ---------------------------- */
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tab: {
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  centerButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerGradient: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderRadius: 999,
  },
});
