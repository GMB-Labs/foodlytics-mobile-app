import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import GoalIcon from '@/assets/icons/activity/goalIcon.svg';

type Goal = { label: string; value: string; color?: string };

const defaultGoals: Goal[] = [
  { label: 'Calorías', value: '1789', color: '#2FCCAC' },
  { label: 'Proteínas', value: '134g', color: '#2B7FFF' },
  { label: 'Carbohidratos', value: '179g', color: '#FF6900' },
  { label: 'Grasas', value: '60g', color: '#F0B100' },
];

export default function DailyGoals({ goals = defaultGoals }: { goals?: Goal[] }) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <AppText variant="ag7" color="#1A1A1A">Metas Diarias</AppText>
        <TouchableOpacity style={styles.adjustBtn} activeOpacity={0.85}>
          <GoalIcon width={16} height={16} color={'#1A1A1A'} />
          <AppText variant="ag9" color="#1A1A1A" style={{ marginLeft: 8 }}>Ajustar</AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {goals.map((g, i) => (
          <View key={i} style={styles.gridItem}>
            <AppText variant="ag10" color="#4A5565">{g.label}</AppText>
            <AppText variant="ag6" color={g.color ?? '#2FCCAC'} style={{ marginTop: 4 }}>
              {g.value}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 20, 
    marginTop: 12, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 4, 
    elevation: 2 
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  adjustBtn: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 20, 
    paddingHorizontal: 12, 
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  grid: { 
    marginTop: 16, 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12,
  },
  gridItem: { 
    width: '48%', 
    backgroundColor: '#F8FAFC', 
    borderRadius: 20, 
    paddingVertical: 12, 
    paddingHorizontal: 12,
  },
});
