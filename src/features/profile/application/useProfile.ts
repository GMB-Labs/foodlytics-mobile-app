import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert, Platform } from "react-native";

export type Profile = {
  name: string;
  email: string;
  avatar: string | null;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  bmiLabel: string;
  goalWeight: number;
  activity: string;
  dailyCalories: number;
};

const MOCK: Profile = {
  name: "Liliana",
  email: "Liliana@gmail.com",
  avatar: null,
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

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(MOCK);

  // --- Función principal
  const pickImage = useCallback(async () => {
    Alert.alert(
      "Cambiar foto de perfil",
      "Elige una opción",
      [
        { text: "Tomar foto", onPress: () => openCamera() },
        { text: "Elegir de galería", onPress: () => openGallery() },
        { text: "Cancelar", style: "cancel" },
      ],
      { cancelable: true }
    );
  }, []);

  // --- Abrir cámara
  const openCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Activa los permisos de cámara para continuar");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    // SDKs nuevos usan `canceled`
    // @ts-ignore
    const canceled = result.canceled ?? result.cancelled;
    if (canceled) return;
    // @ts-ignore
    const uri = result.assets?.[0]?.uri ?? result.uri ?? null;

    if (uri) {
      setProfile(p => ({ ...p, avatar: uri }));
      // TODO: subir imagen al servidor
    }
  }, []);

  // --- Abrir galería
  const openGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Activa los permisos de galería para continuar");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    // @ts-ignore
    const canceled = result.canceled ?? result.cancelled;
    if (canceled) return;
    // @ts-ignore
    const uri = result.assets?.[0]?.uri ?? result.uri ?? null;

    if (uri) {
      setProfile(p => ({ ...p, avatar: uri }));
      // TODO: subir imagen al servidor
    }
  }, []);

  const updateProfile = useCallback((partial: Partial<Profile>) => {
    setProfile(prev => ({ ...prev, ...partial }));
    // TODO: persistir con backend
  }, []);

  return { profile, updateProfile, pickImage };
}
