import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useOnboarding } from '@/src/features/onboarding/application/OnboardingProvider';
import { useEffect, useState } from 'react';
import { PrimaryGradient } from '@/src/shared/ui/components/Gradients';
import ProgressBar from '@/src/shared/ui/ProgressBar';
import OnboardingCard from '@/src/features/onboarding/ui/OnboardingCard';
import AppText from "@/src/shared/ui/components/Typography";

export default function StepDob() {
  const router = useRouter();
  const [state, actions] = useOnboarding();

  // single Date state drives the carousel (month/day/year wheels)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2005, 3, 4));
  const [error, setError] = useState<string>('');
  const [showAndroidPicker, setShowAndroidPicker] = useState<boolean>(false);

  useEffect(() => {
    if (state.birthDate) {
      const [y, m, d] = state.birthDate.split('-');
      const parsed = new Date(Number(y), Number(m) - 1, Number(d));
      setSelectedDate(parsed);
    }
  }, []);

  const validateDate = () => {
    const d = selectedDate.getDate();
    const m = selectedDate.getMonth() + 1;
    const y = selectedDate.getFullYear();

    if (
      d < 1 || d > 31 || m < 1 || m > 12 || y < new Date().getFullYear() - 100 || y > new Date().getFullYear()
    ) {
      setError('Por favor ingresa una fecha válida.');
      return false;
    }

    const age = new Date().getFullYear() - y;
    if (age < 10 || age > 100) {
      setError('La edad debe estar entre 10 y 100 años.');
      return false;
    }

    setError('');
    actions.setBirthDate(`${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`);
    return true;
  };
  // validate selectedDate without mutating state - used to enable/disable CTA
  function isDateValid(date: Date) {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    if (d < 1 || d > 31 || m < 1 || m > 12) return false;
    if (y < new Date().getFullYear() - 100 || y > new Date().getFullYear()) return false;
    const age = new Date().getFullYear() - y;
    if (age < 16 || age > 100) return false;
    return true;
  }

  // handler from the native DateTimePicker
  const onChange = (event: any, date?: Date | undefined) => {
    // on Android the event may be 'dismissed' or 'set'
    if (Platform.OS === 'android') {
      setShowAndroidPicker(false);
      if (event?.type === 'set' && date) {
        setSelectedDate(date);
        // clear error if new date is valid
        if (isDateValid(date)) setError('');
        else setError('Por favor ingresa una fecha válida.');
      }
    } else if (date) {
      setSelectedDate(date);
      // clear error if new date is valid
      if (isDateValid(date)) setError('');
      else setError('Por favor ingresa una fecha válida.');
    }
  };

  const yearLabel = selectedDate.getFullYear().toString();
  const monthLabel = selectedDate.toLocaleString('default', { month: 'long' });
  const dayLabel = selectedDate.getDate().toString().padStart(2, '0');

  const isValid = isDateValid(selectedDate);

  return (
    <View className="flex-1 bg-[#F3F4F6]">
      {/* Gradient background like Figma */}
      <PrimaryGradient style={{ position: 'absolute', top: 0, left: 0, right: 0 }} height={200} />
      <View className="flex-1">
        {/* Progress Bar (component) */}
        <View className="h-28 px-8 pt-16">
          <ProgressBar step={1} total={8} containerStyle={{ paddingHorizontal: 32 }} />
        </View>

        {/* Content Card */}
        <OnboardingCard paddingHorizontal={32} paddingTop={24}>
          <View className="items-center mb-6">
            {/* pale circle behind icon (Figma) */}
            <View className="w-24 h-24 rounded-full items-center justify-center mb-2" style={{ backgroundColor: '#E6FAF5' }}>
              <Text className="text-5xl">🎂</Text>
            </View>
            <AppText variant="ag3" align="center" color="#111827" /* gray-900 */>
              ¿Cuál es tu fecha de nacimiento?
            </AppText>
            <AppText variant="ag9" align="center" color="#6B7280" /* gray-500 */>
              Necesitamos conocer tu fecha de nacimiento para personalizar tu experiencia
            </AppText>
          </View>

          {/* Inline native spinner carousel */}
<View className="items-center justify-center h-56">
  <View className="w-full max-w-[360px]">
    {Platform.OS === 'android' ? (
      <>
        <TouchableOpacity
          onPress={() => setShowAndroidPicker(true)}
          className="bg-white rounded-lg px-4 py-6 items-center"
          style={{ borderWidth: 1, borderColor: '#E5E7EB' }}
        >
          <View className="flex-row justify-between w-full px-6">
            <Text className="text-gray-400">{monthLabel}</Text>
            <Text className="text-gray-700">{dayLabel}</Text>
            <Text className="text-gray-400">{yearLabel}</Text>
          </View>
        </TouchableOpacity>

        {showAndroidPicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            onChange={onChange}
            maximumDate={new Date()}
            minimumDate={new Date(new Date().getFullYear() - 100, 0, 1)}
            textColor="#374151"
          />
        )}

        {/* helper debajo, mismo bloque */}
        <AppText variant="ag9" color={error ? '#EF4444' : '#6B7280'} style={{ marginTop: 12 }}>
          {error || 'Selecciona una fecha válida'}
        </AppText>
      </>
    ) : (
      // iOS: movemos TODO el bloque (picker + helper) con translateY
      <View style={{ alignItems: 'center', transform: [{ translateY: 40 }] }}>
        <View style={{ overflow: 'hidden', borderRadius: 8 }}>
          <View style={{ width: 340 }}>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={onChange}
              maximumDate={new Date()}
              minimumDate={new Date(new Date().getFullYear() - 100, 0, 1)}
              textColor="#374151"
              style={{ width: 340 }}
            />
          </View>
        </View>

        {/* helper debajo, dentro del mismo wrapper para que baje junto */}
        <AppText variant="ag9" color={error ? '#EF4444' : '#6B7280'} style={{ marginTop: 12 }}>
          {error || 'Selecciona una fecha válida'}
        </AppText>
      </View>
    )}  
    </View>
</View>
        </OnboardingCard>
      </View>

      {/* Footer Continue Button */}
      <View className="absolute left-0 right-0 bottom-10 px-8">
        <TouchableOpacity
          onPress={() => validateDate() && router.push('/onboarding/step-gender')}
          disabled={!isValid}
          style={{ opacity: isValid ? 1 : 0.6 }}
          className={`h-16 rounded-[20px] items-center justify-center ${isValid ? 'bg-[#2FCCAC]' : 'bg-gray-300'}`}
        >
          <Text className="text-white font-poppins-medium">Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
