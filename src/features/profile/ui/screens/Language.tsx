import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, FlatList } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SHeader from '../sections/SHeader';
import { s } from '../tokens';
import { useTheme } from '@/src/shared/styles/useTheme';
import { ASYNC_STORAGE_KEYS } from '@/src/shared/constants/storage';

const STORAGE_KEY = ASYNC_STORAGE_KEYS.LANGUAGE;

const LANGS = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { colors, mode } = useTheme();
  // Use colors from theme provider. Keep fallbacks for tokens that might not be present yet.
  const themeColors = colors as any;
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
        style={[
          styles.cardRow,
          isActive
            ? [
                styles.cardRowActive,
                {
                  backgroundColor: mode === 'light' ? 'rgba(47,204,172,0.06)' : themeColors.chipBg ?? '#F8FAFC',
                  borderColor: themeColors.brandA ?? '#2FCCAC',
                },
              ]
            : [styles.cardRowIdle, { backgroundColor: themeColors.mealsCard ?? '#FFFFFF', borderColor: themeColors.border ?? '#F3F4F6' }],
        ]}
        android_ripple={{ color: '#00000010' }}
        onPress={() => {
          setSelected(item.code);
          saveAndBack(item.code);
        }}
      >
        <View style={styles.leftRow}>
          <View style={styles.flagBox}>
            <AppText variant="ag1" color={themeColors.text ?? '#1A1A1A'} style={{ lineHeight: s(36) }}>{item.code === 'es' ? '🇪🇸' : '🇺🇸'}</AppText>
          </View>
          <View style={{ marginLeft: s(12) }}>
            <AppText variant="ag7" color={themeColors.text}>{item.label}</AppText>
            <AppText variant="ag10" color={themeColors.mutetext ?? themeColors.subtext ?? '#6A7282'}>{item.label}</AppText>
          </View>
        </View>

        {isActive ? (
          <View style={[styles.checkOuter, { backgroundColor: themeColors.brandA ?? '#2FCCAC' }]}>
            <View style={[styles.checkInner, { backgroundColor: themeColors.white ?? '#FFFFFF' }]} />
          </View>
        ) : null}
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.bg }]}>
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

          <View style={[styles.noteBox, { backgroundColor: themeColors.infoCardBg}]}>
            <AppText variant="ag9" color={themeColors.textinfo} style={{ fontWeight: '700' }}>Nota: </AppText>
            <AppText variant="ag10" color={themeColors.textinfo} style={{ marginTop: s(6) }}>
              Actualmente la aplicación está disponible en Español. El soporte para inglés estará disponible en futuras actualizaciones.
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: s(24), paddingTop: s(16) },
  listWrap: { },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: s(16), borderRadius: s(16), height: s(92) },
  cardRowActive: { borderWidth: 2 },
  cardRowIdle: { borderWidth: 2 },
  leftRow: { flexDirection: 'row', alignItems: 'center' },
  flagBox: { width: s(40), alignItems: 'center', justifyContent: 'center' },
  checkOuter: { width: s(32), height: s(32), borderRadius: s(16), alignItems: 'center', justifyContent: 'center' },
  checkInner: { width: s(20), height: s(20), borderRadius: s(10) },
  noteBox: { marginTop: s(12), backgroundColor: '#EBF7FF', padding: s(16), borderRadius: s(12) },
});
