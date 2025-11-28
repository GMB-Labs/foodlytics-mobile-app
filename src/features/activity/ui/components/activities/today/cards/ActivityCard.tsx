import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import AppText from '@/src/shared/ui/components/Typography';
import LottieView from 'lottie-react-native';
import DeleteIcon from '@/assets/icons/profile/deleteIcon.svg';
import { useTheme } from '@/src/shared/styles/useTheme';

type Activity = {
  id: string;
  name: string;
  minutes: number;
  intensity: string;
  calories: number;
};

function intensityColor(intensity: Activity['intensity'], theme: any) {
  if (theme?.activity?.intensity) {
    switch (intensity) {
      case 'Alta':
        return theme.activity.intensity.highBg ?? '#FFD6D6';
      case 'Moderada':
        return theme.activity.intensity.mediumBg ?? '#FFEBD1';
      case 'Baja':
      default:
        return theme.activity.intensity.lowBg ?? '#DFF7EC';
    }
  }
  switch (intensity) {
    case 'Alta':
      return '#FFD6D6';
    case 'Moderada':
      return '#FFEBD1';
    case 'Baja':
    default:
      return '#DFF7EC';
  }
}

function intensityTextColor(intensity: Activity['intensity'], theme: any) {
  if (theme?.activity?.intensity) {
    switch (intensity) {
      case 'Alta':
        return theme.activity.intensity.highText ?? '#FF6B6B';
      case 'Moderada':
        return theme.activity.intensity.mediumText ?? '#FF9F1C';
      case 'Baja':
      default:
        return theme.activity.intensity.lowText ?? '#2FCCAC';
    }
  }
  switch (intensity) {
    case 'Alta':
      return '#FF6B6B';
    case 'Moderada':
      return '#FF9F1C';
    case 'Baja':
    default:
      return '#2FCCAC';
  }
}

export default function ActivityCard({
  activity,
  onDelete,
}: {
  activity: Activity;
  onDelete?: (id: string) => void;
}) {
  const animationRef = useRef<any>(null);
  const { colors } = useTheme();
  const theme = colors as any;
  const styles = createStyles(theme);

  useFocusEffect(
    React.useCallback(() => {
      try {
        if (animationRef.current) {
          if (typeof animationRef.current.reset === 'function') {
            animationRef.current.reset();
          }
          if (typeof animationRef.current.play === 'function') {
            animationRef.current.play();
          }
        }
      } catch (e) {
        // best-effort
      }
    }, []),
  );

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.iconCircle}>
          <LottieView
            ref={animationRef}
            source={require('@/assets/lottie/trending-up.json')}
            loop={false}
            autoPlay={false}
            resizeMode="contain"
            style={{ width: 28, height: 28 }}
          />
        </View>
      </View>

      <View style={styles.center}>
        <AppText variant="ag7" color={theme.text ?? '#0F172A'}>{`${activity.name}`}</AppText>
        <View style={{ height: 6 }} />
        <View style={styles.rowDetails}>
          <AppText variant="ag9" color={theme.subtext ?? '#6B7280'}>{`${activity.minutes} min`}</AppText>
          <View style={styles.dot} />
          <View style={[styles.badge, { backgroundColor: intensityColor(activity.intensity, theme) }]}> 
            <AppText variant="ag9" color={intensityTextColor(activity.intensity, theme)}>{`${activity.intensity}`}</AppText>
          </View>
          <View style={styles.dot} />
          <AppText variant="ag9" color={theme.brandA ?? '#2FCCAC'}>{`${activity.calories} cal`}</AppText>
        </View>
      </View>

      {onDelete ? (
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(activity.id)}>
          <DeleteIcon width={18} height={18} color={theme.danger ?? '#FF495C'} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
const createStyles = (theme: any) => StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: theme.mealsCard ?? '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  left: { marginRight: 12 },
  iconCircle: { width: 48, height: 48, borderRadius: 20, backgroundColor: theme.iconbase3 ?? '#EBFAF7', alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1 },
  rowDetails: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 6, backgroundColor: theme.dot2 ?? '#D1D5DB', marginHorizontal: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  deleteBtn: { marginLeft: 12, marginBottom: 40 },
});
