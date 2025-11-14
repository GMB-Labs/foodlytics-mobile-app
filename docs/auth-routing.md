# Estrategia de rutas y Auth0

Resumen rápido
- Mantén `index` como la pantalla por defecto en `/(tabs)` si ya está funcionando.
- Antes de integrar Auth0 en backend: normaliza `from` en modales y evita devolver a `/` o a rutas de `/(auth)`.
- Cuando integres Auth0, centraliza la protección de rutas en un `ProtectedLayout` y/o un helper `safeNavigate`.

Problema común
- Si pasas `from='/'` o dejas que el modal haga `router.replace('/')`, tu app puede redirigir automáticamente a `/login` (porque la app redirige la raíz) y producir loops o UX inesperada.

Recomendación mínima (hacer ahora, seguro)
1. Normaliza `from` al abrir modales: si `pathname === '/'` o `pathname.startsWith('/(auth)')` entonces usa `from='/(tabs)'`.
2. Al cerrar un modal, usa `router.replace(from ?? '/(tabs)')`.
Esto evita que el modal vuelva a la raíz y active la redirección a login.

Estrategia robusta (recomendada cuando agregues Auth0)
- Crear un `ProtectedLayout` que envuelva `/(tabs)` y que:
  - Muestre un `Splash`/loader mientras `session.loading === true`.
  - Si `loading === false` && `!isAuthenticated` -> `router.replace('/(auth)/login?from=...')`.
  - Si `isAuthenticated` -> renderice children.
- Implementar un helper `safeNavigate(router, session, routeOrKey)` que:
  - Si `session.loading` -> permite navegación local (no redirect).
  - Si `!session.isAuthenticated` -> redirige a `/login` con `from` seguro.
  - Si autenticado -> `router.push(route)`.

Snippets de ejemplo

1) `ProtectedLayout.tsx` (ejemplo)

```tsx
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import useSession from '@/src/shared/hooks/useSession';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sessionState] = useSession();

  // Muestra loader mientras inicializa
  if (sessionState.loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  // Si no autenticado, redirige a login
  if (!sessionState.isAuthenticated) {
    router.replace('/(auth)/login');
    return null;
  }

  return <>{children}</>;
}
```

2) `safeNavigate` helper (ejemplo simple)

```ts
// src/shared/utils/safeNavigate.ts
import { Router } from 'expo-router';
import type { SessionState } from '@/src/shared/hooks/useSession';

export function safeNavigate(router: Router, sessionState: SessionState, route: string) {
  if (sessionState.loading) {
    // Si aún carga, mejor permitir la navegación local (no obligar a login)
    router.push(route as any);
    return;
  }

  if (!sessionState.isAuthenticated) {
    // redirige a login y pasa from seguro
    const safeFrom = route.startsWith('/(tabs)') ? route : '/(tabs)';
    router.replace(`/auth/login?from=${encodeURIComponent(safeFrom)}` as any);
    return;
  }

  router.push(route as any);
}
```

3) Normalizar `from` en `QuickActionsSheet` (ejemplo)

```ts
// cuando abras el modal
const pathname = usePathname();
let safeFrom = pathname;
if (!safeFrom || safeFrom === '/' || safeFrom.startsWith('/(auth)')) safeFrom = '/(tabs)';
router.push({ pathname: '/modals/add-weight', params: { from: safeFrom } });
```

4) Cerrar modal en `AddWeight`

```ts
// al guardar o cerrar
const { from } = useLocalSearchParams();
const target = from && String(from) !== '/' ? String(from) : '/(tabs)';
router.replace(target as any);
```

Index vs `home` explícito
- Mantener `index.tsx` en `/(tabs)` es correcto y es la convención de `expo-router`.
- Si prefieres claridad o pasar `from` por una key, puedes crear `home.tsx` y usar `fromTab=home`. Es un cambio cosmético que ayuda a legibilidad.

Cuándo implementar cada cosa
- Ahora (antes de Auth0): aplica la recomendación mínima (normalizar `from`) — es rápidos y evita loops.
- Cuando integres Auth0: implementa `ProtectedLayout` y `safeNavigate` para centralizar la lógica de acceso.

Siguientes pasos sugeridos
1. ¿Quieres que implemente ahora el `safeNavigate` + normalización mínima en `QuickActionsSheet` y `AddWeight`? (rápido)
2. ¿O prefieres que cree el `ProtectedLayout` y actualice `/(tabs)/_layout.tsx` para envolver las pestañas? (más trabajo)

Notas finales
- Evita esparcir cheques de autenticación por toda la UI (BottomNav, accesos rápidos, etc.). Centraliza la política de acceso y usa `safeNavigate` cuando un componente necesita comportarse distinto.

---
Generado como guía práctica para integrar Auth0 y evitar loops de navegación.
