import React, { useState } from "react";
import { SafeAreaView, View, StyleSheet, Pressable, ScrollView, Image, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AppText from "@/src/shared/ui/components/Typography";

import Profile from '@/assets/icons/profile-icon.svg';
import ActivityIcon from '@/assets/icons/activity-icon.svg';
import Goals from '@/assets/icons/profile/goalsicon.svg';
import Flecha from '@/assets/icons/flehaIcon.svg';
import Info from '@/assets/icons/profile/infoIcon.svg';
import World from '@/assets/icons/profile/mundiIcon.svg';
import Noti from '@/assets/icons/profile/notiIcon.svg';
import Password from '@/assets/icons/profile/passwordIcon.svg';
import Secure from '@/assets/icons/profile/secureIcon.svg';
import Shield from '@/assets/icons/profile/shieldIcon.svg';
import Terms from '@/assets/icons/profile/termsIcon.svg';
import Logout from '@/assets/icons/profile/logoutIcon.svg';


const mock = {
  name: "Liliana",
  email: "Liliana@gmail.com",
  age: 25,
  gender: "Femenino",
  heightCm: 170,
  weightKg: 68.9,
  bmi: 23.8,
  bmiLabel: "Normal",
  goalWeight: 65,
  activity: "Moderado",
  dailyCalories: 1789,
};

export default function ProfileScreen() {
  const p = mock;
  const [imageUri, setImageUri] = useState<string | null>(null);

  async function pickImage() {
    try {
  // Lazy request for media library permissions and pick an image
  // expo-image-picker may be an optional dependency in some dev environments
  // @ts-ignore
  const ImagePicker = await import('expo-image-picker');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.cancelled) {
        // result.uri is available on managed expo; for newer SDKs the shape may vary
        // @ts-ignore
        setImageUri(result.uri ?? result.assets?.[0]?.uri ?? null);
        // TODO: upload the image to the server / update profile via feature usecase
      }
    } catch (err) {
      // ignore for now
      // console.warn(err);
    }
  }

  return (
    <View style={styles.container}>
      {/* Header with gradient */}
      <LinearGradient
        colors={['#2FCCAC', '#24A88C']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Pressable onPress={pickImage} accessibilityLabel="Cambiar foto" accessibilityRole="imagebutton">
            <View style={[styles.avatarContainer, imageUri ? styles.avatarImageWrap : null]}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.avatarImage} />
              ) : (
                // SVG placeholder icon
                <Profile width={40} height={40} color={'#2FCCAC'} strokeWidth={2.5} />
              )}
            </View>
          </Pressable>
          <View style={styles.userInfo}>
            <AppText variant="ag3" color="white">{p.name}</AppText>
            <AppText variant="ag9" color="rgba(255,255,255,0.9)">{p.email}</AppText>
          </View>
        </View>
      </LinearGradient>

      {/* Scrollable content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Datos Personales Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <AppText variant="ag7" color="#1A1A1A">Datos Personales</AppText>
            <Pressable onPress={() => { /* TODO: open edit profile */ }}>
              <AppText variant="ag9" color="#2FCCAC">Editar</AppText>
            </Pressable>
          </View>
          
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <AppText variant="ag10" color="#4A5565">Edad</AppText>
              <AppText variant="ag6" color="#1A1A1A">{p.age} años</AppText>
            </View>
            <View style={styles.gridItem}>
              <AppText variant="ag10" color="#4A5565">Género</AppText>
              <AppText variant="ag6" color="#1A1A1A">{p.gender}</AppText>
            </View>
            <View style={styles.gridItem}>
              <AppText variant="ag10" color="#4A5565">Altura</AppText>
              <AppText variant="ag6" color="#1A1A1A">{p.heightCm} cm</AppText>
            </View>
            <View style={styles.gridItem}>
              <AppText variant="ag10" color="#4A5565">Peso Actual</AppText>
              <AppText variant="ag6" color="#1A1A1A">{p.weightKg} kg</AppText>
            </View>
          </View>

          {/* IMC Section */}
          <View style={styles.imcContainer}>
            <View style={styles.imcLeft}>
              <AppText variant="ag9" color="#4A5565">IMC Actual</AppText>
              <AppText variant="ag1" color="#2FCCAC">{p.bmi}</AppText>
            </View>
            <View style={styles.imcBadge}>
              <AppText variant="ag9" color="#00C950">{p.bmiLabel}</AppText>
            </View>
          </View>
        </View>

        {/* Objetivos Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <AppText variant="ag7" color="#1A1A1A">Objetivos</AppText>
            <Pressable onPress={() => { /* TODO: open edit goals */ }}>
              <AppText variant="ag9" color="#2FCCAC">Editar</AppText>
            </Pressable>
          </View>
          
          <View style={styles.goalsRow}>
            <View style={styles.goalItem}>
                <View style={styles.goalHeader}>{/* icon + label */}
                  <View style={{ marginRight: 8 }}>
                    <Goals width={16} height={16} />
                  </View>
                  <AppText variant="ag10" color="#4A5565">Peso Objetivo</AppText>
                </View>
              <AppText variant="ag6" color="#1A1A1A">{p.goalWeight} kg</AppText>
            </View>
            <View style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <View style={{ marginRight: 8 }}>
                  <ActivityIcon width={16} height={16} strokeWidth={1.5} />
                </View>
                <AppText variant="ag10" color="#4A5565">Actividad</AppText>
              </View>
              <AppText variant="ag9" color="#1A1A1A">{p.activity}</AppText>
            </View>
          </View>

          <View style={styles.caloriesGoal}>
            <AppText variant="ag10" color="#4A5565">Meta Diaria de Calorías</AppText>
            <AppText variant="ag3" color="#282828">{p.dailyCalories} kcal</AppText>
          </View>
        </View>

        {/* Preferencias Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderSimple}>
            <AppText variant="ag7" color="#1A1A1A">Preferencias</AppText>
          </View>
          
          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIcon}>
                <Noti width={20} height={20} />
              </View>
              <View>
                <AppText variant="ag9" color="#1A1A1A">Notificaciones</AppText>
                <AppText variant="ag10" color="#6A7282">Gestionar recordatorios</AppText>
              </View>
            </View>
            <Flecha width={16} height={16} />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIcon}>
                <World width={20} height={20} />
              </View>
              <View>
                <AppText variant="ag9" color="#1A1A1A">Idioma</AppText>
                <AppText variant="ag10" color="#6A7282">Español</AppText>
              </View>
            </View>
            <Flecha width={16} height={16} />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIcon}>
                <Secure width={20} height={20} />
              </View>
              <AppText variant="ag9" color="#1A1A1A">Privacidad</AppText>
            </View>
            <Flecha width={16} height={16} />
          </View>
        </View>

        {/* Cuenta Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderSimple}>
            <AppText variant="ag7" color="#1A1A1A">Cuenta</AppText>
          </View>
          
          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIcon}>
                <Password width={20} height={20} />
              </View>
              <AppText variant="ag9" color="#1A1A1A">Cambiar Contraseña</AppText>
            </View>
            <Flecha width={16} height={16} />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIcon}>
                <Terms width={20} height={20} />
              </View>
              <AppText variant="ag9" color="#1A1A1A">Términos y Condiciones</AppText>
            </View>
            <Flecha width={16} height={16} />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIcon}>
                <Shield width={20} height={20} />
              </View>
              <AppText variant="ag9" color="#1A1A1A">Política de Privacidad</AppText>
            </View>
            <Flecha width={16} height={16} />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIcon}>
                <Info width={20} height={20} />
              </View>
              <View>
                <AppText variant="ag9" color="#1A1A1A">Información</AppText>
                <AppText variant="ag10" color="#6A7282">Foodlytics v1.0.0</AppText>
              </View>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <Pressable style={styles.logoutButton} onPress={() => { /* TODO: logout */ }} accessibilityRole="button">
          <Logout width={16} height={16} style={{ marginRight: 8 }} />
          <AppText variant="ag9" color="white">Cerrar Sesión</AppText>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    height: 168,
    paddingTop: 56,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    height: 80,
    gap: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  avatarImageWrap: {
    overflow: 'hidden',
    borderRadius: 40,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userInfo: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 21,
    paddingBottom: 140,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  cardHeaderSimple: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 20,
    paddingBottom: 16,
    gap: 16,
  },
  gridItem: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 20,
    width: "47%",
    gap: 4,
  },
  imcContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imcLeft: {
    gap: 4,
  },
  imcBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  goalsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 16,
  },
  goalItem: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 20,
    flex: 1,
    gap: 4,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  caloriesGoal: {
    backgroundColor: "#F8FAFC",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 12,
    borderRadius: 20,
    gap: 4,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    marginHorizontal: 21,
    marginTop: 20,
    paddingVertical: 18,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
