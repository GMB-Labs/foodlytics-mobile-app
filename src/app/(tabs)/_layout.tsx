import { Redirect, Tabs } from 'expo-router';
import { View } from 'react-native';
import BottomNav from '@/src/shared/ui/BottomNav';
import useSession from '@/src/shared/hooks/useSession';

const _Layout = () => {
  const [session] = useSession();

  if (session.loading) return null;
  if (!session.isAuthenticated) {
    return <Redirect href="/login" />;
  }

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

export default _Layout;
