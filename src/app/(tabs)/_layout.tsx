import { Redirect, Tabs } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import BottomNav from '@/src/shared/ui/BottomNav';
import useSession from '@/src/shared/hooks/useSession';

const Layout = () => {
  const [session] = useSession();

  // Mostrar loader mientras se restaura la sesión
  if (session.loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2fccac" />
      </View>
    );
  }

  // Redirigir a login si no está autenticado
  if (!session.isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Renderizar tabs protegidas
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // hide default tab bar
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="meals" />
        <Tabs.Screen name="activity" />
        <Tabs.Screen name="profile" />
      </Tabs>

      <BottomNav />
    </View>
  );
};

export default Layout;
