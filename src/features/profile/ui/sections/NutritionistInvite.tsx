import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable, ActivityIndicator, Text } from "react-native";
import AppText from "@/src/shared/ui/components/Typography";
import SectionCard from "../components/SectionCard";
import EditAction from '../components/EditAction';
import { s } from "../tokens";
import { useTheme } from '@/src/shared/styles/useTheme';

type Props = {
  nutritionistId?: string | null;
  onRedeem: (code: string) => Promise<any>;
  isLoading?: boolean;
};

export default function NutritionistInvite({ nutritionistId, onRedeem, isLoading }: Props) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showInput, setShowInput] = useState<boolean>(() => !Boolean(nutritionistId));
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors as any), [colors]);

  React.useEffect(() => {
    // when prop nutritionistId changes, default input visibility to hidden if assigned
    setShowInput(!Boolean(nutritionistId));
  }, [nutritionistId]);

  async function handleRedeem(): Promise<boolean> {
    if (!code.trim()) {
      setStatus({ type: 'error', message: 'Ingresa un codigo valido' });
      return false;
    }
    try {
      setStatus(null);
      await onRedeem(code.trim());
      setCode('');
      setStatus({ type: 'success', message: 'Codigo vinculado correctamente' });
      return true;
    } catch (err: any) {
      const message =
        err?.body?.message ||
        err?.message ||
        'No pudimos validar el codigo. Intenta de nuevo.';
      setStatus({ type: 'error', message });
      return false;
    }
  }

  return (
    <SectionCard
      title="Nutricionista"
      right={showInput ? (
        <Pressable onPress={() => { setShowInput(false); setCode(''); setStatus(null); }}>
          <AppText variant="ag9" color={(colors as any)?.brandA}>Cancelar</AppText>
        </Pressable>
      ) : (
        <EditAction onPress={() => { setShowInput(true); setStatus(null); }} />
      )}
    >
      <View style={styles.content}>
        {showInput && (
          <>
            <AppText variant="ag10" color={(colors as any)?.muted}><Text>Codigo de invitacion</Text></AppText>
            <TextInput
              style={[styles.input, { backgroundColor: (colors as any)?.mealRowBg, color: (colors as any)?.text }]}
              placeholder="Ej: FIT123"
              placeholderTextColor={(colors as any)?.muted}
              autoCapitalize="characters"
              value={code}
              editable={!isLoading}
              onChangeText={(value) => setCode(value.toUpperCase())}
            />
            <Pressable
              onPress={async () => {
                const ok = await handleRedeem();
                if (ok) setShowInput(false);
              }}
              style={[
                styles.button,
                { backgroundColor: (colors as any)?.addBtnBg, opacity: isLoading ? 0.5 : 1 },
              ]}
              disabled={isLoading}
            >
              {isLoading
                ? <ActivityIndicator color={(colors as any)?.white} size="small" />
                : <AppText variant="ag9" color={(colors as any)?.white}><Text>Vincular codigo</Text></AppText>}
            </Pressable>
          </>
        )}

        <View style={styles.statusBox}>
          <AppText variant="ag10" color={(colors as any)?.muted}><Text>Nutricionista asignado</Text></AppText>
          <AppText variant="ag7" color={(colors as any)?.text}>
            {nutritionistId ? `ID: ${nutritionistId}` : 'Sin codigo vinculado'}
          </AppText>
          {/* EditAction now sits on the SectionCard right side */}
        </View>
        {status && (
          <AppText
            variant="ag10"
            color={status.type === 'success' ? (colors as any)?.brandA : (colors as any)?.danger || '#D14343'}
          >
            {status.message}
          </AppText>
        )}
      </View>
    </SectionCard>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    content: { gap: s(12) },
    input: {
      borderRadius: s(12),
      paddingHorizontal: s(14),
      paddingVertical: s(12),
      fontWeight: '600',
      letterSpacing: 1,
    },
    button: {
      borderRadius: s(28),
      paddingVertical: s(12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusBox: {
      backgroundColor: colors?.mealRowBg,
      borderRadius: s(12),
      padding: s(12),
      marginTop: s(4),
      gap: s(4),
    },
  });
}
