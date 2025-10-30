import React from 'react';
import { View, Pressable } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import BreakfastIcon from '@/assets/icons/BreakfastIcon.svg';
import LunchIcon from '@/assets/icons/LunchIcon.svg';
import DinnerIcon from '@/assets/icons/DinnerIcon.svg';
import { styles } from './styles';
import { useRouter } from 'expo-router';

import Flecha from '@/assets/icons/flehaIcon.svg';

export default function MealsList({
  meals, onAdd, compact = false, rowH = 74, iconSize = 44, radius = 16, horizontalPad = 20,
}: {
  meals: { key: string; title: string; calories?: string | null; chipBg: string; }[];
  onAdd: (k: string) => void;
  compact?: boolean;
  rowH?: number; iconSize?: number; radius?: number; horizontalPad?: number;
}) {
  const router = useRouter();

  const todayISO = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const goToMeals = (mealKey?: string) => {
    if (mealKey) {
      // navigate to a path-style detail route; use object form to avoid TS path typing issues
      router.push({ pathname: '/(tabs)/meals/detalle/[mealKey]', params: { mealKey } } as any);
    } else router.push('/(tabs)/meals');
  };

  const goToCameraFor = (mealKey: string) => {
    const dateISO = todayISO();
    router.push(`/camera?dateISO=${encodeURIComponent(dateISO)}&mealType=${encodeURIComponent(mealKey)}`);
  };
  return (
    <View style={[styles.mealsWrapper, { paddingHorizontal: horizontalPad, marginTop: compact ? 30 : 40 }]}> 
      <View style={[styles.mealsCard, { padding: compact ? 20 : 30,  }]}> 
        <View style={[styles.mealsHeader, { paddingBottom: compact ? 2 : 0 }]}> 
          <AppText variant="ag7">Comidas de Hoy</AppText>
          <Pressable onPress={() => goToMeals()}><AppText variant="ag9" style={{ color: '#2FCCAC' }}>Ver todas</AppText></Pressable>
        </View>

        <View style={{ marginTop: compact ? 8 : 12 }}>
          {meals.map(({ key, title, calories, chipBg }) => (
            <View
              key={key}
              style={[
                styles.mealRow,
                {
                  height: rowH,
                  paddingVertical: compact ? 12 : 14,
                  paddingHorizontal: compact ? 12 : 16,
                  borderRadius: radius,
                  marginBottom: compact ? 8 : 12,
                }
              ]}
            >
              <View
                style={[
                  styles.mealChip,
                  {
                    width: iconSize,
                    height: iconSize,
                    borderRadius: Math.round(iconSize * 0.42),
                    marginRight: compact ? 12 : 16,
                    backgroundColor: chipBg
                  }
                ]}
              >
                {/* choose icon internally by meal key; icons are bundled locally */}
                {(() => {
                  const IconComp = key === 'lunch' ? LunchIcon : key === 'dinner' ? DinnerIcon : BreakfastIcon;
                  return <IconComp width={Math.round(iconSize * 0.5)} height={Math.round(iconSize * 0.5)} color="#1A1A1A" />;
                })()}
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="ag9" style={{ color: '#1A1A1A' }} numberOfLines={1}>{title}</AppText>
                {/* if calories is missing or empty, show 'No registrada' */}
                <AppText
                  variant="ag9"
                  style={{ color: calories && String(calories).trim() !== '' ? '#2FCCAC' : '#6A7282' }}
                  numberOfLines={1}
                >
                  {calories && String(calories).trim() !== '' ? String(calories) : 'No registrada'}
                </AppText>
              </View>

              {/* right action: if there is calories, show chevron; else show + add button */}
              {calories && String(calories).trim() !== '' ? (
                <Pressable onPress={() => goToMeals(key)} style={[styles.arrowContainer, { width: 18, height: 18 }]}> 
                  <Flecha width={16} height={16} />
                </Pressable>
              ) : (
                <Pressable onPress={() => { if (onAdd) onAdd(key); goToCameraFor(key); }} style={styles.addBtn}>
                  <AppText variant="ag7" style={{ color: '#FFFFFF' }}>+</AppText>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
