import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, FlatList } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SHeader from '../sections/SHeader';
import { COLORS, s, cardShadow } from '../tokens';

const STORAGE_KEY = '@foodlytics:language';

const LANGS = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>('es');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setSelected(raw);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function saveAndBack(code: string) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, code);
    } catch (e) {
      // ignore
    }
    // Navigate back to profile and include a timestamp param so Profile can refresh Preferences
    router.replace({ pathname: "/profile", params: { langUpdated: String(Date.now()) } } as any);
  }

  function renderItem({ item }: { item: typeof LANGS[0] }) {
    const isActive = item.code === selected;
    return (
      <Pressable
        style={[styles.cardRow, isActive ? styles.cardRowActive : styles.cardRowIdle]}
        android_ripple={{ color: '#00000010' }}
        onPress={() => {
          setSelected(item.code);
          saveAndBack(item.code);
        }}
      >
        <View style={styles.leftRow}>
          <View style={styles.flagBox}>
            <AppText variant="ag1" color={COLORS.text} style={{ lineHeight: s(36) }}>{item.code === 'es' ? '🇪🇸' : '🇺🇸'}</AppText>
          </View>
          <View style={{ marginLeft: s(12) }}>
            <AppText variant="ag7" color={COLORS.text}>{item.label}</AppText>
            <AppText variant="ag10" color={COLORS.mutetext}>{item.label}</AppText>
          </View>
        </View>

        {isActive ? (
          <View style={styles.checkOuter}>
            <View style={styles.checkInner} />
          </View>
        ) : null}
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
     <SHeader
        title="Idioma"
        subtitle="Selecciona tu idioma preferido"
        onBack={() => router.replace({ pathname: "/profile" } as any)}
     />
      <View style={styles.content}>
        <View style={styles.listWrap}>
          <FlatList
            data={LANGS}
            keyExtractor={(i) => i.code}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: s(12) }} />}
            contentContainerStyle={{ padding: s(4) }}
          />

          <View style={styles.noteBox}>
            <AppText variant="ag9" color={COLORS.text} style={{ fontWeight: '700' }}>Nota: </AppText>
            <AppText variant="ag10" color={COLORS.text} style={{ marginTop: s(6) }}>
              Actualmente la aplicación está disponible en Español. El soporte para inglés estará disponible en futuras actualizaciones.
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: s(24), paddingTop: s(16) },
  listWrap: { },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: s(16), borderRadius: s(16), height: s(92) },
  cardRowActive: { backgroundColor: 'rgba(47,204,172,0.06)', borderWidth: 2, borderColor: COLORS.brandA },
  cardRowIdle: { backgroundColor: COLORS.card, borderWidth: 2, borderColor: '#F3F4F6' },
  leftRow: { flexDirection: 'row', alignItems: 'center' },
  flagBox: { width: s(40), alignItems: 'center', justifyContent: 'center' },
  checkOuter: { width: s(32), height: s(32), borderRadius: s(16), backgroundColor: COLORS.brandA, alignItems: 'center', justifyContent: 'center' },
  checkInner: { width: s(20), height: s(20), borderRadius: s(10), backgroundColor: '#FFFFFF' },
  noteBox: { marginTop: s(12), backgroundColor: '#EBF7FF', padding: s(16), borderRadius: s(12) },
});
