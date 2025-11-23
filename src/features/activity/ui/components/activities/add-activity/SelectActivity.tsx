import React, { useState } from 'react';
import { View, Pressable, StyleSheet, ScrollView,Dimensions } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import { useTheme } from '@/src/shared/styles/useTheme';
import { useRouter } from 'expo-router';
import ModalHeader from '@/src/shared/ui/components/ModalHeader';
import RunIcon from '@/assets/icons/activity/sports/runIcon.svg';
import BikeIcon from '@/assets/icons/activity/sports/bikeIcon.svg';
import ClimbIcon from '@/assets/icons/activity/sports/climbIcon.svg';
import TenisIcon from '@/assets/icons/activity/sports/tenisIcon.svg';


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
];

export default function SelectActivity() {
  const { width } = Dimensions.get('window');
  const designW = 430;
  const scale = Math.min(1, width / designW);
  const s = (n: number) => Math.round(n * scale);
  const { colors } = useTheme();
  const theme = colors as any;
  const styles = createStyles(s, theme);
  
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
    <View style={[styles.container, { backgroundColor: theme.bg ?? '#FFFFFF' }]}>
      <ModalHeader title="Registrar Actividad" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card contenedora */}
        <View style={[styles.card, { backgroundColor: theme.mealsCard ?? '#E9FBF6' }]}>

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
                    <AppText
                      style={[
                        styles.activityName,
                        isSelected && styles.activityNameSelected,
                        { color: isSelected ? (theme.cardTextOnAccent ?? '#FFFFFF') : (theme.text ?? '#1A1A1A') },
                      ]}
                    >
                      {activity.type}
                    </AppText>
                    <AppText
                      style={[
                        styles.activityCal,
                        isSelected && styles.activityCalSelected,
                        { color: isSelected ? (theme.cardTextOnAccent ?? '#FFFFFF') : (theme.subtext ?? '#6B7280') },
                      ]}
                    >
                      {activity.calPerMin} cal/min
                    </AppText>
                  </View>
                  <Icon
                    width={40}
                    height={40}
                    color={isSelected ? ('#FFFFFF') : (theme.icons.activity ?? '#2FCCAC')}
                  />
                </Pressable>
              );
            })}

            {/* Opción Otro (llenado manual) */}
            <Pressable
              style={[
                styles.activityCard,
                selected === 'Otro' && { backgroundColor: theme.addBtnBg ?? '#2FCCAC' },
              ]}
              onPress={() => setSelected('Otro')}
            >
              <View style={styles.activityLeft}>
                <AppText
                  style={[
                    styles.activityName,
                    selected === 'Otro' && styles.activityNameSelected,
                    { color: selected === 'Otro' ? (theme.cardTextOnAccent ?? '#FFFFFF') : (theme.text ?? '#1A1A1A') },
                  ]}
                >
                  Otro
                </AppText>
                <AppText
                  style={[
                    styles.activityCal,
                    selected === 'Otro' && styles.activityCalSelected,
                    { color: selected === 'Otro' ? (theme.cardTextOnAccent ?? '#FFFFFF') : (theme.subtext ?? '#6B7280') },
                  ]}
                >
                  Ingreso manual de datos
                </AppText>
              </View>
              <View style={[styles.manualBadge, { borderColor: (theme.brandA ?? '#2FCCAC') + '33', backgroundColor: theme.addBtnBg ?? '#FFFFFF' }]}>
                <AppText
                  style={[
                    styles.manualBadgeText,
                    selected === 'Otro' && styles.manualBadgeTextSelected,
                    { color: selected === 'Otro' ? ( '#FFFFFF') : (theme.white ?? '#2FCCAC') },
                  ]}
                >
                  +
                </AppText>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Footer con botón fijo */}
      <View style={[styles.footer, { backgroundColor: theme.bg ?? '#FFFFFF', borderTopColor: theme.linea ?? '#E5E7EB' }]}>
        <Pressable
          style={[
            styles.continueButton,
            isContinueDisabled && styles.continueButtonDisabled,
          ]}
          onPress={onContinue}
          disabled={isContinueDisabled}
        >
          <AppText style={styles.continueButtonText}>{'Continuar'}</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (s: (n:number)=>number, theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  // Card grande tipo Figma
  card: {
    backgroundColor: '#E9FBF6',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: '#000', shadowOpacity: 0.06, elevation: -12,
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
    backgroundColor: theme.mealRowBg??'#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityCardSelected: {
    backgroundColor: theme.addBtnBg ??'#2FCCAC',
  },
  activityLeft: {
    
  },
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

  manualBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
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
    backgroundColor: theme.addBtnBg ?? '#2FCCAC',
    borderRadius: 20,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: theme.addBtnBgdisable ??'#7AD3C1',
  },
  continueButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
  },
});
