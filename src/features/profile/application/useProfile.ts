import { useCallback, useState, useEffect } from "react";
import { AppState, AppStateStatus } from 'react-native';
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { useSession } from '@/src/shared/hooks/useSession';
import {
  fetchProfileCached,
  fetchProfilePictureCached,
  fetchCalorieTargetsCached,
  redeemNutritionistInvite,
  uploadProfilePicture,
  updateProfile as updateProfileRemote,
  ProfileDto,
} from '@/src/shared/api/profileGateway';
import { getCurrentProfile, subscribeProfile, updateProfilePartial, Profile } from './profileState';

function useProfile() {
  const [profile, setProfile] = useState<Profile>(getCurrentProfile());
  const [session] = useSession();
  const [isSyncingProfile, setIsSyncingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRedeemingCode, setIsRedeemingCode] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeProfile((p) => setProfile(p));
    setProfile(getCurrentProfile());
    return () => unsubscribe();
  }, []);

  const loadRemotePicture = useCallback(
    async (force?: boolean) => {
      if (!session?.sub) return null;
      try {
        const uri = await fetchProfilePictureCached({
          userId: session.sub,
          token: session.accessToken ?? undefined,
          force,
        });
        if (uri) {
          patchProfile({ avatar: uri, hasProfilePicture: true });
        }
        return uri;
      } catch (err) {
        console.error('[useProfile] error loading profile picture', err);
        return null;
      }
    },
    [session?.sub, session?.accessToken]
  );

  const applyProfileDto = useCallback(
    async (dto: ProfileDto | null, opts?: { ensurePicture?: boolean; forcePicture?: boolean }) => {
      if (!dto) return null;
      const current = getCurrentProfile();
      const mapped = buildProfilePatchFromDto(dto, current, session?.email);
      patchProfile(mapped);

      if (opts?.ensurePicture) {
        if (dto.has_profile_picture) {
          await loadRemotePicture(opts.forcePicture);
        } else if (dto.has_profile_picture === false) {
          patchProfile({ avatar: null, hasProfilePicture: false });
        }
      }
      return dto;
    },
    [loadRemotePicture, session?.email]
  );

  const syncProfile = useCallback(
    async (opts?: { force?: boolean }) => {
      if (!session?.isAuthenticated || !session?.sub) return null;
      setIsSyncingProfile(true);
      try {
        const dto = await fetchProfileCached({
          userId: session.sub,
          token: session.accessToken ?? undefined,
          force: opts?.force,
        });
        await applyProfileDto(dto, { ensurePicture: true, forcePicture: opts?.force });
        // fetch calorie targets and patch into profile state
        try {
          const ct = await fetchCalorieTargetsCached({ patientId: session.sub, token: session.accessToken ?? undefined, force: opts?.force });
          if (ct) {
            patchProfile({
              dailyCalories: typeof ct.calories === 'number' ? ct.calories : undefined,
              calories: typeof ct.calories === 'number' ? ct.calories : undefined,
              proteinGrams: typeof ct.protein_grams === 'number' ? ct.protein_grams : undefined,
              carbGrams: typeof ct.carb_grams === 'number' ? ct.carb_grams : undefined,
              fatGrams: typeof ct.fat_grams === 'number' ? ct.fat_grams : undefined,
              bmi: typeof ct.bmi === 'number' ? ct.bmi : undefined,
              calorieTargetsUpdatedAt: ct.updated_at ?? undefined,
            });
          }
        } catch (err) {
          console.error('[useProfile] error fetching calorie targets', err);
        }
        return dto;
      } catch (err) {
        console.error('[useProfile] error fetching profile', err);
        throw err;
      } finally {
        setIsSyncingProfile(false);
      }
    },
    [applyProfileDto, session?.accessToken, session?.isAuthenticated, session?.sub]
  );

  useEffect(() => {
    if (!session?.isAuthenticated || !session?.sub) return;
    syncProfile().catch((err) => console.error('[useProfile] sync effect error', err));
  }, [session?.isAuthenticated, session?.sub, session?.accessToken, syncProfile]);

  // Refresh profile when app comes to foreground (useful if user updated profile elsewhere)
  useEffect(() => {
    let mounted = true;
    function handleState(next: AppStateStatus) {
      if (!mounted) return;
      if (next === 'active') {
        syncProfile({ force: false }).catch((e) => console.error('[useProfile] appstate sync error', e));
      }
    }
    const sub = AppState.addEventListener ? AppState.addEventListener('change', handleState) : null;
    return () => {
      mounted = false;
      if (sub && typeof sub.remove === 'function') sub.remove();
    };
  }, [syncProfile]);

  const handleImageSelected = useCallback(
    async (uri: string, assetType?: string | null) => {
      patchProfile({ avatar: uri });
      if (!session?.sub) return;

      const guessedType =
        assetType && assetType.includes('/')
          ? assetType
          : assetType === 'image'
            ? 'image/jpeg'
            : 'image/jpeg';

      try {
        setIsUploadingAvatar(true);
        await uploadProfilePicture({
          userId: session.sub,
          uri,
          token: session.accessToken ?? undefined,
          mimeType: guessedType,
        });
        await loadRemotePicture(true);
        await syncProfile({ force: true });
      } catch (err) {
        console.error('[useProfile] error uploading picture', err);
        Alert.alert('Error', 'No pudimos guardar tu foto. Intenta de nuevo.');
      } finally {
        setIsUploadingAvatar(false);
      }
    },
    [session?.sub, session?.accessToken, loadRemotePicture, syncProfile]
  );

  const openCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Activa los permisos de camara para continuar");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    const canceled = result.canceled ?? (result as any).cancelled;
    if (canceled) return;
    const uri = result.assets?.[0]?.uri ?? (result as any).uri ?? null;
    const assetType = result.assets?.[0]?.type ?? (result as any).type;

    if (uri) {
      await handleImageSelected(uri, assetType);
    }
  }, [handleImageSelected]);

  const openGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Activa los permisos de galeria para continuar");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    const canceled = result.canceled ?? (result as any).cancelled;
    if (canceled) return;
    const uri = result.assets?.[0]?.uri ?? (result as any).uri ?? null;
    const assetType = result.assets?.[0]?.type ?? (result as any).type;

    if (uri) {
      await handleImageSelected(uri, assetType);
    }
  }, [handleImageSelected]);

  const pickImage = useCallback(() => {
    Alert.alert(
      "Cambiar foto de perfil",
      "Elige una opcion",
      [
        { text: "Tomar foto", onPress: () => openCamera() },
        { text: "Elegir de galeria", onPress: () => openGallery() },
        { text: "Cancelar", style: "cancel" },
      ],
      { cancelable: true }
    );
  }, [openCamera, openGallery]);

  const updateProfile = useCallback(
    async (partial: Partial<Profile> & Record<string, any>) => {
      // optimistic update
      updateProfilePartial(partial);
      if (!session?.sub) return null;
      try {
        setIsSavingProfile(true);
        // map local partial fields to backend DTO keys
        const payload: Record<string, any> = {};
        if (partial.name) {
          const parts = String(partial.name).trim().split(/\s+/);
          payload.first_name = parts.shift() || '';
          payload.last_name = parts.join(' ') || '';
        }
        if (partial.age !== undefined) payload.age = Number(partial.age);
        if (partial.gender !== undefined) payload.gender = partial.gender;
        if (partial.heightCm !== undefined) payload.height_cm = Number(partial.heightCm);
        if (partial.weightKg !== undefined) payload.weight_kg = Number(partial.weightKg);
        if (partial.goalWeight !== undefined) payload.desired_weight_kg = Number(partial.goalWeight);
        if (partial.activity !== undefined) payload.activity_level = partial.activity;
        if (partial.goalType !== undefined) payload.goal_type = partial.goalType;
        if (partial.dailyCalories !== undefined) payload.daily_calories = Number(partial.dailyCalories);
        // allow passing explicit backend flags
        if ((partial as any).user_profile_completed !== undefined) payload.user_profile_completed = Boolean((partial as any).user_profile_completed);

        // debug: log mapped payload before sending
        try {
          // eslint-disable-next-line no-console
          console.log('[useProfile] updateProfile payload ->', payload);
        } catch (e) {}

        // ensure required backend fields are present: first_name, last_name, user_profile_completed
        try {
          const current = getCurrentProfile();
          // if payload doesn't include first/last name, derive from current profile name
          if (payload.first_name === undefined) {
            const name = current?.name ?? '';
            const parts = String(name).trim().split(/\s+/).filter(Boolean);
            payload.first_name = parts.shift() ?? '';
            payload.last_name = parts.join(' ') ?? '';
          }
          // ensure age and gender are present (backend requires them)
          if (payload.age === undefined) payload.age = current?.age ?? 0;
          if (payload.gender === undefined) payload.gender = current?.gender ?? '';
          // ensure user_profile_completed is present (default to true so backend validation passes)
          if (payload.user_profile_completed === undefined) {
            payload.user_profile_completed = true;
          }
        } catch (e) {
          // ignore and continue
        }

        // persist to backend (PUT) using profileGateway.updateProfile
        const res = await updateProfileRemote({ userId: session.sub, payload, token: session.accessToken ?? undefined });
        try {
          // eslint-disable-next-line no-console
          console.log('[useProfile] updateProfile response ->', res);
        } catch (e) {}
        // apply full DTO returned but avoid forcing picture fetch to speed up UX
        await applyProfileDto(res, { ensurePicture: false, forcePicture: false });
        return res;
      } catch (err) {
        console.error('[useProfile] error persisting profile update', err);
        // let optimistic update remain; consider reverting on severe errors
        throw err;
      } finally {
        setIsSavingProfile(false);
      }
    },
    [session?.sub, session?.accessToken, applyProfileDto]
  );

  const redeemNutritionistCode = useCallback(
    async (code: string) => {
      if (!session?.sub) throw new Error('Usuario no disponible');
      const trimmed = code.trim();
      if (!trimmed) throw new Error('Ingresa un codigo valido');

      setIsRedeemingCode(true);
      try {
        const dto = await redeemNutritionistInvite({
          patientId: session.sub,
          code: trimmed,
          token: session.accessToken ?? undefined,
        });

        // The redeem endpoint may return data that belongs to the nutritionist
        // (first_name/last_name). Avoid applying the full DTO directly because
        // it can overwrite the patient's `name` field used by Header/Home.
        // Strategy:
        // - If the response includes an explicit nutritionist id, update only that.
        // - If the response appears to be the patient's DTO (id matches session.sub),
        //   it's safe to apply the DTO.
        const newNutritionistId = (dto as any)?.nutritionist_id ?? (dto as any)?.nutritionistId ?? null;
        const dtoUserId = (dto as any)?.id ?? (dto as any)?.user_id ?? null;

        if (newNutritionistId) {
          patchProfile({ nutritionistId: newNutritionistId });
        } else if (dtoUserId && String(dtoUserId) === String(session.sub)) {
          // DTO belongs to the patient — safe to apply
          await applyProfileDto(dto, { ensurePicture: true });
        } else {
          // No clear nutritionist id and DTO does not match current user: do not apply
          // to avoid accidentally overwriting patient fields. Instead, leave it to
          // the NutritionistInvite component (or a subsequent sync) to fetch names.
        }

        return dto;
      } catch (err) {
        console.error('[useProfile] error redeeming code', err);
        throw err;
      } finally {
        setIsRedeemingCode(false);
      }
    },
    [applyProfileDto, session?.accessToken, session?.sub]
  );

  const refreshProfile = useCallback(
    async (opts?: { force?: boolean }) => {
      return syncProfile({ force: opts?.force ?? true });
    },
    [syncProfile]
  );

  return {
    profile,
    updateProfile,
    pickImage,
    refreshProfile,
    redeemNutritionistCode,
    isSyncingProfile,
    isUploadingAvatar,
    isRedeemingCode,
    isSavingProfile,
  };
}

export default useProfile;

function patchProfile(partial: Partial<Profile>) {
  const current = getCurrentProfile();
  const next: Partial<Profile> = {};
  (Object.keys(partial) as Array<keyof Profile>).forEach((key) => {
    const value = partial[key];
    if (value !== undefined && value !== current[key]) {
      (next as any)[key] = value;
    }
  });
  if (Object.keys(next).length > 0) {
    updateProfilePartial(next);
  }
}

function buildProfilePatchFromDto(dto: ProfileDto, current: Profile, emailFromSession?: string | null): Partial<Profile> {
  const nameRaw = `${dto?.first_name ?? ''} ${dto?.last_name ?? ''}`.trim();
  const height = typeof dto?.height_cm === 'number' ? dto.height_cm : current.heightCm;
  const weight = typeof dto?.weight_kg === 'number' ? dto.weight_kg : current.weightKg;
  const denom = Math.pow(height / 100 || 0, 2);
  const bmi = denom > 0 ? Number(((weight || 0) / denom).toFixed(1)) : current.bmi;
  const dailyCalories = typeof dto?.daily_calories === 'number' ? dto.daily_calories : current.dailyCalories;
  let avatar = current.avatar;
  if (dto?.has_profile_picture === false) {
    avatar = null;
  } else if (typeof dto?.profile_picture_url === 'string' && dto.profile_picture_url.length > 0) {
    avatar = dto.profile_picture_url;
  }

  return {
    name: nameRaw || current.name,
    email: emailFromSession ?? current.email,
    avatar,
    age: typeof dto?.age === 'number' ? dto.age : current.age,
    gender: typeof dto?.gender === 'string' ? dto.gender : (typeof dto?.sex === 'string' ? dto.sex : current.gender),
    heightCm: height,
    weightKg: weight,
    goalWeight: typeof dto?.desired_weight_kg === 'number' ? dto.desired_weight_kg : current.goalWeight,
    activity: dto?.activity_level ?? current.activity,
    goalType: dto?.goal_type ?? current.goalType,
    nutritionistId: dto?.nutritionist_id ?? current.nutritionistId,
    hasProfilePicture: dto?.has_profile_picture ?? current.hasProfilePicture,
    dailyCalories,
    bmi,
  };
}
