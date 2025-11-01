import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SHeader from '../sections/SHeader';
import AppText from '@/src/shared/ui/components/Typography';
import { useRouter } from 'expo-router';
import { COLORS, s, cardShadow } from '../tokens';

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SHeader
        title="Política de Privacidad"
        subtitle="Última actualización: Octubre 2025"
        onBack={() => router.replace({ pathname: '/profile' } as any)}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* green info box - ensure cardShadow applied first so background color wins on iOS */}
        <View style={[cardShadow(false), styles.infoBox]}>
          <AppText variant="ag7" color={COLORS.text} style={styles.infoTitle}>Tu privacidad es importante para nosotros.</AppText>
          <AppText variant="ag10" color={COLORS.subtext} style={styles.infoText}>
            Trabajamos constantemente para asegurar que tus datos estén protegidos y que tengas control total sobre tu información.
          </AppText>
        </View>

        <View style={[styles.card, cardShadow(true)]}>
          <AppText variant="ag7" color={COLORS.text} style={styles.h3}>1. Introducción</AppText>
          <AppText variant="ag10" color={COLORS.subtext} style={styles.p}>
            En Foodlytics, respetamos tu privacidad y nos comprometemos a proteger tus datos personales. Esta política explica cómo recopilamos, usamos y protegemos tu información.
          </AppText>

          <AppText variant="ag7" color={COLORS.text} style={styles.h3}>2. Información que Recopilamos</AppText>
          <AppText variant="ag10" color={COLORS.subtext} style={styles.p}>
            Recopilamos los siguientes tipos de información:
          </AppText>
          <View style={styles.list}>
            <AppText variant="ag10" color={COLORS.subtext} style={styles.listItem}><AppText variant="ag10" color={COLORS.subtext} style={styles.bold}>Datos de perfil:</AppText> Nombre, correo electrónico, edad, género, altura y peso</AppText>
            <AppText variant="ag10" color={COLORS.subtext} style={styles.listItem}><AppText variant="ag10" color={COLORS.subtext} style={styles.bold}>Datos de salud:</AppText> IMC, peso objetivo, nivel de actividad física</AppText>
            <AppText variant="ag10" color={COLORS.subtext} style={styles.listItem}><AppText variant="ag10" color={COLORS.subtext} style={styles.bold}>Datos de uso:</AppText> Registros de comidas, actividades físicas, progreso de metas</AppText>
            <AppText variant="ag10" color={COLORS.subtext} style={styles.listItem}><AppText variant="ag10" color={COLORS.subtext} style={styles.bold}>Preferencias:</AppText> Configuración de notificaciones, idioma</AppText>
          </View>

          <AppText variant="ag7" color={COLORS.text} style={styles.h3}>3. Cómo Usamos tu Información</AppText>
          <AppText variant="ag10" color={COLORS.subtext} style={styles.p}>
            Utilizamos tu información para:
          </AppText>
          <View style={styles.listSimple}>
            <AppText variant="ag10" color={COLORS.subtext} style={styles.listItem}>• Calcular tus necesidades nutricionales personalizadas</AppText>
            <AppText variant="ag10" color={COLORS.subtext} style={styles.listItem}>• Proporcionar recomendaciones basadas en tus objetivos</AppText>
            <AppText variant="ag10" color={COLORS.subtext} style={styles.listItem}>• Hacer seguimiento de tu progreso</AppText>
            <AppText variant="ag10" color={COLORS.subtext} style={styles.listItem}>• Enviar recordatorios y notificaciones (si las activas)</AppText>
          </View>

          <AppText variant="ag7" color={COLORS.text} style={styles.h3}>4. Almacenamiento de Datos</AppText>
          <AppText variant="ag10" color={COLORS.subtext} style={styles.p}>
            Todos tus datos se almacenan localmente en tu dispositivo. Esto significa que:
          </AppText>
          <View style={styles.listSimple}>
            <AppText variant="ag10" color={COLORS.subtext} style={styles.listItem}>• Tus datos permanecen en tu dispositivo</AppText>
            <AppText variant="ag10" color={COLORS.subtext} style={styles.listItem}>• No se envían a servidores externos</AppText>
            <AppText variant="ag10" color={COLORS.subtext} style={styles.listItem}>• Solo tú tienes acceso a tu información</AppText>
            <AppText variant="ag10" color={COLORS.subtext} style={styles.listItem}>• Si borras los datos, perderás tu información</AppText>
          </View>

          <AppText variant="ag7" color={COLORS.text} style={styles.h3}>5. Compartir Información</AppText>
          <AppText variant="ag10" color={COLORS.subtext} style={styles.p}>
            NO compartimos, vendemos ni alquilamos tu información personal a terceros. Tus datos son privados y permanecen bajo tu control exclusivo.
          </AppText>

          <AppText variant="ag7" color={COLORS.text} style={styles.h3}>6. Seguridad de Datos</AppText>
          <AppText variant="ag10" color={COLORS.subtext} style={styles.p}>
            Implementamos medidas de seguridad para proteger tu información, pero ningún método es 100% seguro. Recomendamos mantener tu dispositivo protegido.
          </AppText>

          <AppText variant="ag7" color={COLORS.text} style={styles.h3}>7. Tus Derechos</AppText>
          <AppText variant="ag10" color={COLORS.subtext} style={styles.p}>
            Puedes acceder, modificar, exportar o eliminar tus datos en cualquier momento.
          </AppText>

          <AppText variant="ag7" color={COLORS.text} style={styles.h3}>8. Contacto</AppText>
          <AppText variant="ag10" color={COLORS.subtext} style={styles.p}>
            Si tienes preguntas sobre esta política, por favor contáctanos a través de los canales oficiales de soporte.
          </AppText>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: s(20), paddingTop: s(35), paddingBottom: s(35) },
  infoBox: { backgroundColor: COLORS.successBg, borderRadius: s(12), padding: s(16), marginBottom: s(16) },
  infoTitle: { marginBottom: s(6) },
  infoText: { lineHeight: s(20) },
  card: { backgroundColor: COLORS.card, borderRadius: s(16), padding: s(16), marginBottom: s(24), borderWidth: 1, borderColor: 'rgba(228,228,228,0.6)' },
  h3: { marginTop: s(6), marginBottom: s(8) },
  p: { marginBottom: s(12), lineHeight: s(20) },
  list: { marginLeft: s(6), marginBottom: s(12) },
  listSimple: { marginLeft: s(6), marginBottom: s(12) },
  listItem: { marginBottom: s(8), lineHeight: s(20) },
  bold: { fontWeight: '700' },
});
