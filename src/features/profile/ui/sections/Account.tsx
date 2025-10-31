import React from "react";
import SectionCard from "../pieces/SectionCard";
import MenuItem from "../pieces/MenuItem";
import Password from "@/assets/icons/profile/passwordIcon.svg";
import Terms from "@/assets/icons/profile/termsIcon.svg";
import Shield from "@/assets/icons/profile/shieldIcon.svg";
import Info from "@/assets/icons/profile/infoIcon.svg";

export default React.memo(function Account({
  onOpenPassword, onOpenTerms, onOpenPrivacy,
}: {
  onOpenPassword: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}) {
  return (
    <SectionCard title="Cuenta" padded={false}>
      <MenuItem icon={<Password width={20} height={20} />} title="Cambiar Contraseña" onPress={onOpenPassword} />
      <MenuItem icon={<Terms width={20} height={20} />} title="Términos y Condiciones" onPress={onOpenTerms} />
      <MenuItem icon={<Shield width={20} height={20} />} title="Política de Privacidad" onPress={onOpenPrivacy} />
      <MenuItem icon={<Info width={20} height={20} />} title="Información" subtitle="Foodlytics v1.0.0" showChevron={false} />
    </SectionCard>
  );
});
