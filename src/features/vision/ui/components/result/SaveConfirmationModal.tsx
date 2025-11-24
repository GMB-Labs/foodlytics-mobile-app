import React from "react";
import { View, Modal, ScrollView, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import AppText from "@/src/shared/ui/components/Typography";
import type { DetectedItem } from "@/src/features/vision/domain/detection";
import { useTheme } from '@/src/shared/styles/useTheme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  saving?: boolean;
  items: DetectedItem[];
  quantities: Record<number, number>;
};

export default function SaveConfirmationModal({ visible, onClose, onConfirm, saving, items, quantities }: Props) {
  const { colors } = useTheme();
  const theme = colors as any;
  const styles = createStyles(theme);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <AppText variant="ag6" style={styles.heading}>¿Confirmar guardado?</AppText>
          <AppText variant="ag9" style={styles.bodyText}>
            Una vez guardada, la comida no podrá ser editada ni borrada. ¿Deseas continuar?
          </AppText>

          <View style={styles.listWrapper}>
            <ScrollView>
              {items.map((it, i) => (
                <View key={i} style={styles.itemRow}>
                  <AppText variant="ag9" style={[styles.itemName, { color: theme.text }]}>{it.name}</AppText>
                  <AppText variant="ag9" style={[styles.itemQty, { color: theme.subtext }]}>{quantities[i] ?? it.qty} {it.unit}</AppText>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.actionsRow}>
            <Pressable style={styles.actionBtn} onPress={onClose}>
              <AppText variant="ag9" style={styles.actionCancel}>Cancelar</AppText>
            </Pressable>
            <Pressable style={[styles.actionBtn, styles.actionPrimary]} onPress={onConfirm} disabled={saving}>
              {saving ? <ActivityIndicator color={theme.brandB ?? '#2FCCAC'} /> : <AppText variant="ag9" style={styles.actionConfirm}>Confirmar</AppText>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(themeColors: any) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: themeColors.surfaceOverlay ?? 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    card: { width: '100%', maxWidth: 420, backgroundColor: themeColors.mealsCard ?? 'white', borderRadius: 12, padding: 16 },
    heading: { marginBottom: 8, color: themeColors.text ?? '#111827' },
    bodyText: { color: themeColors.subtext ?? '#6B7280', marginBottom: 12 },
    listWrapper: { maxHeight: 220 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
    itemName: {},
    itemQty: {},
    actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
    actionBtn: { paddingHorizontal: 12, paddingVertical: 8 },
    actionCancel: { color: themeColors.subtext ?? '#6B7280' },
    actionPrimary: { marginLeft: 12 },
    actionConfirm: { color: themeColors.brandB ?? '#2FCCAC' },
  });
}
