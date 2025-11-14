import React from "react";
import { View, Modal, Pressable } from "react-native";
import AppText from "@/src/shared/ui/components/Typography";

type Props = {
  visible: boolean;
  targetName?: string | undefined;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteConfirmationModal({ visible, targetName, onCancel, onConfirm }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <View style={{ width: '100%', maxWidth: 420, backgroundColor: 'white', borderRadius: 12, padding: 16 }}>
          <AppText variant="ag6" style={{ marginBottom: 8 }}>Eliminar elemento</AppText>
          <AppText variant="ag9" style={{ color: '#6B7280', marginBottom: 12 }}>
            ¿Estás seguro que quieres eliminar{' '}
            <AppText variant="ag9" style={{ fontFamily: 'Poppins-Bold', color: '#6B7280' }}>{targetName}</AppText>
            ? Esta acción quitará el alimento de la detección.
          </AppText>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Pressable style={{ paddingHorizontal: 12, paddingVertical: 8 }} onPress={onCancel}>
              <AppText variant="ag9" style={{ color: '#6B7280' }}>Cancelar</AppText>
            </Pressable>
            <Pressable style={{ paddingHorizontal: 12, paddingVertical: 8, marginLeft: 12 }} onPress={onConfirm}>
              <AppText variant="ag9" style={{ color: '#EF4444' }}>Eliminar</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
