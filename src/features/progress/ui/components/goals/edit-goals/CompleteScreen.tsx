import React from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CompletionScreen } from '@/src/shared/ui/screens/CompletionScreen';
import { useTodayISO } from '@/src/shared/hooks/useTodayISO';

export default function GoalsCompleteScreen() {
    const router = useRouter();
    const params = useLocalSearchParams() as any;
    const todayISO = useTodayISO();
    const dateISO = (params?.dateISO as string | undefined) ?? todayISO;
    
    const message = `Se registró tu meta el ${dateISO}`;
    const goToActivity = () => {
        router.push(`/(tabs)/activity/progress` as any);
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <CompletionScreen
                heading="¡Meta registrada!"
                message={message}
                icon={require('@/assets/lottie/edit-goal.json')}
                autoRedirectMs={3500}
                onAutoRedirect={goToActivity}
            />
        </>
    );
}