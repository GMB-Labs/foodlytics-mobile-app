import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import { COLORS, s } from '../tokens';

export default function EditAction({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.container} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <View style={styles.inner}>
        <AppText variant="ag9" color={COLORS.brandA}>Editar</AppText>
        <AppText variant="ag9" color={COLORS.brandA} style={styles.chev}>›</AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: s(4), paddingVertical: s(2) },
  inner: { flexDirection: 'row', alignItems: 'center', gap: s(6) },
  chev: { marginLeft: s(4) },
});
