import React from "react";
import SectionCard from "../pieces/SectionCard";
import MenuItem from "../pieces/MenuItem";
import Noti from "@/assets/icons/profile/notiIcon.svg";
import World from "@/assets/icons/profile/mundiIcon.svg";
import Secure from "@/assets/icons/profile/secureIcon.svg";

export default React.memo(function Preferences({
  onOpenNotifications, onOpenLanguage, onOpenPrivacy,
}: {
  onOpenNotifications: () => void;
  onOpenLanguage: () => void;
  onOpenPrivacy: () => void;
}) {
  return (
    <SectionCard title="Preferencias" padded={false}>
      <MenuItem icon={<Noti width={20} height={20} />} title="Notificaciones" subtitle="Gestionar recordatorios" onPress={onOpenNotifications} />
      <MenuItem icon={<World width={20} height={20} />} title="Idioma" subtitle="Español" onPress={onOpenLanguage} />
      <MenuItem icon={<Secure width={20} height={20} />} title="Privacidad" onPress={onOpenPrivacy} />
    </SectionCard>
  );
});
