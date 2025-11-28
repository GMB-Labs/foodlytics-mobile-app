import React, { createContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { light } from './themes/light';
import { dark } from './themes/dark';
import { ASYNC_STORAGE_KEYS } from '@/src/shared/constants/storage';

export type Mode = 'light' | 'dark' | 'system';

const STORAGE_KEY = ASYNC_STORAGE_KEYS.THEME;

type ThemeContextValue = {
  mode: Mode;
  setMode: (m: Mode) => void;
  colors: typeof light;
};

export const ThemeContext = createContext<ThemeContextValue>({
  mode: 'system',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setMode: () => {},
  colors: light,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const sys = useColorScheme();
  const [mode, setModeState] = useState<Mode>('system');
  // Initialize colors immediately from system preference to avoid initial flicker
  const [colors, setColors] = useState<typeof light>(sys === 'dark' ? (dark as any) : (light as any));

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw === 'light' || raw === 'dark' || raw === 'system') {
          setModeState(raw as Mode);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    const resolved = mode === 'system' ? (sys === 'dark' ? 'dark' : 'light') : mode;
    setColors(resolved === 'dark' ? (dark as any) : (light as any));
  }, [mode, sys]);

  const setMode = async (m: Mode) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, m);
    } catch (e) {
      // ignore
    }
    // debug
    // eslint-disable-next-line no-console
    setModeState(m);
  };

  return (
    <ThemeContext.Provider value={{ mode, setMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
