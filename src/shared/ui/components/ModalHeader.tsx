import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';

type Props = {
  title: string;
  onClose?: () => void;
};

export default function ModalHeader({ title, onClose }: Props) {
  const router = useRouter();
  const params = useLocalSearchParams() as any;

  const handleClose = () => {
    if (typeof onClose === 'function') return onClose();
    const from = params?.from as string | undefined;
    if (from) router.replace((from as unknown) as any);
    else router.replace('/(tabs)');
  };

  return (
    <LinearGradient colors={['#2FCCAC', '#24A88C']} style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Pressable onPress={handleClose} hitSlop={8}>
          <View style={styles.closeIcon}>
            <Text style={styles.closeIconText}>×</Text>
          </View>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 120,
    paddingTop: 64,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 32,
  },
  headerTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 24,
    color: '#FFFFFF',
  },
  closeIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIconText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: Platform.OS === 'ios' ? -4 : -10,
  },
});
