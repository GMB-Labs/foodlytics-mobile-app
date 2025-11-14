import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import ModalHeader from '@/src/shared/ui/components/ModalHeader';
import RunIcon from '@/assets/icons/activity/sports/runIcon.svg';
import BikeIcon from '@/assets/icons/activity/sports/bikeIcon.svg';
import ClimbIcon from '@/assets/icons/activity/sports/climbIcon.svg';
import TenisIcon from '@/assets/icons/activity/sports/tenisIcon.svg';
import WalkIcon from '@/assets/icons/activity/sports/walkIcon.svg';

type ActivityType = 'Correr' | 'Ciclismo' | 'Escalada' | 'Tenis' | 'Caminar' | 'Otro';

const activities: Array<{
  type: Exclude<ActivityType, 'Otro'>;
  calPerMin: number;
  Icon: React.FC<{ width: number; height: number; color?: string }>;
}> = [
  { type: 'Correr', calPerMin: 10, Icon: RunIcon },
  { type: 'Ciclismo', calPerMin: 8, Icon: BikeIcon },
  { type: 'Escalada', calPerMin: 12, Icon: ClimbIcon },
  { type: 'Tenis', calPerMin: 10, Icon: TenisIcon },
  { type: 'Caminar', calPerMin: 4, Icon: WalkIcon },
];

export default function SelectActivity() {
  const router = useRouter();
  const [selected, setSelected] = useState<ActivityType | null>(null);

  const onContinue = () => {
    if (!selected) return;

    if (selected === 'Otro') {
      router.push({
        pathname: '/modals/add-activity/details',
        params: { type: 'Otro', isCustom: 'true' },
      } as any);
      return;
    }

    const activity = activities.find(a => a.type === selected);
    if (!activity) return;

    router.push({
      pathname: '/modals/add-activity/details',
      params: { type: activity.type, calPerMin: activity.calPerMin },
    } as any);
  };

  const isContinueDisabled = !selected;

  return (
    <View style={styles.container}>
      <ModalHeader title="Registrar Actividad" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card contenedora */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tipo de actividad</Text>

          <View style={styles.activitiesList}>
            {activities.map(activity => {
              const isSelected = selected === activity.type;
              const Icon = activity.Icon;
              return (
                <Pressable
                  key={activity.type}
                  style={[styles.activityCard, isSelected && styles.activityCardSelected]}
                  onPress={() => setSelected(activity.type)}
                >
                  <View style={styles.activityLeft}>
                    <Text
                      style={[
                        styles.activityName,
                        isSelected && styles.activityNameSelected,
                      ]}
                    >
                      {activity.type}
                    </Text>
                    <Text
                      style={[
                        styles.activityCal,
                        isSelected && styles.activityCalSelected,
                      ]}
                    >
                      {activity.calPerMin} cal/min
                    </Text>
                  </View>
                  <Icon
                    width={40}
                    height={40}
                    color={isSelected ? '#FFFFFF' : '#2FCCAC'}
                  />
                </Pressable>
              );
            })}

            {/* Opción Otro (llenado manual) */}
            <Pressable
              style={[
                styles.activityCard,
                styles.manualCard,
                selected === 'Otro' && styles.activityCardSelected,
              ]}
              onPress={() => setSelected('Otro')}
            >
              <View style={styles.activityLeft}>
                <Text
                  style={[
                    styles.activityName,
                    selected === 'Otro' && styles.activityNameSelected,
                  ]}
                >
                  Otro
                </Text>
                <Text
                  style={[
                    styles.activityCal,
                    selected === 'Otro' && styles.activityCalSelected,
                  ]}
                >
                  Ingreso manual de datos
                </Text>
              </View>
              <View style={styles.manualBadge}>
                <Text
                  style={[
                    styles.manualBadgeText,
                    selected === 'Otro' && styles.manualBadgeTextSelected,
                  ]}
                >
                  +
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Footer con botón fijo */}
      <View style={styles.footer}>
        <Pressable
          style={[
            styles.continueButton,
            isContinueDisabled && styles.continueButtonDisabled,
          ]}
          onPress={onContinue}
          disabled={isContinueDisabled}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },

  // Card grande tipo Figma
  card: {
    backgroundColor: '#E9FBF6',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },

  sectionTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#1A1A1A',
    marginBottom: 16,
  },

  activitiesList: {
    gap: 12,
  },

  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityCardSelected: {
    backgroundColor: '#2FCCAC',
  },
  activityLeft: {},
  activityName: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  activityNameSelected: {
    color: '#FFFFFF',
  },
  activityCal: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
  activityCalSelected: {
    color: '#FFFFFF',
  },

  // Card "Otro"
  manualCard: {
    borderWidth: 1,
    borderColor: '#2FCCAC33',
  },
  manualBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2FCCAC',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  manualBadgeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    color: '#2FCCAC',
  },
  manualBadgeTextSelected: {
    color: '#FFFFFF',
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 28,
  },
  continueButton: {
    backgroundColor: '#2FCCAC',
    borderRadius: 20,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#7AD3C1',
  },
  continueButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
  },
});
