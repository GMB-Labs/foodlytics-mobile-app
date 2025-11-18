import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Dark from '@/assets/icons/profile/dark.svg';
import Light from '@/assets/icons/profile/light.svg';
import System from '@/assets/icons/profile/system.svg';
import { s, COLORS } from '@/src/features/profile/ui/tokens';

type Mode = 'system' | 'light' | 'dark';

export default function ThemeSelector({
  value,
  onChange,
}: {
  value: Mode;
  onChange: (m: Mode) => void;
}) {
  // The left big preview lives in `Preferences`; ThemeSelector only renders
  // the two fixed small buttons on the right which represent the other modes.
  let rightModes: Mode[] = [];
  if (value === 'system') rightModes = ['light', 'dark'];
  else if (value === 'light') rightModes = ['dark', 'system'];
  else rightModes = ['light', 'system'];

  const iconFor = (mode: Mode) => {
    if (mode === 'system') return System;
    if (mode === 'light') return Light;
    return Dark; // dark
  };

  const bgFor = (mode: Mode) =>
    mode === 'light' ? '#2FCCAC' : mode === 'dark' ? '#121212' : '#F3F4F6';

  const iconColorFor = (mode: Mode) => (mode === 'light' ? '#FFFFFF' : mode === 'dark' ? '#FFFFFF' : '#4A5565');

  return (
    <View style={styles.row}>
      {rightModes.map((m) => {
        const Icon = iconFor(m);
        return (
          <SelectorButton
            key={m}
            selected={false}
            onPress={() => onChange(m)}
            bg={bgFor(m)}
            iconColor={iconColorFor(m)}
            // show the mode background even when not selected
            idleBg={bgFor(m)}
            testID={`theme-${m}`}
          >
            <Icon width={18} height={18} color={iconColorFor(m)} />
          </SelectorButton>
        );
      })}
    </View>
  );
}

function SelectorButton({
  selected,
  onPress,
  bg,
  idleBg,
  iconColor,
  testID,
  children,
}: {
  selected: boolean;
  onPress: () => void;
  bg: string;
  idleBg: string;
  iconColor: string;
  testID?: string;
  children?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [styles.outer, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <View style={[styles.ring, { borderColor: selected ? bg : COLORS.border }]}>
        <View style={[styles.inner, { backgroundColor: selected ? bg : idleBg }]}> 
          {children ?? <System width={20} height={20} color={selected ? iconColor : COLORS.subtext} />}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  outer: { marginLeft: s(12) },
  ring: { width: s(44), height: s(44), borderRadius: s(22), alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  inner: { width: s(36), height: s(36), borderRadius: s(18), alignItems: 'center', justifyContent: 'center' },
});
