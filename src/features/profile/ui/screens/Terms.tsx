import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SHeader from '../sections/SHeader';
import AppText from '@/src/shared/ui/components/Typography';
import { useRouter } from 'expo-router';
import { COLORS, s, cardShadow } from '../tokens';

export default function Terms() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SHeader
        title="Términos y Condiciones"
        subtitle="Última actualización: Octubre 2025"
        onBack={() => router.replace({ pathname: '/profile' } as any)}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* apply shadow first so infoBox backgroundColor overrides the shadow's default background on iOS */}
        <View style={[cardShadow(false), styles.infoBox]}>
          <AppText variant="ag10" color={COLORS.subtext} style={styles.infoText}>
            Al continuar usando Foodlytics, confirmas que has leído, entendido y aceptado estos términos y condiciones.
          </AppText>
        </View>

        <View style={[styles.card, cardShadow(true)]}>
          <AppText variant="ag7" color={COLORS.text} style={styles.h3}>1. Aceptación de Términos</AppText>
          <AppText variant="ag10" color={COLORS.subtext} style={styles.p}>
            Al utilizar Foodlytics, aceptas estos términos y condiciones. Si no estás de acuerdo con alguna parte de estos términos, no debes usar la aplicación.
          </AppText>

          <AppText variant="ag7" color={COLORS.text} style={styles.h3}>2. Propósito de la Aplicación</AppText>
          <AppText variant="ag10" color={COLORS.subtext} style={styles.p}>
            Foodlytics es una herramienta de seguimiento nutricional y de actividad física diseñada para:
          </AppText>
          <View style={styles.list}>
            <AppText variant="ag10" color={COLORS.subtext} style={styles.listItem}>• Registrar y monitorear la ingesta de alimentos</AppText>
            <AppText variant="ag10" color={COLORS.subtext} style={styles.listItem}>• Calcular macronutrientes y calorías</AppText>
            <AppText variant="ag10" color={COLORS.subtext} style={styles.listItem}>• Seguir la actividad física y peso</AppText>
            <AppText variant="ag10" color={COLORS.subtext} style={styles.listItem}>• Proporcionar información nutricional general</AppText>
          </View>

          <AppText variant="ag7" color={COLORS.text} style={styles.h3}>3. No es Asesoramiento Médico</AppText>
          <AppText variant="ag10" color={COLORS.subtext} style={styles.p}>
            <AppText variant="ag10" color={COLORS.subtext} style={styles.bold}>IMPORTANTE: </AppText>
            Foodlytics NO proporciona asesoramiento médico, diagnóstico o tratamiento. La información y las recomendaciones proporcionadas son solo para fines informativos y educativos. Siempre consulta con un profesional de la salud calificado antes de hacer cambios significativos en tu dieta o rutina de ejercicios.
          </AppText>

          <AppText variant="ag7" color={COLORS.text} style={styles.h3}>4. Precisión de la Información</AppText>
          <AppText variant="ag10" color={COLORS.subtext} style={styles.p}>
            Si bien nos esforzamos por proporcionar información nutricional precisa, no garantizamos la exactitud absoluta de los datos. Los valores nutricionales pueden variar según la marca, preparación y porción de los alimentos.
          </AppText>

          <AppText variant="ag7" color={COLORS.text} style={styles.h3}>5. Uso de Datos Personales</AppText>
          <AppText variant="ag10" color={COLORS.subtext} style={styles.p}>
            Los datos que proporcionas (edad, peso, altura, género, actividad física) se utilizan para calcular necesidades nutricionales y personalizar recomendaciones. Tus datos se almacenan localmente y no se comparten sin tu consentimiento.
          </AppText>

          <AppText variant="ag7" color={COLORS.text} style={styles.h3}>6. Limitación de Responsabilidad</AppText>
          <AppText variant="ag10" color={COLORS.subtext} style={styles.p}>
            Foodlytics y sus desarrolladores no se hacen responsables de cualquier daño, lesión o pérdida que pueda resultar del uso de la aplicación.
          </AppText>

          <AppText variant="ag7" color={COLORS.text} style={styles.h3}>7. Condiciones de Salud Específicas</AppText>
          <AppText variant="ag10" color={COLORS.subtext} style={styles.p}>
            Si tienes condiciones médicas específicas, consulta con un profesional de la salud antes de usar la aplicación para guiar tus decisiones nutricionales.
          </AppText>

          <AppText variant="ag7" color={COLORS.text} style={styles.h3}>8. Menores de Edad</AppText>
          <AppText variant="ag10" color={COLORS.subtext} style={styles.p}>
            Esta aplicación está diseñada para adultos mayores de 18 años. Los menores deben usarla bajo supervisión de un adulto responsable.
          </AppText>

          <AppText variant="ag7" color={COLORS.text} style={styles.h3}>9. Cambios en los Términos</AppText>
          <AppText variant="ag10" color={COLORS.subtext} style={styles.p}>
            Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso continuado de la aplicación constituye tu aceptación de los nuevos términos.
          </AppText>

          <AppText variant="ag7" color={COLORS.text} style={styles.h3}>10. Contacto</AppText>
          <AppText variant="ag10" color={COLORS.subtext} style={styles.p}>
            Si tienes preguntas sobre estos términos, por favor contáctanos a través de los canales oficiales de soporte de la aplicación.
          </AppText>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: s(20), paddingTop: s(30), paddingBottom: s(20) },
  infoBox: { backgroundColor: '#EFF6FF', borderRadius: s(12), padding: s(16), marginBottom: s(16) },
  infoText: { lineHeight: s(20) },
  card: { backgroundColor: COLORS.card, borderRadius: s(16), padding: s(16), marginBottom: s(24), borderWidth: 1, borderColor: 'rgba(228,228,228,0.6)' },
  h3: { marginTop: s(6), marginBottom: s(8) },
  p: { marginBottom: s(12), lineHeight: s(20) },
  list: { marginLeft: s(8), marginBottom: s(12) },
  listItem: { marginBottom: s(6), lineHeight: s(20) },
  bold: { fontWeight: '700' },
});
