import React from 'react';
import { Animated, View, Pressable, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AppText from '@/src/shared/ui/components/Typography';

import CameraIcon from '@/assets/icons/cameraIcon.svg';
import WeightIcon from '@/assets/icons/activity/weightIcon.svg';
import ActivityIcon from '@/assets/icons/activity/strikeIcon.svg';
import GoalIcon from '@/assets/icons/activity/goalIcon.svg';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function QuickActionsSheet({ visible, onClose }: Props) {
  const router = useRouter();
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
    router.push('/modals/add-weight');
  };
  const goActivity = () => {
    onClose();
    router.push('/(tabs)/activity');
  };
  const goNewGoal = () => {
    onClose();
    router.push('/modals/edit-goals');
  };

  return (
    <Animated.View
      style={[styles.overlay, { opacity }]}
      pointerEvents="box-none"
    >
      {/* Fondo semitransparente que oscurece toda la app */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Sheet con acciones, animado desde abajo */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View style={styles.headerRow}>
          <AppText variant="ag3" style={styles.title}>
            Acciones Rapidas
          </AppText>
          <Pressable
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={10}
            accessibilityLabel="Cerrar"
          >
            <AppText variant="ag7" style={styles.closeX}>
              ✕
            </AppText>
          </Pressable>
        </View>

        <View style={styles.grid}>
          <GridItem
            onPress={goCamera}
            icon={
              <CameraIcon
                width={28}
                height={28}
                color="#FFFFFF"
                strokeWidth={2}
              />
            }
            label="Registrar Comida"
            bgColor="#2FCCAC"
          />
          <GridItem
            onPress={goAddWeight}
            icon={
              <WeightIcon
                width={28}
                height={28}
                color="#FFFFFF"
                strokeWidth={2}
              />
            }
            label="Registrar Peso"
            bgColor="#2D9CFF"
          />
          <GridItem
            onPress={goActivity}
            icon={
              <ActivityIcon
                width={28}
                height={28}
                color="#FFFFFF"
                strokeWidth={2}
              />
            }
            label="Registrar Actividad"
            bgColor="#FF8A00"
          />
          <GridItem
            onPress={goNewGoal}
            icon={
              <GoalIcon
                width={28}
                height={28}
                color="#FFFFFF"
                strokeWidth={2}
              />
            }
            label="Nueva Meta"
            bgColor="#8A4DFF"
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function GridItem({ onPress, icon, label, bgColor }: any) {
  return (
    <Pressable onPress={onPress} style={styles.gridItem} hitSlop={8}>
      <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
        {icon}
      </View>
      <AppText variant="ag9" style={styles.itemLabel}>
        {label}
      </AppText>
    </Pressable>
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
    backgroundColor: 'rgba(15, 23, 42, 0.6)', // sombra sobre toda la pantalla
  },
  sheet: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 10,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: { color: '#111827', fontSize: 20 },
  closeBtn: { position: 'absolute', right: 0, top: 0 },
  closeX: { color: '#374151', fontSize: 20 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#F8FAFB',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  itemLabel: { color: '#111827', textAlign: 'center' },
});
