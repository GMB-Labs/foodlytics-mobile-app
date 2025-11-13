// src/features/vision/ui/screens/CameraEntry.tsx
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, View, Pressable, StyleSheet, Platform, Alert } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import AppText from "@/src/shared/ui/components/Typography";
import { useTodayISO } from "@/src/shared/hooks/useTodayISO";
import CameraIcon from "@/assets/icons/cameraIcon.svg";

export default function CameraEntry() {
  const params = useLocalSearchParams() as any;
  const router = useRouter();
  const navigation = useNavigation();
  const todayISO = useTodayISO();

  const incomingDate = params?.dateISO as string | undefined;
  const incomingMealType = params?.mealType as string | undefined;

  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // pedir permisos
  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  // validar fecha HOY
  useEffect(() => {
    if (!incomingDate || incomingDate !== todayISO) {
      const q = new URLSearchParams();
      q.set("dateISO", todayISO);
      if (incomingMealType) q.set("mealType", incomingMealType);
      router.replace(`/camera?${q.toString()}` as any);
    }
  }, [incomingDate, incomingMealType, todayISO, router]);

  const handleCapture = async () => {
    if (isCapturing || !isCameraReady || !cameraRef.current) return;
    try {
      setIsCapturing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: true,
      });
      if (!photo?.uri) throw new Error("No se obtuvo imagen");

      console.log("%c📸 Foto capturada", "color:#2FCCAC;font-weight:bold;");
      console.log("URI local:", photo.uri);

      const q = new URLSearchParams();
      q.set("dateISO", todayISO);
      if (incomingMealType) q.set("mealType", incomingMealType);
      q.set("photoUri", photo.uri);

      console.log("➡️ Navegando a /camera/loading con:", Object.fromEntries(q as any));
      router.push(`/camera/loading?${q.toString()}`);
    } catch (error) {
      console.error("❌ Error al capturar la foto:", error);
      Alert.alert("Error", "No se pudo tomar la foto");
    } finally {
      setIsCapturing(false);
    }
  };

  if (!permission) {
    return <View style={styles.loading}><AppText>Cargando permisos...</AppText></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <AppText style={styles.permissionText}>Se necesita acceso a la cámara</AppText>
        <Pressable onPress={requestPermission} style={styles.permissionBtn}>
          <AppText style={styles.permissionBtnText}>Conceder permiso</AppText>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Cámara como fondo */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        onCameraReady={() => setCameraReady(true)}
      />

      <View style={styles.overlay}>
        {/* Cerrar */}
        <Pressable
          onPress={() => {
            // If this camera was opened with meal context, prefer returning to Meals for that date
            try {
              if (incomingMealType || incomingDate) {
                const q = new URLSearchParams();
                if (incomingDate) q.set('dateISO', incomingDate);
                router.replace(`/(tabs)/meals?${q.toString()}` as any);
                return;
              }
            } catch (e) {}

            // Otherwise prefer native goBack if possible
            try {
              // @ts-ignore
              if (navigation && typeof (navigation as any).canGoBack === 'function' && (navigation as any).canGoBack()) {
                // @ts-ignore
                (navigation as any).goBack();
                return;
              }
            } catch (e) {}

            // final fallback to home
            router.replace('/');
          }}
          style={styles.closeBtn}
          hitSlop={10}
          accessibilityLabel="Cerrar cámara"
        >
          <AppText variant="ag7" style={styles.text}>✕</AppText>
        </Pressable>

        {/* Título + subtítulo */}
        <View style={styles.column}>
          <View style={styles.column2}>
            <AppText variant="ag3" style={styles.text2}>Enfoca tu comida</AppText>
            <AppText variant="ag9" style={styles.text3}>
              Asegúrate de que todos los alimentos sean visibles
            </AppText>
          </View>

          {/* Marco guía */}
          <View style={styles.view}>
            <View style={styles.box} />
          </View>

          {/* Botón de captura */}
          <View style={styles.view2}>
            <Pressable
              onPress={handleCapture}
              disabled={!isCameraReady || isCapturing}
              accessibilityLabel="Capturar"
              style={styles.capturePressable}
            >
              <View style={[styles.captureOuter, !isCameraReady || isCapturing ? { opacity: 0.6 } : null]}>
                <View style={styles.captureInner}>
                  <CameraIcon width={28} height={28} />
                </View>
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  overlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  box: {
    width: 320,
    height: 320,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 24,
    borderWidth: 4,
  },
  column: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 40,
    paddingTop: Platform.OS === "ios" ? 120 : 150,
  },
  column2: { alignItems: "center", marginBottom: 20, marginHorizontal: 32 },
  view: { alignItems: "center", marginBottom: 40 },
  view2: { alignItems: "center", marginBottom: 20, marginTop: 20 },
  capturePressable: { alignItems: "center", justifyContent: "center" },
  captureOuter: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: "#FFFFFF",
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  captureInner: {
    width: 62, height: 62, borderRadius: 28, backgroundColor: "#2FCCAC",
    justifyContent: "center", alignItems: "center",
  },
  closeBtn: {
    position: "absolute", top: Platform.OS === "ios" ? 28 : 40, left: 30, zIndex: 10,
  },
  text: { color: "#FFFFFF", fontSize: 24 },
  text2: { color: "#FFFFFF", fontSize: 24, marginBottom: 24 },
  text3: { color: "rgba(255,255,255,0.7)", fontSize: 14, textAlign: "center", width: 264 },
  permissionContainer: {
    flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000",
  },
  permissionText: { color: "#fff", fontSize: 16, marginBottom: 20 },
  permissionBtn: { backgroundColor: "#2FCCAC", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  permissionBtnText: { color: "#fff", fontWeight: "bold" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
});
