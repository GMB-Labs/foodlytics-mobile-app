import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, ScrollView, Platform, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { PrimaryGradient } from '@/src/shared/ui/components/Gradients';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProgressBar from '@/src/shared/ui/ProgressBar';
import OnboardingCard from '@/src/features/onboarding/ui/OnboardingCard';
import AppText from '@/src/shared/ui/components/Typography';
import { useOnboarding } from '@/src/features/onboarding/application/OnboardingProvider';
import type { OnboardingActions } from '@/src/features/onboarding/application/store';
import OnboardingFooter from '@/src/features/onboarding/ui/OnboardingFooter';
import { saveNotifPrefs } from '@/src/shared/utils/notifications-storage';

import { getPermissionStatus, requestPermissionIfNeeded, openSystemSettingsWithAlert } from '@/src/shared/utils/notifications';
import { scheduleFromPrefs } from '@/src/shared/utils/notifications-orchestrator';
import type { NotificationsPreferences } from '@/src/shared/types/notifications';

export default function StepNotifications() {
  const router = useRouter();
  const [state, actions] = useOnboarding();

  const defaultPrefs: NotificationsPreferences = {
    dailySummary: false,
    mealReminders: { breakfast: { enabled: false }, lunch: { enabled: false }, dinner: { enabled: false } },
    activitySuggestions: false,
  };

  // Normalize any possibly-partial prefs coming from onboarding state so required boolean fields are present
  const _fromState = state.notificationsPreferences;
  const initial: NotificationsPreferences = {
    dailySummary: !!_fromState?.dailySummary,
    activitySuggestions: !!_fromState?.activitySuggestions,
    mealReminders: {
      breakfast: {
        enabled: !!_fromState?.mealReminders?.breakfast?.enabled,
        time: _fromState?.mealReminders?.breakfast?.time,
      },
      lunch: {
        enabled: !!_fromState?.mealReminders?.lunch?.enabled,
        time: _fromState?.mealReminders?.lunch?.time,
      },
      dinner: {
        enabled: !!_fromState?.mealReminders?.dinner?.enabled,
        time: _fromState?.mealReminders?.dinner?.time,
      },
    },
  };

  const [prefs, setPrefs] = useState<NotificationsPreferences>(initial);
  const [requesting, setRequesting] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerMeal, setPickerMeal] = useState<'breakfast'|'lunch'|'dinner'|null>(null);
  const [pickerDate, setPickerDate] = useState<Date>(new Date());
  // control whether the per-meal controls are visible
  const anyMealEnabled = !!(
    initial.mealReminders.breakfast.enabled ||
    initial.mealReminders.lunch.enabled ||
    initial.mealReminders.dinner.enabled
  );
  const [mealControlsVisible, setMealControlsVisible] = useState<boolean>(anyMealEnabled);

  useEffect(() => {
    // sincroniza estado sin pedir permisos
    getPermissionStatus().then((s) => (actions as OnboardingActions).setNotificationsPermission(s));
  }, []);

  const ensurePermissionOnEnable = async () => {
    const status = await getPermissionStatus();
    if (status === 'granted') {
      (actions as OnboardingActions).setNotificationsPermission('granted');
      return true;
    }
    if (status === 'undetermined') {
      const asked = await requestPermissionIfNeeded();
      (actions as OnboardingActions).setNotificationsPermission(asked);
      return asked === 'granted';
    }
    // denied permanente
    (actions as OnboardingActions).setNotificationsPermission('denied');
    openSystemSettingsWithAlert();
    return false;
  };

  const toggleOption = async (key: keyof NotificationsPreferences) => {
    if (key === 'dailySummary' || key === 'activitySuggestions') {
      const next = !(prefs as any)[key];
      if (next) {
        const ok = await ensurePermissionOnEnable();
        if (!ok) return;
      }
      setPrefs((p) => ({ ...p, [key]: next }));
    }
  };

  const toggleMealEnabled = async (meal: 'breakfast'|'lunch'|'dinner') => {
    const enabled = !!prefs.mealReminders[meal]?.enabled;
    if (!enabled) {
      // enabling: request permission then open picker to choose time (only set enabled after user picks a time)
      const ok = await ensurePermissionOnEnable();
      if (!ok) return;
      openTimePicker(meal);
      return;
    }
    // disabling: keep time but mark disabled
    setPrefs((p) => ({
      ...p,
      mealReminders: {
        ...(p.mealReminders || {}),
        [meal]: { ...(p.mealReminders?.[meal] || {}), enabled: false, time: p.mealReminders?.[meal]?.time },
      },
    }));
  };

  const toggleMealControlsVisibility = () => {
    const next = !mealControlsVisible;
    // if hiding controls, clear all meal enabled flags
    if (!next) {
      setPrefs((p) => ({
        ...p,
        mealReminders: {
          breakfast: { ...(p.mealReminders?.breakfast || {}), enabled: false },
          lunch: { ...(p.mealReminders?.lunch || {}), enabled: false },
          dinner: { ...(p.mealReminders?.dinner || {}), enabled: false },
        },
      }));
    }
    setMealControlsVisible(next);
  };

  const openTimePicker = (meal: 'breakfast'|'lunch'|'dinner') => {
    // initialize picker with existing time or sensible default
    const t = prefs.mealReminders?.[meal]?.time;
    const [hh = '08', mm = '00'] = (t || (meal === 'breakfast' ? '08:00' : meal === 'lunch' ? '13:00' : '19:00')).split(':');
    const d = new Date();
    d.setHours(Number(hh), Number(mm), 0, 0);
    setPickerDate(d);
    setPickerMeal(meal);
    setShowTimePicker(true);
  };
  // handle changes from native picker
  const handleNativeTimeChange = (event: any, date?: Date | undefined) => {
    if (Platform.OS === 'android') {
      // Android: picker appears as dialog; date is final
      setShowTimePicker(false);
      if (!date || !pickerMeal) return;
      const hh = date.getHours().toString().padStart(2, '0');
      const mm = date.getMinutes().toString().padStart(2, '0');
      const time = `${hh}:${mm}`;
      setPrefs((p) => ({
        ...p,
        mealReminders: {
          ...(p.mealReminders || {}),
          [pickerMeal]: { ...(p.mealReminders?.[pickerMeal] || {}), enabled: true, time },
        },
      }));
      setPickerMeal(null);
    } else {
      // iOS spinner inside modal: update preview value
      if (date) setPickerDate(date);
    }
  };

  const confirmTimePicker = () => {
    if (!pickerMeal) { setShowTimePicker(false); return; }
    const hh = pickerDate.getHours().toString().padStart(2, '0');
    const mm = pickerDate.getMinutes().toString().padStart(2, '0');
    const time = `${hh}:${mm}`;
    setPrefs((p) => ({
      ...p,
      mealReminders: {
        ...(p.mealReminders || {}),
        [pickerMeal]: { ...(p.mealReminders?.[pickerMeal] || {}), enabled: true, time },
      },
    }));
    setShowTimePicker(false);
    setPickerMeal(null);
  };

  const cancelTimePicker = () => {
    setShowTimePicker(false);
    setPickerMeal(null);
  };

  const onRequestPermission = async () => {
    setRequesting(true);
    try {
      const next = await requestPermissionIfNeeded();
      (actions as OnboardingActions).setNotificationsPermission(next);
      Alert.alert('Permisos', next === 'granted' ? 'Permisos concedidos' : next === 'denied' ? 'Permisos denegados' : 'No se otorgaron permisos');
      if (next === 'denied') openSystemSettingsWithAlert();
    } finally {
      setRequesting(false);
    }
  };

  const onContinue = async () => {
    (actions as OnboardingActions).setNotificationsPreferences(prefs);

    const anySelected =
      prefs.dailySummary ||
      prefs.activitySuggestions ||
      prefs.mealReminders.breakfast.enabled ||
      prefs.mealReminders.lunch.enabled ||
      prefs.mealReminders.dinner.enabled;

    if (anySelected) {
      const ok = await ensurePermissionOnEnable();
      if (ok) {
        await saveNotifPrefs(prefs);       // ← persistimos
        await scheduleFromPrefs(prefs);    // ← programamos
      }
    }

    router.push('/onboarding/summary');
  };

  const isValid = true;

  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <PrimaryGradient pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0 }} height={200} />

      <View style={{ flex: 1 }}>
        {/* Match spacing used in StepActivityLevel: fixed header height and paddingTop (no extra safe-area offset here) */}
        <View style={{ height: 112, paddingHorizontal: 32, paddingTop: 64 }}>
          <ProgressBar step={7} total={8} containerStyle={{ paddingHorizontal: 32 }} />
        </View>

        <OnboardingCard paddingHorizontal={32} paddingTop={24}>
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <View
              style={{
                width: 75,
                height: 75,
                borderRadius: 40,
                backgroundColor: '#E6FAF5',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
              }}
            >
              <AppText style={{ fontSize: 30, lineHeight: 34 }}>🔔</AppText>
            </View>
            <AppText variant="ag3" align="center" color="#111827">Notificaciones</AppText>
            <AppText variant="ag9" align="center" color="#6B7280">Elige qué notificaciones quieres recibir. Puedes omitir si no te interesa.</AppText>
          </View>

          <ScrollView style={{ marginTop: 12 }} contentContainerStyle={{ paddingBottom: 140 }}>
            {/* Resumen diario */}
            <Pressable hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} onPress={() => toggleOption('dailySummary' as any)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: prefs.dailySummary ? '#2FCCAC' : '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Text>📝</Text>
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="ag7" style={{ color: '#111827' }}>Resumen diario</AppText>
                <AppText variant="ag9" style={{ color: '#6B7280' }}>Un resumen de tu día con calorías y actividad</AppText>
              </View>
              <View style={{ width: 28, height: 28, borderRadius: 6, borderWidth: 1, borderColor: prefs.dailySummary ? '#2FCCAC' : '#E5E7EB', backgroundColor: prefs.dailySummary ? '#2FCCAC' : 'white', alignItems: 'center', justifyContent: 'center' }}>
                {prefs.dailySummary ? <Text style={{ color: 'white' }}>✓</Text> : null}
              </View>
            </Pressable>

            {/* Recordatorios de comidas */}
            <View style={{ marginTop: 8 }}>
              <Pressable hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} onPress={toggleMealControlsVisibility} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
                <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: mealControlsVisible ? '#2FCCAC' : '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Text>🍽️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="ag7" style={{ color: '#111827' }}>Recordatorios de comidas</AppText>
                  <AppText variant="ag9" style={{ color: '#6B7280' }}>Activa recordatorios y elige horas para cada comida</AppText>
                </View>
                <View style={{ width: 28, height: 28, borderRadius: 6, borderWidth: 1, borderColor: mealControlsVisible ? '#2FCCAC' : '#E5E7EB', backgroundColor: mealControlsVisible ? '#2FCCAC' : 'white', alignItems: 'center', justifyContent: 'center' }}>
                  {mealControlsVisible ? <Text style={{ color: 'white' }}>✓</Text> : null}
                </View>
              </Pressable>

              {/* Meal controls: show each meal with an enable toggle + time button (opens native time picker) */}
                {mealControlsVisible && (
                  <View style={{ marginTop: 8, paddingLeft: 52 }}>
                    {(['breakfast','lunch','dinner'] as const).map((meal) => {
                  const m = meal as 'breakfast' | 'lunch' | 'dinner';
                  const enabled = !!(prefs.mealReminders && prefs.mealReminders[m]?.enabled);
                  const selectedTime = prefs.mealReminders && prefs.mealReminders[m]?.time;
                  return (
                    <View key={m} style={{ marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Pressable hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} onPress={() => toggleMealEnabled(m)} style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: enabled ? '#2FCCAC' : '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                          <Text>{enabled ? '✓' : ''}</Text>
                        </Pressable>
                        <AppText variant="ag7" style={{ color: '#111827', textTransform: 'capitalize' }}>{m}</AppText>
                        {selectedTime ? (
                          <>
                            <AppText variant="ag9" style={{ color: '#6B7280', marginLeft: 8 }}>{selectedTime}</AppText>
                            <Pressable hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} onPress={() => openTimePicker(m)} style={{ marginLeft: 12, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
                              <AppText variant="ag9" style={{ color: '#111827' }}>Cambiar</AppText>
                            </Pressable>
                          </>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
                </View>
              )}
            </View>


            {/* Sugerencias de actividad */}
            <Pressable hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} onPress={() => toggleOption('activitySuggestions' as any)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: prefs.activitySuggestions ? '#2FCCAC' : '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Text>🏃‍♀️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="ag7" style={{ color: '#111827' }}>Sugerencias de actividad</AppText>
                <AppText variant="ag9" style={{ color: '#6B7280' }}>Pequeñas sugerencias para moverte durante el día</AppText>
              </View>
              <View style={{ width: 28, height: 28, borderRadius: 6, borderWidth: 1, borderColor: prefs.activitySuggestions ? '#2FCCAC' : '#E5E7EB', backgroundColor: prefs.activitySuggestions ? '#2FCCAC' : 'white', alignItems: 'center', justifyContent: 'center' }}>
                {prefs.activitySuggestions ? <Text style={{ color: 'white' }}>✓</Text> : null}
              </View>
            </Pressable>

            <View style={{ marginTop: 8 }}>
              <AppText variant="ag9" style={{ color: '#6B7280' }}>Si no seleccionas ninguna, omitirás las notificaciones.</AppText>
            </View>

          </ScrollView>
        </OnboardingCard>
      </View>

      {/* footer */}
      <OnboardingFooter onBack={() => router.back()} onContinue={onContinue} disabledContinue={!isValid} />

      {/* native time picker modal */}
      {Platform.OS === 'android' && showTimePicker && pickerMeal && (
        <DateTimePicker value={pickerDate} mode="time" display="default" onChange={handleNativeTimeChange} textColor="#111827" />
      )}

      {Platform.OS === 'ios' && showTimePicker && pickerMeal && (
        <Modal visible={showTimePicker} transparent animationType="fade" onRequestClose={cancelTimePicker}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <DateTimePicker value={pickerDate} mode="time" display="spinner" onChange={handleNativeTimeChange} style={{ width: '100%' }} textColor="#111827" />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                <TouchableOpacity onPress={cancelTimePicker} style={styles.modalButton}>
                  <AppText variant="ag9" style={{ color: '#6B7280' }}>Cancelar</AppText>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmTimePicker} style={[styles.modalButton, { marginLeft: 12 }]}>
                  <AppText variant="ag9" style={{ color: '#2FCCAC' }}>Aceptar</AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
