import React from "react";
import { View, Modal, Pressable } from "react-native";
import AppText from "@/src/shared/ui/components/Typography";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function CloseConfirmationModal({ visible, onClose, onConfirm }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <View style={{ width: '100%', maxWidth: 420, backgroundColor: 'white', borderRadius: 12, padding: 16 }}>
          <AppText variant="ag6" style={{ marginBottom: 8 }}>¿No quieres subir la comida?</AppText>
          <AppText variant="ag9" style={{ color: '#6B7280', marginBottom: 12 }}>
            Si sales ahora, los datos detectados no se guardarán. ¿Deseas salir?
          </AppText>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Pressable style={{ paddingHorizontal: 12, paddingVertical: 8 }} onPress={onClose}>
              <AppText variant="ag9" style={{ color: '#6B7280' }}>Volver</AppText>
            </Pressable>
            <Pressable style={{ paddingHorizontal: 12, paddingVertical: 8, marginLeft: 12 }} onPress={onConfirm}>
              <AppText variant="ag9" style={{ color: '#EF4444' }}>Salir</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
