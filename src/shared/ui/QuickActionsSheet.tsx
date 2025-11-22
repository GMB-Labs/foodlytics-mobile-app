import React from 'react';
import { Animated, View, Pressable, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import AppText from '@/src/shared/ui/components/Typography';
import { useTheme } from '@/src/shared/styles/useTheme';

import CameraIcon from '@/assets/icons/cameraIcon.svg';
import WeightIcon from '@/assets/icons/activity/weightIcon.svg';
import ActivityIcon from '@/assets/icons/activity/progressIcon.svg';
import GoalIcon from '@/assets/icons/activity/goalIcon.svg';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function QuickActionsSheet({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(24)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: visible ? 0 : 24,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, opacity, translateY]);

  if (!visible) return null;

  const goCamera = () => {
    onClose();
    router.push('/camera');
  };
  const goAddWeight = () => {
    onClose();
    // Normalize 'from' so we don't pass the root path ('/') which in this
    // project redirects to /login. If the current pathname is root or an
    // auth route, fall back to the tabs index so the modal can safely
    // return the user there.
    const safeFrom = (() => {
      if (!pathname || pathname === '/') return '/(tabs)';
      // avoid sending user back to auth routes
      if (pathname.startsWith('/(auth)') || pathname.startsWith('/login')) return '/(tabs)';
      return pathname;
    })();

    router.push({ pathname: '/modals/add-weight', params: { from: safeFrom } });
  };
  const goActivity = () => {
    onClose();
    router.push('/modals/add-activity');
  };
  const goNewGoal = () => {
    onClose();
    router.push('/modals/edit-goals');
  };

  // Grid item component lives here so it can access `colors` from the theme
  function GridItem({ onPress, icon, label, bg }: any) {
    return (
      <Pressable onPress={onPress} style={[styles.gridItem, { backgroundColor: (colors as any)?.border3 }]} hitSlop={8}>
        <View style={[styles.iconBox, { backgroundColor: bg }]}>
          {icon}
        </View>
        <AppText variant="ag9" style={[styles.itemLabel, { color: (colors as any)?.text }]}>
          {label}
        </AppText>
      </Pressable>
    );
  }

  return (
    <Animated.View
      style={[styles.overlay, { opacity }]}
      pointerEvents="box-none"
    >
      {/* Fondo semitransparente igual al frame */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Sheet blanco*/}
      <Animated.View style={[styles.sheet, { transform: [{ translateY }], backgroundColor: (colors as any)?.bg }]}>
        <View style={styles.headerRow}>
          <AppText variant="ag5" style={[styles.title, { color: (colors as any)?.text }]}>Acciones Rápidas</AppText>

          <Pressable
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={10}
            accessibilityLabel="Cerrar"
          >
            <View style={[styles.closeCircle, { backgroundColor: (colors as any)?.icons?.idleBg ?? (colors as any)?.border }]}>
              <AppText variant="ag7" style={[styles.closeX, { color: (colors as any)?.text } ]}>✕</AppText>
            </View>
          </Pressable>
        </View>

        <View style={styles.grid}>
          <GridItem
            onPress={goCamera}
            icon={<CameraIcon width={28} height={28} color="#FFFFFF" strokeWidth={2} />}
            label="Registrar Comida"
            bg={(colors as any)?.quickActions?.food ?? '#2FCCAC'}
          />
          <GridItem
            onPress={goAddWeight}
            icon={<WeightIcon width={28} height={28} color="#FFFFFF" strokeWidth={2} />}
            label="Registrar Peso"
            bg={(colors as any)?.quickActions?.weight ?? '#2B7FFF'}
          />
          <GridItem
            onPress={goActivity}
            icon={<ActivityIcon width={28} height={28} color="#FFFFFF" strokeWidth={2} />}
            label="Registrar Actividad"
            bg={(colors as any)?.quickActions?.activity ?? '#FF6900'}
          />
          <GridItem
            onPress={goNewGoal}
            icon={<GoalIcon width={28} height={28} color="#FFFFFF" strokeWidth={2} />}
            label="Nueva Meta"
            bg={(colors as any)?.quickActions?.goal ?? '#AD46FF'}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
}


const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    // bg-[rgba(0,0,0,0.5)]
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    // h-[479px] en el frame, aquí lo dejamos auto pero con padding similar
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 36, // top 18 + header 18 aprox
    paddingHorizontal: 24, // left 24 en el frame
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  headerRow: {
    height: 40, // h-[40px]
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    // Poppins 20, #1A1A1A
    color: '#1A1A1A',
    fontSize: 20,
    lineHeight: 28,
    textAlign: 'left',
  },
  closeBtn: {
    marginLeft: 'auto',
  },
  closeCircle: {
    // size-[40px] bg-gray-100 rounded-full
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeX: {
    color: '#111827',
    fontSize: 18,
  },
  grid: {
    // grid-cols-2 gap-[16px] w-[382px]
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    columnGap: 16,
    rowGap: 16,
  },
  gridItem: {
    // dos columnas dentro de 382 px -> aprox 48 %
    width: '47%',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  itemLabel: {
    color: '#1A1A1A',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
