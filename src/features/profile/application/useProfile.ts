import { useCallback, useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { useSession } from '@/src/shared/hooks/useSession';
import { getJSON } from '@/src/shared/utils/api';
import { API_BASE_URL } from '@/src/shared/constants/api';
import { getCurrentProfile, subscribeProfile, updateProfilePartial, Profile } from './profileState';

function useProfile() {
  const [profile, setProfile] = useState<Profile>(getCurrentProfile());
  const [session] = useSession();

  useEffect(() => {
    const unsubscribe = subscribeProfile((p) => setProfile(p));
    // ensure current value
    setProfile(getCurrentProfile());
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      try {
        if (!session || !session.isAuthenticated) return;
        const sub = session.sub;
        const token = session.accessToken ?? undefined;
        if (!sub) return;

        const url = `${API_BASE_URL}/api/v1/profiles/${sub}`;
        console.log('[useProfile] GET profile from backend:', url);

        const data = await getJSON(url, { baseUrl: '', token });
        console.log('[useProfile] profile GET result:', data);

        // Map requested fields from API response (uses backend keys)
        const current = getCurrentProfile();
        const nameRaw = `${data?.first_name ?? ''} ${data?.last_name ?? ''}`.trim();
        const mapped: Partial<Profile> = {
          name: nameRaw || current.name,
          email: session?.email ?? current.email,
          avatar: data?.profile_picture_url ?? (data?.has_profile_picture ? current.avatar : null) ?? current.avatar,
          age: typeof data?.age === 'number' ? data.age : current.age,
          gender: data?.gender ?? data?.sex ?? current.gender,
          heightCm: typeof data?.height_cm === 'number' ? data.height_cm : current.heightCm,
          weightKg: typeof data?.weight_kg === 'number' ? data.weight_kg : current.weightKg,
          goalWeight: typeof data?.desired_weight_kg === 'number' ? data.desired_weight_kg : current.goalWeight,
          activity: data?.activity_level ?? current.activity,
        };

        console.log('[useProfile] profile mapped from API:', mapped);

        // Apply only changed keys
        const next: Partial<Profile> = {};
        (Object.keys(mapped) as Array<keyof Profile>).forEach((k) => {
          const v = mapped[k];
          // @ts-ignore
          if (v !== undefined && v !== current[k]) {
            // @ts-ignore
            next[k] = v;
          }
        });

        if (Object.keys(next).length > 0) {
          updateProfilePartial(next as Partial<Profile>);
        }
      } catch (err) {
        console.error('[useProfile] error fetching profile', err);
      }
    }

    fetchProfile();
    return () => { mounted = false; };
  }, [session?.isAuthenticated, session?.accessToken, session?.sub]);

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
      updateProfilePartial({ avatar: uri });
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
      updateProfilePartial({ avatar: uri });
      // TODO: subir imagen al servidor
    }
  }, []);

  const updateProfile = useCallback((partial: Partial<Profile>) => {
    updateProfilePartial(partial);
    // TODO: persistir con backend
  }, []);

  return { profile, updateProfile, pickImage };
}

export default useProfile;
