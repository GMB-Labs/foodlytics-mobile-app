// Complete screen for the Add Weight flow
import React from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CompletionScreen } from '@/src/shared/ui/screens/CompletionScreen';
import { useTodayISO } from '@/src/shared/hooks/useTodayISO';

export default function WeightCompleteScreen() {
	const router = useRouter();
	const params = useLocalSearchParams() as any;
	const todayISO = useTodayISO();

	const dateISO = (params?.dateISO as string | undefined) ?? todayISO;
	// weight may be passed as `weightKg` or `valueKg` or `value` depending on callers
	const weight = (params?.weightKg ?? params?.valueKg ?? params?.value) as string | undefined;

	const message = weight
		? `Se registró ${weight} kg el ${dateISO}`
		: `Se registró tu peso el ${dateISO}`;

	const goToActivity = () => {
		router.push(`/(tabs)/activity/progress` as any);
	};

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<CompletionScreen
				heading="¡Peso registrado!"
				message={message}
				icon={require('@/assets/lottie/weight.json')}
				autoRedirectMs={3500}
				onAutoRedirect={goToActivity}
			/>
		</>
	);
}