import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import SHeader from '../sections/SHeader';
import AppText from '@/src/shared/ui/components/Typography';
import { useRouter } from 'expo-router';
import DataIcon from '@/assets/icons/profile/dataIcon.svg';
import DeleteIcon from '@/assets/icons/profile/deleteIcon.svg';
import ShieldIcon from '@/assets/icons/profile/escuIcon.svg';
import EyesIcon from '@/assets/icons/profile/eyesIcon.svg';
import SecureIcon from '@/assets/icons/profile/secureIcon.svg';
import { COLORS, s, cardShadow } from '../tokens';

export default function Privacy() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SHeader
        title="Privacidad"
        subtitle="Controla tu información personal"
        onBack={() => router.replace({ pathname: "/profile" } as any)}
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={[styles.card, cardShadow(true)]}>
          <View style={styles.rowTop}>
            <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
              <EyesIcon width={20} height={20} />
            </View>
            <AppText variant="ag7" color={COLORS.text} style={styles.cardTitle}>Uso de Datos</AppText>
          </View>
          <AppText variant="ag9" color={COLORS.subtext} style={styles.cardDesc}>Tus datos se utilizan exclusivamente para:</AppText>
          <View style={styles.list}>
            <View style={styles.listItem}><AppText variant="ag9" color={COLORS.brandA}>•</AppText><AppText variant="ag9" color={COLORS.subtext} style={styles.listText}>Calcular tus necesidades nutricionales</AppText></View>
            <View style={styles.listItem}><AppText variant="ag9" color={COLORS.brandA}>•</AppText><AppText variant="ag9" color={COLORS.subtext} style={styles.listText}>Proporcionar recomendaciones personalizadas</AppText></View>
            <View style={styles.listItem}><AppText variant="ag9" color={COLORS.brandA}>•</AppText><AppText variant="ag9" color={COLORS.subtext} style={styles.listText}>Hacer seguimiento de tu progreso</AppText></View>
            <View style={styles.listItem}><AppText variant="ag9" color={COLORS.brandA}>•</AppText><AppText variant="ag9" color={COLORS.subtext} style={styles.listText}>Mejorar la precisión de nuestros servicios</AppText></View>
          </View>
        </View>
        <View style={[styles.card, cardShadow(true)]}>
          <View style={styles.rowTop}>
            <View style={[styles.iconCircle, { backgroundColor: '#D8D8D8' }]}>
              <DataIcon width={20} height={20} />
            </View>
            <AppText variant="ag7" color={COLORS.text} style={styles.cardTitle}>Recopilación de Datos</AppText>
          </View>
          <AppText variant="ag9" color={COLORS.subtext} style={styles.cardDesc}>
            FoodLytics recopila información para proporcionarte una experiencia personalizada:
          </AppText>
          <View style={styles.list}>
            <View style={styles.listItem}><AppText variant="ag9" color={COLORS.brandA}>•</AppText><AppText variant="ag9" color={COLORS.subtext} style={styles.listText}>Datos personales (edad, peso, altura, género)</AppText></View>
            <View style={styles.listItem}><AppText variant="ag9" color={COLORS.brandA}>•</AppText><AppText variant="ag9" color={COLORS.subtext} style={styles.listText}>Registros de comidas y actividad física</AppText></View>
            <View style={styles.listItem}><AppText variant="ag9" color={COLORS.brandA}>•</AppText><AppText variant="ag9" color={COLORS.subtext} style={styles.listText}>Preferencias y configuraciones</AppText></View>
          </View>
        </View>
        <View style={[styles.card, cardShadow(true)]}>
          <View style={styles.rowTop}>
            <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
              <SecureIcon width={20} height={20} />
            </View>
            <AppText variant="ag7" color={COLORS.text} style={styles.cardTitle}>Seguridad de Datos</AppText>
          </View>
          <AppText variant="ag9" color={COLORS.subtext} style={styles.cardDesc}>
            Tus datos se almacenan localmente en tu dispositivo y están protegidos. No compartimos tu información personal con terceros sin tu consentimiento explícito.
          </AppText>
        </View>

        <View style={[styles.card, cardShadow(true)]}>
          <View style={styles.rowTop}>
            <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
              <ShieldIcon width={20} height={20} />
            </View>
            <AppText variant="ag7" color={COLORS.text} style={styles.cardTitle}>Control de Datos</AppText>
          </View>

          <View style={{ height: s(12) }} />
          <Pressable style={styles.actionButton} android_ripple={{ color: '#00000010' }}>
            <DataIcon width={16} height={16} />
            <AppText variant="ag9" color={COLORS.text} style={styles.actionText}>Exportar mis datos</AppText>
          </Pressable>

          <View style={{ height: s(10) }} />
          <Pressable style={styles.deleteButton} android_ripple={{ color: '#00000010' }}>
            <DeleteIcon width={16} height={16} />
            <AppText variant="ag9" color="#FB2C36" style={styles.actionText}>Eliminar todos mis datos</AppText>
          </Pressable>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  // add extra top padding so the first card is fully visible under the gradient header
  scroll: { paddingHorizontal: s(24), paddingTop: s(50), paddingBottom: s(60) },
  card: { backgroundColor: COLORS.card, borderRadius: s(16), padding: s(16), marginBottom: s(18), borderWidth: 1, borderColor: 'rgba(228,228,228,0.6)' },
  // remove negative floating margin so cards start below the header
  cardFloating: { marginTop: s(20) },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: s(12), marginBottom: s(8) },
  iconCircle: { width: s(40), height: s(40), borderRadius: s(20), alignItems: 'center', justifyContent: 'center' },
  cardTitle: { marginLeft: s(8) },
  cardDesc: { marginBottom: s(8) },
  list: { marginTop: s(6) },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: s(8), marginBottom: s(8) },
  listText: { marginLeft: s(6), flex: 1 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: s(12), backgroundColor: '#FFFFFF', borderRadius: s(12), padding: s(12), borderWidth: 1, borderColor: 'rgba(228,228,228,0.6)' },
  deleteButton: { flexDirection: 'row', alignItems: 'center', gap: s(12), backgroundColor: '#FFF5F5', borderRadius: s(12), padding: s(12), borderWidth: 1, borderColor: '#FFC9C9' },
  actionText: { marginLeft: s(8) },
});

