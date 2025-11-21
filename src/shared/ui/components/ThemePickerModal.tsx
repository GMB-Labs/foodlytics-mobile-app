import React from 'react';
import { Modal, View, Pressable, StyleSheet } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import { s } from '@/src/features/profile/ui/tokens';
import { useTheme } from '@/src/shared/styles/useTheme';

export default function ThemePickerModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { mode, setMode, colors } = useTheme();

  const options: { key: 'system' | 'light' | 'dark'; label: string }[] = [
    { key: 'system', label: 'Sistema (recomendado)' },
    { key: 'light', label: 'Claro' },
    { key: 'dark', label: 'Oscuro' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: '#00000066' }]}> 
        <Pressable style={styles.container} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <AppText variant="ag7" color={colors.text}>Tema</AppText>
          {options.map((o) => {
            const selected = mode === o.key;
            return (
              <Pressable
                key={o.key}
                onPress={() => {
                  setMode(o.key);
                  onClose();
                }}
                style={styles.row}
              >
                <View style={[styles.radioOuter, { borderColor: colors.border }]}>
                  {selected ? <View style={[styles.radioInner, { backgroundColor: colors.brandA }]} /> : null}
                </View>
                <AppText variant="ag9" color={colors.text}>{o.label}</AppText>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  container: { flex: 1 },
  sheet: { padding: s(20), borderTopLeftRadius: s(16), borderTopRightRadius: s(16) },
  row: { flexDirection: 'row', alignItems: 'center', gap: s(12), paddingVertical: s(12) },
  radioOuter: { width: s(20), height: s(20), borderRadius: s(10), borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: s(12) },
  radioInner: { width: s(10), height: s(10), borderRadius: s(5) },
});
