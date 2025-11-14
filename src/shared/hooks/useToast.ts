import { Alert, Platform, ToastAndroid } from 'react-native';

type ToastOptions = { type?: 'success' | 'error' | 'info'; text: string };

export default function useToast() {
	return {
		show({ text }: ToastOptions) {
			try {
				if (Platform.OS === 'android') {
					ToastAndroid.show(text, ToastAndroid.SHORT);
				} else {
					Alert.alert(text);
				}
			} catch (e) {
				// fallback
				// eslint-disable-next-line no-console
				console.log('toast:', text);
			}
		},
	};
}
