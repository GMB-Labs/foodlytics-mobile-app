import React, { useRef } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import AppText from '@/src/shared/ui/components/Typography';
import LottieView from 'lottie-react-native';
import DeleteIcon from '@/assets/icons/profile/deleteIcon.svg';

type Activity = {
  id: string;
  name: string;
  minutes: number;
  intensity: 'Baja' | 'Moderada' | 'Alta';
  calories: number;
};

function intensityColor(intensity: Activity['intensity']) {
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

function intensityTextColor(intensity: Activity['intensity']) {
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
  onDelete: (id: string) => void;
}) {
  const animationRef = useRef<any>(null);

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
    <View style={cardStyles.card}>
      <View style={cardStyles.left}>
        <View style={cardStyles.iconCircle}>
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

      <View style={cardStyles.center}>
        <AppText variant="ag7" color="#0F172A">{`${activity.name}`}</AppText>
        <View style={{ height: 6 }} />
        <View style={cardStyles.rowDetails}>
          <AppText variant="ag9" color="#6B7280">{`${activity.minutes} min`}</AppText>
          <View style={cardStyles.dot} />
          <View style={[cardStyles.badge, { backgroundColor: intensityColor(activity.intensity) }]}> 
            <AppText variant="ag9" color={intensityTextColor(activity.intensity)}>{`${activity.intensity}`}</AppText>
          </View>
          <View style={cardStyles.dot} />
          <AppText variant="ag9" color="#2FCCAC">{`${activity.calories} cal`}</AppText>
        </View>
      </View>

      <TouchableOpacity style={cardStyles.deleteBtn} onPress={() => onDelete(activity.id)}>
        <DeleteIcon width={18} height={18} color="#FF495C" />
      </TouchableOpacity>
    </View>
  );
}

const cardStyles = {
  card: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
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
  } as any,
  left: { marginRight: 12 } as any,
  iconCircle: { width: 48, height: 48, borderRadius: 20, backgroundColor: '#EBFAF7', alignItems: 'center', justifyContent: 'center' } as any,
  center: { flex: 1 } as any,
  rowDetails: { flexDirection: 'row', alignItems: 'center' } as any,
  dot: { width: 6, height: 6, borderRadius: 6, backgroundColor: '#D1D5DB', marginHorizontal: 10 } as any,
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 } as any,
  deleteBtn: { marginLeft: 12, marginBottom: 40 } as any,
};
