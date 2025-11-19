import { useCallback, useState, useEffect } from "react";
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
  activity: "Sedentario",
  dailyCalories: 1789,
};
// Module-level shared profile state + subscribers so multiple components
// using `useProfile()` see the same data and updates.
let currentProfile: Profile = MOCK;
const listeners: Array<(p: Profile) => void> = [];

function notifyAll() {
  listeners.forEach((fn) => {
    try { fn(currentProfile); } catch (e) { /* ignore */ }
  });
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(currentProfile);

  useEffect(() => {
    const l = (p: Profile) => setProfile(p);
    listeners.push(l);
    // ensure current value
    setProfile(currentProfile);
    return () => {
      const idx = listeners.indexOf(l);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }, []);

  // pick image helper now uses the shared update flow
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
      currentProfile = { ...currentProfile, avatar: uri };
      notifyAll();
      // TODO: subir imagen al servidor
    }
  }, []);

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
      currentProfile = { ...currentProfile, avatar: uri };
      notifyAll();
      // TODO: subir imagen al servidor
    }
  }, []);

  const updateProfile = useCallback((partial: Partial<Profile>) => {
    currentProfile = { ...currentProfile, ...partial };
    notifyAll();
    // TODO: persistir con backend
  }, []);

  return { profile, updateProfile, pickImage };
}
