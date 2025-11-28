/* eslint-disable react-native/no-raw-text */
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import { useTheme } from '@/src/shared/styles/useTheme';

import WeightIcon from '@/assets/icons/activity/weightIcon.svg';
import DownIcon from '@/assets/icons/activity/downIcon.svg';
import MantenimientoIcon from '@/assets/icons/activity-icon.svg';
import VolumenIcon from '@/assets/icons/activity/progressIcon.svg';
import GoalIcon from '@/assets/icons/activity/goalIcon.svg';
import AddIcon from '@/assets/icons/activity/addIcon.svg';

type Props = {
  weight?: string | number;
  unit?: string;
  delta?: string;
  goalType?: string;
  progressToGoal?: string | number;
  onRegisterPress?: () => void;
};

export default function WeightCard({
  weight = '',
  unit = '',
  delta = '',
  goalType,
  progressToGoal = '',
  onRegisterPress,
}: Props) {
  const { colors } = useTheme();
  const theme = colors as any;
  return (
    <View style={[styles.card, { backgroundColor: theme.mealsCard ?? '#FFFFFF' }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <AppText variant="ag7" color={theme.text ?? '#1A1A1A'}>
          Peso y progreso
        </AppText>

        <TouchableOpacity
          style={[styles.registerBtn, { borderColor: theme.border ?? '#E5E7EB', backgroundColor: theme.card ?? '#FFFFFF' }]}
          activeOpacity={0.85}
          onPress={onRegisterPress}
        >
          <AddIcon width={16} height={16} color={theme.text ?? '#1A1A1A'} />
          <AppText variant="ag9" color={theme.text ?? '#1A1A1A'} style={styles.registerLabel}>
            Registrar
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Grid 2 columnas */}
      <View style={styles.gridRow}>
        {/* Card izquierda: Peso */}
        <View style={[styles.innerCard, styles.leftInner, { backgroundColor: theme.imc?.bubbleBg ?? '#ECFDF7' }]}>
          <View style={styles.innerHeader}>
            <WeightIcon width={20} height={20} color={theme.brandA ?? '#2FCCAC'} />
            <AppText variant="ag9" color={theme.subtext ?? '#4A5565'} style={styles.innerHeaderLabel}>
              Peso
            </AppText>
          </View>

          {/* Bloque central con 2 líneas alineables */}
          <View style={styles.bodyCenter}>
            <View style={styles.valueBlock}>
              {/* Primera línea: */}
              <View style={styles.firstLineRowLeft}>
                <AppText
                  variant="ag2"
                  color={theme.brandA ?? '#2FCCAC'}
                  style={styles.largeNumber}
                >
                  {String(weight)}
                </AppText>
                {!!unit && (
                  <AppText
                    variant="ag9"
                    color={theme.subtext ?? '#6A7282'}
                    style={styles.unitText}
                  >
                    {unit}
                  </AppText>
                )}
              </View>

              {/* Mostrar tipo de objetivo + icono (Definición / Mantenimiento / Volumen) */}
              {/** priority: goalType -> icon+label, fallback to delta if provided */}
              {goalType ? (
                <View style={styles.secondLineRowLeft}>
                  {(() => {
                    const gt = String(goalType).toLowerCase();
                    if (gt === 'maintenance' || gt === 'mantenimiento') {
                      return <MantenimientoIcon width={16} height={16} color={theme.activity?.intensity?.lowText ?? '#6B7280'} />;
                    }
                    if (gt === 'definition' || gt === 'definicion' || gt === 'weight_loss' || gt === 'cutting') {
                      return <DownIcon width={16} height={16} color={theme.activity?.intensity?.lowText ?? '#00C950'} />;
                    }
                    // bulking / volumen
                    return <VolumenIcon width={16} height={16} color={theme.activity?.intensity?.lowText ?? '#2B7FFF'} />;
                  })()}
                  <AppText
                    variant="ag9"
                    color={theme.activity?.intensity?.lowText ?? '#00C950'}
                    style={styles.deltaText}
                  >
                    {(() => {
                      const gt = String(goalType).toLowerCase();
                      if (gt === 'maintenance' || gt === 'mantenimiento') return 'Mantenimiento';
                      if (gt === 'definition' || gt === 'definicion' || gt === 'weight_loss' || gt === 'cutting') return 'Definición';
                      return 'Volumen';
                    })()}
                  </AppText>
                </View>
              ) : !!delta ? (
                <View style={styles.secondLineRowLeft}>
                  <DownIcon width={16} height={16} color={theme.activity?.intensity?.lowText ?? '#00C950'} />
                  <AppText
                    variant="ag9"
                    color={theme.activity?.intensity?.lowText ?? '#00C950'}
                    style={styles.deltaText}
                  >
                    {delta}
                  </AppText>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Card derecha: Progreso a meta */}
        <View style={[styles.innerCard, styles.rightInner, { backgroundColor: theme.infoCardBg ?? '#F1F5FF' }]}>
          <View style={styles.innerHeader}>
            <GoalIcon width={16} height={16} color={theme.quickActions?.weight ?? '#2B7FFF'} />
            <AppText
              variant="ag9"
              color={theme.subtext ?? '#4A5565'}
              style={styles.innerHeaderLabel}
            >
              Progreso a meta
            </AppText>
          </View>

          {/* Bloque central con 2 líneas alineables */}
          <View style={styles.bodyCenter}>
            <View style={styles.valueBlock}>
              {/* Primera línea: 4.0 */}
              <View style={styles.firstLineRowRight}>
                <AppText
                  variant="ag2"
                  color={theme.quickActions?.weight ?? '#2B7FFF'}
                  style={styles.largeNumberCenter}
                >
                  {String(progressToGoal)}
                </AppText>
              </View>

              {/* Segunda línea: kg restantes */}
              <View style={styles.secondLineRowRight}>
                <AppText
                  variant="ag9"
                  color={theme.subtext ?? '#6A7282'}
                  style={styles.remainingLabel}
                >
                  kg restantes
                </AppText>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  registerLabel: {
    marginLeft: 8,
  },

  gridRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: 12,
  },

  innerCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    minHeight: 140,
  },
  leftInner: {
    backgroundColor: '#ECFDF7',
  },
  rightInner: {
    backgroundColor: '#F1F5FF',
  },

  innerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  innerHeaderLabel: {
    marginLeft: 8,
    flexShrink: 1,
  },

  /* Bloque central común para ambas cards */
  bodyCenter: {
    flex: 1,
    justifyContent: 'center',
  },
  valueBlock: {
    // aquí podrías ajustar marginTop/marginBottom si en Figma está un poco más arriba o abajo
  },

  /* Primera línea */
  firstLineRowLeft: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  firstLineRowRight: {
    alignItems: 'center',
  },

  largeNumber: {
    fontSize: 30,
    lineHeight: 36,
  },
  largeNumberCenter: {
    fontSize: 30,
    lineHeight: 36,
    textAlign: 'center',
  },
  unitText: {
    marginLeft: 4,
    marginBottom: 7,
  },

  /* Segunda línea */
  secondLineRowLeft: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondLineRowRight: {
    marginTop: 4,
    alignItems: 'center',
  },
  deltaText: {
    marginLeft: 4,
  },
  remainingLabel: {
    textAlign: 'center',
  },
});

