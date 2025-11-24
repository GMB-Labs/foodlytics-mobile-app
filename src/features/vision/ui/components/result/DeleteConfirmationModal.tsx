import React from "react";
import { View, Modal, Pressable, StyleSheet } from "react-native";
import AppText from "@/src/shared/ui/components/Typography";
import { useTheme } from '@/src/shared/styles/useTheme';

type Props = {
  visible: boolean;
  targetName?: string | undefined;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteConfirmationModal({ visible, targetName, onCancel, onConfirm }: Props) {
  const { colors } = useTheme();
  const theme = colors as any;
  const styles = createStyles(theme);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <AppText variant="ag6" style={styles.heading}>Eliminar elemento</AppText>
          <AppText variant="ag9" style={styles.bodyText}>
            ¿Estás seguro que quieres eliminar{' '}
            <AppText variant="ag9" style={styles.boldName}>{targetName}</AppText>
            ? Esta acción quitará el alimento de la detección.
          </AppText>
          <View style={styles.actionsRow}>
            <Pressable style={styles.actionBtn} onPress={onCancel}>
              <AppText variant="ag9" style={styles.actionCancel}>Cancelar</AppText>
            </Pressable>
            <Pressable style={[styles.actionBtn, styles.actionDangerBtn]} onPress={onConfirm}>
              <AppText variant="ag9" style={styles.actionDanger}>Eliminar</AppText>
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
    boldName: { fontFamily: 'Poppins-Bold', color: themeColors.subtext ?? '#6B7280' },
    actionsRow: { flexDirection: 'row', justifyContent: 'flex-end' },
    actionBtn: { paddingHorizontal: 12, paddingVertical: 8 },
    actionCancel: { color: themeColors.subtext ?? '#6B7280' },
    actionDangerBtn: { marginLeft: 12 },
    actionDanger: { color: themeColors.danger ?? '#EF4444' },
  });
}
