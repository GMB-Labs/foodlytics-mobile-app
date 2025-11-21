import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';

interface MealItem {
  id: string;
  name: string;
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams
  kcal: number;
  time: string;
}

interface MealCardProps {
  label: string;
  icon: React.ComponentType<{ width: number; height: number }>;
  backgroundColor: string;
  hasItems: boolean;
  items?: MealItem[]; // optional list of registered items for this meal
  isSelectedToday: boolean;
  isSelectedFuture: boolean;
  onAddPress: () => void;
  onViewPress?: () => void; // view details for the meal category
}

// Text constants (outside component to avoid lint warnings)
const TEXT_PROTEINAS = 'Proteínas';
const TEXT_CARBOS = 'Carbos';
const TEXT_GRASAS = 'Grasas';
const TEXT_VER_DETALLES = 'Ver detalles';
const TEXT_ARROW = '›';
const TEXT_PLUS = '+';
const TEXT_AGREGAR_COMIDA = 'Agregar comida';

export default function MealCard({
  label,
  icon: Icon,
  backgroundColor,
  hasItems,
  items = [],
  isSelectedToday,
  isSelectedFuture,
  onAddPress,
  onViewPress,
}: MealCardProps) {
  // compute totals
  const totals = items.reduce(
    (acc, it) => {
      acc.protein += it.protein;
      acc.carbs += it.carbs;
      acc.fats += it.fats;
      acc.kcal += it.kcal;
      return acc;
    },
    { protein: 0, carbs: 0, fats: 0, kcal: 0 }
  );

  return (
    <View style={styles.mealCard}>
      {/* Meal Header */}
      <View style={styles.mealHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={[styles.iconCircle, { backgroundColor }]}> 
            <Icon width={24} height={24} />
          </View>
          <AppText style={styles.mealLabel}>{label}</AppText>
        </View>
        {/* Show total kcal badge if there are items */}
        {hasItems && items.length > 0 && (
          <View style={styles.kcalBadge}>
            <AppText style={styles.kcalBadgeText}>{`${totals.kcal} kcal`}</AppText>
          </View>
        )}
      </View>

      {/* Meal Content */}
      {hasItems && items.length > 0 ? (
        <View style={{ gap: 16 }}>
          {/* Items list */}
          <View style={{ gap: 8 }}>
            {items.map((it, idx) => {
              // use the item's own time when available, otherwise fallback to sample times
              const timeText = it.time ;
              return (
                <View key={it.id} style={styles.itemRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <View style={styles.bulletPoint} />
                    <AppText variant="ag9" style={styles.itemName}>{it.name}</AppText>
                  </View>
                  <AppText variant="ag10" color="#6A7282">{timeText}</AppText>
                </View>
              );
            })}
          </View>

          {/* Macros cards */}
          <View style={styles.macrosRow}>
            <View style={[styles.macroCard, { backgroundColor: '#EFF6FF' }]}>
              <AppText style={[styles.macroValue, { color: '#2B7FFF' }]}>
                {`${totals.protein}g`}
              </AppText>
              <AppText style={styles.macroLabel}>{TEXT_PROTEINAS}</AppText>
            </View>
            <View style={[styles.macroCard, { backgroundColor: '#FFF7ED' }]}>
              <AppText style={[styles.macroValue, { color: '#FF6900' }]}>
                {`${totals.carbs}g`}
              </AppText>
              <AppText style={styles.macroLabel}>{TEXT_CARBOS}</AppText>
            </View>
            <View style={[styles.macroCard, { backgroundColor: '#FEFCE8' }]}>
              <AppText style={[styles.macroValue, { color: '#F0B100' }]}>
                {`${totals.fats}g`}
              </AppText>
              <AppText style={styles.macroLabel}>{TEXT_GRASAS}</AppText>
            </View>
          </View>

          {/* Actions: Ver detalles + agregar (+) */}
          <View style={styles.actionsRow}>
            <Pressable onPress={onViewPress} style={styles.viewDetails}>
              <AppText style={styles.viewDetailsText}>{TEXT_VER_DETALLES}</AppText>
              <AppText style={styles.viewDetailsArrow}>{TEXT_ARROW}</AppText>
            </Pressable>

            {isSelectedToday && (
              <Pressable
                style={[
                  styles.addSmallButton,
                  (isSelectedFuture || !isSelectedToday) && styles.addButtonDisabled,
                ]}
                onPress={() => {
                  if (isSelectedFuture || !isSelectedToday) return;
                  onAddPress();
                }}
                disabled={isSelectedFuture || !isSelectedToday}
              >
                <AppText style={styles.addButtonIcon}>{TEXT_PLUS}</AppText>
              </Pressable>
            )}
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.mealContent,
            styles.mealContentEmpty,
          ]}
        >
          <AppText style={styles.emptyText}>
            {`No has registrado ${label.toLowerCase()}`}
          </AppText>

          {/* Show button only for today; for past/future dates, hide it */}
          {isSelectedToday && (
            <Pressable
              style={[styles.addButton, isSelectedFuture && styles.addButtonDisabled]}
              onPress={() => {
                if (isSelectedFuture) return;
                onAddPress();
              }}
              disabled={isSelectedFuture}
            >
              <AppText style={styles.addButtonIcon}>{TEXT_PLUS}</AppText>
              <AppText style={styles.addButtonText}>{TEXT_AGREGAR_COMIDA}</AppText>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    gap: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#1A1A1A',
  },
  kcalBadge: {
    backgroundColor: '#2FCCAC',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 4,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kcalBadgeText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
  },
  mealContent: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 20,
    gap: 12,
    paddingHorizontal: 20,
  },
  // Empty state keeps a minimum height and centers content (per Figma)
  mealContentEmpty: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#6A7282',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#2FCCAC',
    borderRadius: 20,
    height: 36,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#94d6c4',
    opacity: 0.6,
  },
  addButtonIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
  },
  /* Items list styles */
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2FCCAC',
  },
  itemName: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#364153',
  },

  /* Macros cards */
  macrosRow: {
    flexDirection: 'row',
    gap: 8,
  },
  macroCard: {
    flex: 1,
    borderRadius: 20,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 4,
  },
  macroValue: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '500',
    textAlign: 'center',
  },
  macroLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#4A5565',
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  viewDetailsText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#2FCCAC',
  },
  viewDetailsArrow: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#2FCCAC',
    fontWeight: '600',
  },
  addSmallButton: {
    backgroundColor: '#2FCCAC',
    borderRadius: 20,
    width: 33,
    height: 33,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
