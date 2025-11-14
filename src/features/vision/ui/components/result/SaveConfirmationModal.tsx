import React from "react";
import { View, Modal, ScrollView, Pressable, ActivityIndicator } from "react-native";
import AppText from "@/src/shared/ui/components/Typography";
import type { DetectedItem } from "@/src/features/vision/domain/detection";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  saving?: boolean;
  items: DetectedItem[];
  quantities: Record<number, number>;
};

export default function SaveConfirmationModal({ visible, onClose, onConfirm, saving, items, quantities }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <View style={{ width: '100%', maxWidth: 420, backgroundColor: 'white', borderRadius: 12, padding: 16 }}>
          <AppText variant="ag6" style={{ marginBottom: 8 }}>¿Confirmar guardado?</AppText>
          <AppText variant="ag9" style={{ color: '#6B7280', marginBottom: 12 }}>
            Una vez guardada, la comida no podrá ser editada ni borrada. ¿Deseas continuar?
          </AppText>

          <View style={{ maxHeight: 220 }}>
            <ScrollView>
              {items.map((it, i) => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                  <AppText variant="ag9">{it.name}</AppText>
                  <AppText variant="ag9">{quantities[i] ?? it.qty} {it.unit}</AppText>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
            <Pressable style={{ paddingHorizontal: 12, paddingVertical: 8 }} onPress={onClose}>
              <AppText variant="ag9" style={{ color: '#6B7280' }}>Cancelar</AppText>
            </Pressable>
            <Pressable style={{ paddingHorizontal: 12, paddingVertical: 8, marginLeft: 12 }} onPress={onConfirm} disabled={saving}>
              {saving ? <ActivityIndicator color="#2FCCAC" /> : <AppText variant="ag9" style={{ color: '#2FCCAC' }}>Confirmar</AppText>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
