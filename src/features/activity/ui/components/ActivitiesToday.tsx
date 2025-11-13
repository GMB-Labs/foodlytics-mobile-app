import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import ProgressIcon from '@/assets/icons/activity/progressIcon.svg';

export default function ActivitiesToday() {
  return (
    <View style={{ marginTop: 24 }}>
      <AppText variant="ag7" color="#1A1A1A">Actividades de Hoy</AppText>

      <View style={styles.emptyCard}>
        <View style={styles.emptyIconCircle}>
          <ProgressIcon width={32} height={32} stroke-width={2.667} color={'#99A1AF'} />
        </View>
        <AppText variant="ag7" color="#4A5565" style={{ marginTop: 12, textAlign: 'center' }}>
          No hay actividades registradas
        </AppText>
        <AppText variant="ag9" color="#6A7282" style={{ marginTop: 8, textAlign: 'center' }}>
          ¡Comienza a moverte!
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyCard: { marginTop: 12, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 999, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
});
