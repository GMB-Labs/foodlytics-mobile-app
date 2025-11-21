import React, { useEffect, useState } from "react";
import { View, Pressable } from 'react-native';
import SectionCard from "../components/SectionCard";
import MenuItem from "../components/MenuItem";
import Noti from "@/assets/icons/profile/notiIcon.svg";
import World from "@/assets/icons/profile/mundiIcon.svg";
import Secure from "@/assets/icons/profile/shieldIcon.svg";
import Dark from '@/assets/icons/profile/dark.svg';
import Light from '@/assets/icons/profile/light.svg';
import System from '@/assets/icons/profile/system.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/src/shared/styles/useTheme';
import AppText from '@/src/shared/ui/components/Typography';
import { s } from '../tokens';
import ThemeSelector from '@/src/features/profile/ui/components/ThemeSelector';

const STORAGE_KEY = '@foodlytics:language';

export default React.memo(function Preferences({
  onOpenNotifications, onOpenLanguage, onOpenPrivacy,
}: {
  onOpenNotifications: () => void;
  onOpenLanguage: () => void;
  onOpenPrivacy: () => void;
}) {
  const [langLabel, setLangLabel] = useState('Español');
  const { mode, setMode, colors } = useTheme();

  const leftBgFor = (m: string) => (m === 'light' ? '#2FCCAC' : m === 'dark' ? '#121212' : '#F3F4F6');
  const leftIconColorFor = (m: string) => (m === 'light' ? '#FFFFFF' : m === 'dark' ? '#FFFFFF' : '#4A5565');
  const LeftIcon = mode === 'light' ? Light : mode === 'dark' ? Dark : System;

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw === 'en') setLangLabel('English');
        else setLangLabel('Español');
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  return (
    <>
    <SectionCard title="Preferencias" padded={false}>
    <MenuItem
      icon={(color) => <Noti width={20} height={20} color={color} />}
      title="Notificaciones"
      subtitle="Gestionar recordatorios"
      onPress={onOpenNotifications}
    />

    <MenuItem
      icon={(color) => <World width={20} height={20} color={color} />}
      title="Idioma"
      subtitle={langLabel}
      onPress={onOpenLanguage}
    />

    <View style={{ paddingHorizontal: s(20), paddingVertical: s(16), borderBottomWidth: 1, borderColor: (colors as any)?.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(12) }}>
        <View style={{ width: s(40), height: s(40), borderRadius: s(20), backgroundColor: leftBgFor(mode), alignItems: 'center', justifyContent: 'center' }}>
          <LeftIcon width={20} height={20} color={leftIconColorFor(mode)} />
        </View>
        <View>
          <AppText variant="ag9" color={colors.text}>Tema</AppText>
          <AppText variant="ag10" color={colors.muted}>{mode === 'dark' ? 'Oscuro' : mode === 'light' ? 'Claro' : 'Sistema'}</AppText>
        </View>
      </View>

      <ThemeSelector value={mode as any} onChange={(m) => setMode(m as any)} />
    </View>

    <MenuItem
      icon={(color) => <Secure width={20} height={20} color={color} />}
      title="Privacidad"
      onPress={onOpenPrivacy}
    />
    </SectionCard>
    </>
  );
});
