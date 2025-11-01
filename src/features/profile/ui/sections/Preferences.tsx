import React, { useEffect, useState } from "react";
import SectionCard from "../pieces/SectionCard";
import MenuItem from "../pieces/MenuItem";
import Noti from "@/assets/icons/profile/notiIcon.svg";
import World from "@/assets/icons/profile/mundiIcon.svg";
import Secure from "@/assets/icons/profile/shieldIcon.svg";
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@foodlytics:language';

export default React.memo(function Preferences({
  onOpenNotifications, onOpenLanguage, onOpenPrivacy,
}: {
  onOpenNotifications: () => void;
  onOpenLanguage: () => void;
  onOpenPrivacy: () => void;
}) {
  const [langLabel, setLangLabel] = useState('Español');

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

    <MenuItem
      icon={(color) => <Secure width={20} height={20} color={color} />}
      title="Privacidad"
      onPress={onOpenPrivacy}
    />
    </SectionCard>
  );
});
