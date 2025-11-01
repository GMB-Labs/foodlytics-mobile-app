// src/features/profile/ui/screens/Notifications.tsx
import React, { useEffect, useState } from 'react';
import { View, Switch, Pressable, Text, Platform, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useRouter } from 'expo-router';
import SHeader from '../sections/SHeader';
import { NotificationsPreferences } from '@/src/shared/types/notifications';
import { loadNotifPrefs, saveNotifPrefs } from '@/src/shared/utils/notifications-storage';
import { scheduleFromPrefs } from '@/src/shared/utils/notifications-orchestrator';
import { getPermissionStatus, requestPermissionIfNeeded, openSystemSettingsWithAlert } from '@/src/shared/utils/notifications';
import InfoIcon from '@/assets/icons/infoIcon.svg';


const FALLBACK: NotificationsPreferences = {
  dailySummary: true,
  activitySuggestions: true,
  mealReminders: {
    breakfast: { enabled: true,  time: '08:00' },
    lunch:     { enabled: true,  time: '13:00' },
    dinner:    { enabled: true,  time: '19:00' },
  },
};


export default function NotificationsScreen() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<NotificationsPreferences>(FALLBACK);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerMeal, setPickerMeal] = useState<'breakfast'|'lunch'|'dinner'|null>(null);
  const [pickerDate, setPickerDate] = useState<Date>(new Date());

  useEffect(() => { (async () => {
    const saved = await loadNotifPrefs();
    if (saved) setPrefs(saved);
  })(); }, []);

  async function ensurePerms() {
    const s = await getPermissionStatus();
    if (s === 'granted') return true;
    const r = await requestPermissionIfNeeded();
    if (r === 'granted') return true;
    openSystemSettingsWithAlert();
    return false;
  }

  async function handleToggle(key: keyof NotificationsPreferences, value: boolean) {
    const ok = await ensurePerms();
    if (!ok) return;
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    await saveNotifPrefs(updated);
    await scheduleFromPrefs(updated);
  }

  async function handleMealToggle(meal: 'breakfast'|'lunch'|'dinner', enabled: boolean) {
    const ok = await ensurePerms();
    if (!ok) return;
    const updated = {
      ...prefs,
      mealReminders: {
        ...(prefs.mealReminders || {}),
        [meal]: { ...(prefs.mealReminders?.[meal] || {}), enabled },
      },
    };
    setPrefs(updated);
    await saveNotifPrefs(updated);
    await scheduleFromPrefs(updated);
  }

  async function handleAlertToggle(key: 'deficit'|'excess'|'water', value: boolean) {
    if (value) {
      const ok = await ensurePerms();
      if (!ok) return;
    }
    const updated = { ...prefs, alerts: { ...(prefs.alerts || {}), [key]: value } } as NotificationsPreferences;
    setPrefs(updated);
    await saveNotifPrefs(updated);
    await scheduleFromPrefs(updated);
  }

  async function handleTipToggle(key: 'nutrition'|'exercise'|'motivational', value: boolean) {
    const updated = { ...prefs, tips: { ...(prefs.tips || {}), [key]: value } } as NotificationsPreferences;
    setPrefs(updated);
    await saveNotifPrefs(updated);
    await scheduleFromPrefs(updated);
  }

  async function handleGoalToggle(key: 'stepsReached'|'weeklySummary', value: boolean) {
    const updated = { ...prefs, goals: { ...(prefs.goals || {}), [key]: value } } as NotificationsPreferences;
    setPrefs(updated);
    await saveNotifPrefs(updated);
    await scheduleFromPrefs(updated);
  }

  const openTimePicker = (meal: 'breakfast'|'lunch'|'dinner') => {
    const t = prefs.mealReminders?.[meal]?.time;
    const [hh = '08', mm = '00'] = (t || (meal === 'breakfast' ? '08:00' : meal === 'lunch' ? '13:00' : '19:00')).split(':');
    const d = new Date();
    d.setHours(Number(hh), Number(mm), 0, 0);
    setPickerDate(d);
    setPickerMeal(meal);
    setShowTimePicker(true);
  };

  const handleNativeTimeChange = (event: any, date?: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (!date || !pickerMeal) return;
      const hh = date.getHours().toString().padStart(2, '0');
      const mm = date.getMinutes().toString().padStart(2, '0');
      const time = `${hh}:${mm}`;
      const updated = {
        ...prefs,
        mealReminders: {
          ...(prefs.mealReminders || {}),
          [pickerMeal]: { ...(prefs.mealReminders?.[pickerMeal] || {}), enabled: true, time },
        },
      };
      setPrefs(updated);
      saveNotifPrefs(updated);
      scheduleFromPrefs(updated);
      setPickerMeal(null);
    } else {
      if (date) setPickerDate(date);
    }
  };

  const confirmTimePicker = async () => {
    if (!pickerMeal) { setShowTimePicker(false); return; }
    const hh = pickerDate.getHours().toString().padStart(2, '0');
    const mm = pickerDate.getMinutes().toString().padStart(2, '0');
    const time = `${hh}:${mm}`;
    const updated = {
      ...prefs,
      mealReminders: {
        ...(prefs.mealReminders || {}),
        [pickerMeal]: { ...(prefs.mealReminders?.[pickerMeal] || {}), enabled: true, time },
      },
    };
    setPrefs(updated);
    await saveNotifPrefs(updated);
    await scheduleFromPrefs(updated);
    setShowTimePicker(false);
    setPickerMeal(null);
  };

  const cancelTimePicker = () => {
    setShowTimePicker(false);
    setPickerMeal(null);
  };

  const getMealLabel = (meal: 'breakfast'|'lunch'|'dinner') => {
    if (meal === 'breakfast') return 'Desayuno';
    if (meal === 'lunch') return 'Almuerzo';
    return 'Cena';
  };

  // Toggle from switch: if enabling, open the time picker so user can choose time
  const toggleMealSwitch = async (meal: 'breakfast'|'lunch'|'dinner', newValue: boolean) => {
    const currently = !!(prefs.mealReminders && prefs.mealReminders[meal]?.enabled);
    if (newValue && !currently) {
      const ok = await ensurePerms();
      if (!ok) return; // permissions denied
      // open time picker to select time before finalizing
      openTimePicker(meal);
      return;
    }
    // disabling or toggling to same state: apply directly
    await handleMealToggle(meal, newValue);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header with gradient */}
      <SHeader
        title="Notificaciones"
        subtitle="Configura tus recordatorios"
        onBack={() => router.replace({ pathname: "/profile" } as any)}
      />

      {/* Scrollable content (info card included) */}
      <ScrollView 
        style={styles.scrollContent} 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Info card (parte del scroll) */}
        <View style={[styles.infoCard, styles.infoCardAsCard]}>
          <InfoIcon width={20} height={20} />
          <Text style={styles.infoText}>
            Las notificaciones te ayudarán a mantener la constancia en tu registro diario. Puedes activar o desactivar cada recordatorio según tus preferencias.
          </Text>
        </View>
        {/* Recordatorios de comidas */}
        <Card>
          <Text style={styles.cardTitle}>Recordatorios de comidas</Text>
          <View style={styles.mealList}>
            {(['breakfast', 'lunch', 'dinner'] as const).map((meal, index) => {
              const enabled = !!(prefs.mealReminders && prefs.mealReminders[meal]?.enabled);
              const selectedTime = prefs.mealReminders && prefs.mealReminders[meal]?.time;
              return (
                <React.Fragment key={meal}>
                  <View style={styles.mealRow}>
                    <View style={styles.mealInfo}>
                      <Text style={styles.mealLabel}>{getMealLabel(meal)}</Text>
                      {selectedTime && <Text style={styles.mealTime}>{selectedTime}</Text>}
                    </View>
                            <CustomSwitch
                              value={enabled}
                              onValueChange={(v) => toggleMealSwitch(meal, v)}
                            />
                  </View>
                  {index < 2 && <View style={styles.divider} />}
                </React.Fragment>
              );
            })}
          </View>
        </Card>

        {/* Alertas */}
        <Card>
          <Text style={styles.cardTitle}>Alertas</Text>
          <View style={styles.alertList}>
            <View style={styles.alertRow}>
              <View style={styles.alertInfo}>
                <Text style={styles.alertLabel}>Déficit calórico</Text>
                <Text style={styles.alertDescription}>
                  Alerta cuando consumas menos del 70% de tu meta
                </Text>
              </View>
              <CustomSwitch value={!!prefs.alerts?.deficit} onValueChange={(v) => handleAlertToggle('deficit', v)} />
            </View>
            <View style={styles.divider} />
            <View style={styles.alertRow}>
              <View style={styles.alertInfo}>
                <Text style={styles.alertLabel}>Exceso calórico</Text>
                <Text style={styles.alertDescription}>
                  Alerta cuando superes tu meta diaria
                </Text>
              </View>
              <CustomSwitch value={!!prefs.alerts?.excess} onValueChange={(v) => handleAlertToggle('excess', v)} />
            </View>
            <View style={styles.divider} />
            <View style={styles.alertRow}>
              <View style={styles.alertInfo}>
                <Text style={styles.alertLabel}>Recordatorio de agua</Text>
                <Text style={styles.alertDescription}>Cada 2 horas</Text>
              </View>
              <CustomSwitch value={!!prefs.alerts?.water} onValueChange={(v) => handleAlertToggle('water', v)} />
            </View>
          </View>
        </Card>

        {/* Consejos y motivación */}
        <Card>
          <Text style={styles.cardTitle}>Consejos y motivación</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipRow}>
              <View style={styles.tipInfo}>
                <Text style={styles.tipLabel}>Consejos nutricionales</Text>
                <Text style={styles.tipDescription}>Diariamente</Text>
              </View>
              <CustomSwitch value={!!prefs.tips?.nutrition} onValueChange={(v) => handleTipToggle('nutrition', v)} />
            </View>
            <View style={styles.divider} />
            <View style={styles.tipRow}>
              <View style={styles.tipInfo}>
                <Text style={styles.tipLabel}>Consejos de ejercicio</Text>
                <Text style={styles.tipDescription}>3 veces por semana</Text>
              </View>
              <CustomSwitch value={!!prefs.tips?.exercise} onValueChange={(v) => handleTipToggle('exercise', v)} />
            </View>
            <View style={styles.divider} />
            <View style={styles.tipRow}>
              <View style={styles.tipInfo}>
                <Text style={styles.tipLabel}>Mensajes motivacionales</Text>
                <Text style={styles.tipDescription}>Semanalmente</Text>
              </View>
              <CustomSwitch value={!!prefs.tips?.motivational} onValueChange={(v) => handleTipToggle('motivational', v)} />
            </View>
          </View>
        </Card>

        {/* Metas de actividad */}
        <Card>
          <Text style={styles.cardTitle}>Metas de actividad</Text>
          <View style={styles.goalsList}>
            <View style={styles.goalRow}>
              <View style={styles.goalInfo}>
                <Text style={styles.goalLabel}>Meta de pasos alcanzada</Text>
                <Text style={styles.goalDescription}>Notificar al completar</Text>
              </View>
              <CustomSwitch value={!!prefs.goals?.stepsReached} onValueChange={(v) => handleGoalToggle('stepsReached', v)} />
            </View>
            <View style={styles.divider} />
            <View style={styles.goalRow}>
              <View style={styles.goalInfo}>
                <Text style={styles.goalLabel}>Resumen semanal</Text>
                <Text style={styles.goalDescription}>Domingos a las 8:00 PM</Text>
              </View>
              <CustomSwitch value={!!prefs.goals?.weeklySummary} onValueChange={(v) => handleGoalToggle('weeklySummary', v)} />
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Time picker modals */}
      {Platform.OS === 'android' && showTimePicker && pickerMeal && (
        <DateTimePicker value={pickerDate} mode="time" display="default" onChange={handleNativeTimeChange} />
      )}

      {Platform.OS === 'ios' && showTimePicker && pickerMeal && (
        <Modal visible={showTimePicker} transparent animationType="fade" onRequestClose={cancelTimePicker}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <DateTimePicker value={pickerDate} mode="time" display="spinner" onChange={handleNativeTimeChange} style={{ width: '100%' }} />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                <TouchableOpacity onPress={cancelTimePicker} style={styles.modalButton}>
                  <Text style={{ color: '#6B7280' }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmTimePicker} style={[styles.modalButton, { marginLeft: 12 }]}>
                  <Text style={{ color: '#2FCCAC' }}>Aceptar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function CustomSwitch({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={[styles.switchContainer, value && styles.switchContainerActive]}
    >
      <View style={[styles.switchThumb, value && styles.switchThumbActive]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  infoCard: {
    // make this card wider than the default content padding
    alignSelf: 'center',
    width: '100%',
    marginTop: 28,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  infoCardAsCard: {
    // keep the visual as a card when inside the scroll
    borderWidth: 1,
    borderColor: 'rgba(228,228,228,0.6)',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  infoIcon: {
    width: 20,
    height: 20,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontFamily: 'Poppins',
    fontSize: 14,
    lineHeight: 20,
    color: '#364153',
  },
  scrollContent: {
    flex: 1,
    marginTop: 0,
    paddingHorizontal: 32,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(228, 228, 228, 0.6)',
    padding: 21,
    marginTop: 18,
    marginBottom: 6,
  },
  cardTitle: {
    fontFamily: 'Arimo',
    fontSize: 16,
    lineHeight: 24,
    color: '#171725',
    marginBottom: 40,
  },
  mealList: {
    gap: 0,
  },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 39,
  },
  mealInfo: {
    gap: 0,
  },
  mealLabel: {
    fontFamily: 'Arimo',
    fontSize: 15,
    lineHeight: 15,
    color: '#171725',
  },
  mealTime: {
    fontFamily: 'Arimo',
    fontSize: 16,
    lineHeight: 24,
    color: '#999999',
  },
  alertList: {
    gap: 0,
  },
  alertRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 39,
    paddingVertical: 10,
  },
  alertInfo: {
    flex: 1,
    marginRight: 16,
  },
  alertLabel: {
    fontFamily: 'Arimo',
    fontSize: 15,
    lineHeight: 15,
    color: '#171725',
    marginBottom: 4,
  },
  alertDescription: {
    fontFamily: 'Arimo',
    fontSize: 16,
    lineHeight: 24,
    color: '#999999',
  },
  tipsList: {
    gap: 0,
  },
  tipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 39,
  },
  tipInfo: {
    flex: 1,
  },
  tipLabel: {
    fontFamily: 'Arimo',
    fontSize: 15,
    lineHeight: 15,
    color: '#171725',
  },
  tipDescription: {
    fontFamily: 'Arimo',
    fontSize: 16,
    lineHeight: 24,
    color: '#999999',
  },
  goalsList: {
    gap: 0,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 39,
  },
  goalInfo: {
    flex: 1,
  },
  goalLabel: {
    fontFamily: 'Arimo',
    fontSize: 15,
    lineHeight: 15,
    color: '#171725',
  },
  goalDescription: {
    fontFamily: 'Arimo',
    fontSize: 16,
    lineHeight: 24,
    color: '#999999',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(228, 228, 228, 0.6)',
    marginVertical: 16,
  },
  switchContainer: {
    width: 32,
    height: 18.391,
    borderRadius: 100,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    paddingHorizontal: 1,
  },
  switchContainerActive: {
    backgroundColor: '#2FCCAC',
  },
  switchThumb: {
    width: 16,
    height: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  modalButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
