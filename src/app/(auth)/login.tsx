import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar } from "react-native";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function onSubmit() {
    // Placeholder: real auth lives in `features/iam/application` use-cases
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      // After successful login navigate to root (tabs)
      router.replace("/");
    }, 700);
  }

  return (
    <View className="flex-1">
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Background Gradient */}
      <LinearGradient
        colors={['#2fccac', '#24a88c']}
        className="flex-1"
      >
        {/* Header Section */}
        <View className="flex-1 items-center justify-center px-6 pt-16">
          {/* Logo */}
          <View className="bg-white rounded-3xl shadow-lg w-24 h-24 items-center justify-center mb-6">
            <Ionicons name="restaurant" size={32} color="#2fccac" />
          </View>

          {/* Title */}
          <Text className="text-white text-4xl font-normal mb-2" style={{ fontFamily: 'Poppins-Medium' }}>
            Foodlytics
          </Text>

          {/* Subtitle */}
          <Text className="text-white/90 text-base text-center" style={{ fontFamily: 'Poppins-Regular' }}>
            Monitorea tus macros con IA
          </Text>
        </View>

        {/* Login Form Card */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="bg-white rounded-t-[40px] px-9 pt-8 pb-0 min-h-[462px]"
        >
          {/* Form Title */}
          <Text className="text-gray-900 text-2xl font-normal mb-6" style={{ fontFamily: 'Poppins-Regular' }}>
            Iniciar Sesión
          </Text>

          {/* Email Field */}
          <View className="mb-6">
            <Text className="text-gray-600 text-sm mb-1" style={{ fontFamily: 'Poppins-Regular' }}>
              Correo Electrónico
            </Text>
            <View className="relative">
              <View className="absolute left-4 top-4 z-10">
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
              </View>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Liliana@gmail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-gray-50 pl-12 pr-4 py-4 rounded-[20px] text-sm text-gray-500"
                style={{ fontFamily: 'Poppins-Regular', height: 56 }}
                accessibilityLabel="email"
              />
            </View>
          </View>

          {/* Password Field */}
          <View className="mb-4">
            <Text className="text-gray-600 text-sm mb-1" style={{ fontFamily: 'Poppins-Regular' }}>
              Contraseña
            </Text>
            <View className="relative">
              <View className="absolute left-4 top-4 z-10">
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
              </View>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                className="bg-gray-50 pl-12 pr-12 py-4 rounded-[20px] text-sm text-gray-500"
                style={{ fontFamily: 'Poppins-Regular', height: 56 }}
                accessibilityLabel="password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4"
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#9CA3AF" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity onPress={() => router.push("/forgot-password")} className="mb-6">
            <Text className="text-[#2fccac] text-sm" style={{ fontFamily: 'Poppins-Regular' }}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            onPress={onSubmit}
            disabled={submitting || !email || !password}
            className={`bg-[#2fccac] rounded-[20px] items-center justify-center mb-6 ${
              submitting || !email || !password ? "opacity-50" : ""
            }`}
            style={{ height: 56 }}
            accessibilityLabel="iniciar-sesion"
            accessibilityState={{ busy: submitting }}
          >
            <Text className="text-white text-sm font-medium" style={{ fontFamily: 'Poppins-Medium' }}>
              {submitting ? "Ingresando..." : "Iniciar Sesión"}
            </Text>
          </TouchableOpacity>

          {/* Register Link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-gray-600 text-base mr-1" style={{ fontFamily: 'Poppins-Regular' }}>
              ¿No tienes cuenta?
            </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text className="text-[#2fccac] text-base font-medium" style={{ fontFamily: 'Poppins-Medium' }}>
                Regístrate
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

