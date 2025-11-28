import React from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CompletionScreen } from '@/src/shared/ui/screens/CompletionScreen';
import { useTodayISO } from '@/src/shared/hooks/useTodayISO';

export default function ActivityCompleteScreen() {
    const router = useRouter();
    const params = useLocalSearchParams() as any;
    const todayISO = useTodayISO();
    const dateISO = (params?.dateISO as string | undefined) ?? todayISO;
    // prefer server-provided `calories_burned` if available, otherwise fallback to local `calories`
    const calories = (params?.calories_burned ?? params?.calories) as string | undefined;
    const duration = params?.duration as string | undefined;
    
    let message = `Se registró tu actividad el ${dateISO}`;
    if (calories) {
        message += ` · ${calories} kcal`;
    }
    if (duration) {
        message += ` · ${duration} min`;
    }
    const goToActivity = () => {
        router.push(`/(tabs)/activity` as any);
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
                <CompletionScreen
                heading="¡Actividad registrada!"
                message={message}
                lottie={require('@/assets/lottie/fire.json')}     
                icon={require('@/assets/images/fire.webp')} 
                autoRedirectMs={3500}
                onAutoRedirect={goToActivity}
                />
        </>
    );
}
