import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import DatePicker from '@amjed-bouhouch/react-native-ui-datepicker';
import dayjs, { Dayjs } from 'dayjs';
import { useTheme } from '@/src/shared/styles/useTheme';
import AppText from '@/src/shared/ui/components/Typography';

interface Props {
  visible: boolean;
  value: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  onClose: () => void;
  onChange: (date: Date) => void;
}

export default function NativeDatePicker({
  visible,
  value,
  minimumDate,
  maximumDate,
  onClose,
  onChange,
}: Props) {
  const { colors } = useTheme();
  const [tempDate, setTempDate] = useState<Dayjs>(dayjs(value));

  const handleConfirm = () => {
    onChange(tempDate.toDate());
    onClose();
  };

  const currentYear = new Date().getFullYear();
  const futureYears = Array.from({ length: 50 }, (_, i) => currentYear + 1 + i);


  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.container, { backgroundColor: colors.mealsCard ?? '#FFFFFF' }]}
          onPress={(e) => e.stopPropagation()}
        >

          {/* Calendario */}
          <DatePicker
          
            mode="single"
            date={tempDate}
            onChange={(params) => params.date && setTempDate(dayjs(params.date))}

            minDate={dayjs('1900-01-01')}  // o el año mínimo que quieras
            maxDate={dayjs()}              // hoy → no permite 2026+

            firstDayOfWeek={1}
            selectedItemColor={colors.iconbase}
            calendarTextStyle={{ color: colors.text }}
            selectedTextStyle={{ color: '#FFFFFF' }}
            headerTextStyle={{ color: colors.text }}
            weekDaysTextStyle={{ color: colors.text }}
            todayTextStyle={{ color: colors. brandA }}
            headerButtonColor={colors.iconbase}
            weekDaysContainerStyle={{
              borderBottomColor: colors.border2,
            }}
            // Cajas de MESES
            monthContainerStyle={{
              backgroundColor: colors.mealsCard,   // fondo en light/dark
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border2,
              paddingVertical: 10,
            }}
            // Cajas de AÑOS
            yearContainerStyle={{
              backgroundColor: colors.mealsCard,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              paddingVertical: 10,
            }}
          />

          {/* Botones */}
          <View style={styles.buttonsRow}>
            <Pressable onPress={onClose} style={styles.btn}>
              <AppText style={[styles.btnText, { color: colors.text }]}>
                Cancelar
              </AppText>
            </Pressable>

            <Pressable onPress={handleConfirm} style={styles.btn}>
              <AppText style={[styles.btnText, { color: colors.brandA }]}>
                Aceptar
              </AppText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    padding: 16,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 1,
    gap: 16,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  btnText: {
    fontSize: 16,
  },
});
