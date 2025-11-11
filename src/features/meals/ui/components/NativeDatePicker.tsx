import React, { useState } from 'react';
import { Modal, View, Platform, Pressable, StyleSheet, Text } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import AppText from '@/src/shared/ui/components/Typography';

interface NativeDatePickerProps {
  visible: boolean;
  value: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  onClose: () => void;
  onChange: (date: Date) => void;
}

export default function NativeDatePicker({ visible, value, minimumDate, maximumDate, onClose, onChange }: NativeDatePickerProps) {
  const [showAndroid, setShowAndroid] = useState(visible && Platform.OS === 'android');

  // Keep local visibility in sync (when parent toggles visible)
  React.useEffect(() => {
    if (Platform.OS === 'android') {
      setShowAndroid(visible);
    }
  }, [visible]);

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowAndroid(false);
      onClose();
      if (selected) onChange(selected);
    } else {
      // iOS: update immediately for inline calendar mode
      if (selected) onChange(selected);
    }
  };

  if (Platform.OS === 'android') {
    return showAndroid ? (
      <DateTimePicker
        value={value}
        mode="date"
        display="calendar"
        onChange={handleChange}
        maximumDate={maximumDate}
        minimumDate={minimumDate}
      />
    ) : null;
  }

  // iOS: render a modal with inline calendar picker
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          <DateTimePicker
            value={value}
            mode="date"
            display="inline"
            onChange={handleChange}
            maximumDate={maximumDate}
            minimumDate={minimumDate}
            style={styles.picker}
            themeVariant="light"
            accentColor="#2FCCAC"
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 12 }}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
            <Pressable style={styles.confirmButton} onPress={onClose}>
              <Text style={styles.confirmButtonText}>Aceptar</Text>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    width: '100%',
    maxWidth: 420,
  },
  picker: {
    width: '100%',
    height: 320, // Fixed height for inline calendar
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#6B7280',
  },
  confirmButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  confirmButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#2FCCAC',
  },
});
