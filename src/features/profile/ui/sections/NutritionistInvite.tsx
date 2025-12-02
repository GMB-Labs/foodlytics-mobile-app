import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, TextInput, Pressable, ActivityIndicator, Text } from "react-native";
import AppText from "@/src/shared/ui/components/Typography";
import SectionCard from "../components/SectionCard";
import EditAction from '../components/EditAction';
import { s } from "../tokens";
import { useTheme } from '@/src/shared/styles/useTheme';
// useEffect imported from React above
import useSession from '@/src/shared/hooks/useSession';
import { on as onEvent, emit as emitEvent } from '@/src/shared/utils/eventBus';
import { getJSON } from '@/src/shared/utils/api';
import { API_BASE_URL } from '@/src/shared/constants/api';

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
  const [sessionState, sessionActions] = useSession();
  const token = sessionState?.accessToken ?? undefined;

  const [nutritionistName, setNutritionistName] = useState<string | null>(null);
  const [nameLoading, setNameLoading] = useState(false);
  const mountedRef = useRef<boolean>(true);

  const fetchName = useCallback(async (id?: string | null) => {
    const idToUse = id ?? nutritionistId;
    if (!idToUse) {
      if (mountedRef.current) setNutritionistName(null);
      return;
    }
    if (mountedRef.current) setNameLoading(true);
    try {
      const url = `/api/v1/profiles/patients/${encodeURIComponent(idToUse)}/nutritionist-info?nutritions_id=${encodeURIComponent(idToUse)}`;
      const res: any = await getJSON(url, { baseUrl: API_BASE_URL, token });
      if (!mountedRef.current) return;
      if (res && (res.first_name || res.last_name)) {
        if (mountedRef.current) setNutritionistName(`${res.first_name ?? ''}${res.last_name ? ` ${res.last_name}` : ''}`.trim());
      } else {
        if (mountedRef.current) setNutritionistName(null);
      }
    } catch (e) {
      if (mountedRef.current) setNutritionistName(null);
    } finally {
      if (mountedRef.current) setNameLoading(false);
    }
  }, [nutritionistId, token]);

  useEffect(() => {
    mountedRef.current = true;
    fetchName();
    return () => { mountedRef.current = false; };
  }, [fetchName]);

  // Listen to global nutritionist update events so this component reloads
  useEffect(() => {
    const unsub = onEvent('nutritionist:updated', (payload?: any) => {
      const id = payload?.nutritionistId ?? payload?.nutritionist_id ?? payload ?? undefined;
      // call fetchName with the new id (or undefined to fallback to prop)
      fetchName(id ?? undefined);
    });
    return () => { unsub && unsub(); };
  }, [fetchName]);

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
      const res = await onRedeem(code.trim());
      setCode('');
      setStatus({ type: 'success', message: 'Codigo vinculado correctamente' });
      // If the redeem call returns an id or we can otherwise try to reload the assigned nutritionist,
      // attempt to refresh the displayed name immediately so the component reflects the change
      try {
        const newId = res?.nutritionist_id ?? res?.nutritionistId ?? null;
        // prefer returned id, fall back to current prop
        if (newId) {
          await fetchName(newId);
          try { emitEvent('nutritionist:updated', { nutritionistId: newId }); } catch (e) { /* ignore */ }
        } else {
          // If redeem didn't return nutritionist id, fetch the profile for the current user
          // and read the assigned nutritionist_id. Do NOT rely on caches: call the profile
          // endpoint directly and, if present, fetch the nutritionist info.
          try {
            const userId = sessionState?.sub;
            if (userId) {
              // fetch profile (no cache)
              const profileUrl = `/api/v1/profiles/${encodeURIComponent(userId)}`;
              const profileRes: any = await getJSON(profileUrl, { baseUrl: API_BASE_URL, token });
              const fetchedId = profileRes?.nutritionist_id ?? profileRes?.nutritionistId ?? null;
              if (fetchedId) {
                await fetchName(fetchedId);
                try { emitEvent('nutritionist:updated', { nutritionistId: fetchedId }); } catch (e) { /* ignore */ }
              }
            }
          } catch (e) {
            // ignore network errors; we already set success status for redeem
          }
        }
      } catch (e) {
        // ignore fetch errors here; UI will update when parent prop changes
      }
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
            <Text>{nameLoading ? 'Cargando...' : (nutritionistName ? nutritionistName : (nutritionistId ? `ID: ${nutritionistId}` : 'Sin codigo vinculado'))}</Text>
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
