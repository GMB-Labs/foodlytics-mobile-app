# Foodlytics Mobile App — Arquitectura y Guía

Aplicación construida con **Expo + React Native + Expo Router** para gestionar nutrición y hábitos. Este documento resume la arquitectura, estructura de carpetas, flujos clave y convenciones del proyecto.

---

## 🧱 Stack Principal

- **Expo SDK 54 / React Native 0.81** con `expo-router`
- **Auth0** (PKCE + AuthSession + SecureStore)
- **AsyncStorage/SecureStore** para persistencia
- **Expo Camera / Image / Notifications / Sensors**
- **NativeWind**, `expo-font`, `expo-linear-gradient`
- **EAS Build** para distribución

---

## 🗂️ Estructura de Carpetas

```
src/
├── app/                 # Rutas (expo-router)
│   ├── (auth)/          # Login/Register + layout público
│   ├── (tabs)/          # Tabs protegidos
│   ├── onboarding/      # Wizard onboarding
│   ├── camera/, modals/ # Flujos secundarios
│   ├── callback-logout.tsx # Handler deep link de logout
│   └── index.tsx        # Redirector raíz
│
├── features/            # Clean feature folders
│   ├── activity/
│   ├── meals/
│   ├── profile/
│   ├── onboarding/
│   ├── vision/
│   └── ...
│
├── shared/
│   ├── api/             # Gateways HTTP
│   ├── constants/       # api.ts, auth.ts, storage.ts
│   ├── hooks/           # useSession, useToast, etc.
│   ├── styles/          # ThemeProvider, tokens
│   ├── types/           # DTOs y tipos compartidos
│   ├── ui/              # Componentes comunes
│   └── utils/           # Helpers puros
│
├── core/                # Tipos globales (assets, módulos)
└── docs/                # Documentación adicional
```

Cada feature sigue `application / infrastructure / ui` para separar lógica, acceso a datos y componentes.

---

## 🔐 Autenticación y Sesión

1. `useSession.tsx` maneja Auth0:
   - PKCE con `expo-auth-session`
   - Persistencia de tokens en SecureStore (`SECURE_STORE_KEYS`)
   - Sesión en AsyncStorage (`ASYNC_STORAGE_KEYS.SESSION`)
2. Tras login:
   - `syncUserFromToken()` → `/api/v1/users-sync/sync`
   - `fetchProfileMetadata()` → `/api/v1/profiles/{sub}`
   - Se hidrata `session.userProfileCompleted`
3. Redirecciones:
   - `src/app/index.tsx`, `src/app/(auth)/_layout.tsx` y `src/app/(tabs)/_layout.tsx` deciden entre login, onboarding o tabs
4. Logout:
   - Limpia storage
   - Abre `Auth0 /v2/logout` → `foodlytics://callback-logout`
   - `src/app/callback-logout.tsx` redirige a login

**Env vars** (`.env`):
```
EXPO_PUBLIC_API_BASE=https://foodlytics-api-production.up.railway.app
EXPO_PUBLIC_AUTH0_DOMAIN=...
EXPO_PUBLIC_AUTH0_CLIENT_ID=...
EXPO_PUBLIC_AUTH0_AUDIENCE=...
```

---

## 🔗 Deep Linking

- Scheme principal: `foodlytics://`
- Configurado en `app.json`, `Info.plist`, `AndroidManifest.xml`
- `exp+foodlytics-app` reservado para Expo Dev Client
- Rutas especiales:
  - `foodlytics://callback` (AuthSession)
  - `foodlytics://callback-logout` (logout Auth0)

---

## 💾 Persistencia

`src/shared/constants/storage.ts` define todas las claves:

```ts
SECURE_STORE_KEYS = {
  ACCESS_TOKEN: 'foodlytics_access_token',
  ID_TOKEN: 'foodlytics_id_token',
  REFRESH_TOKEN: 'foodlytics_refresh_token',
}

ASYNC_STORAGE_KEYS = {
  SESSION: 'foodlytics_session',
  THEME: '@foodlytics:theme',
  LANGUAGE: '@foodlytics:language',
  NOTIFICATION_PREFS: '@foodlytics:notif_prefs',
  ACTIVITIES: '@foodlytics:activities',
  WEIGHTS: '@foodlytics:weights',
}
```

Reutiliza estas constantes para evitar “magic strings”.

---

## 🧭 Flujos Importantes

- **Onboarding**: `src/app/onboarding/` + `OnboardingProvider`
- **Tabs protegidos**: `src/app/(tabs)/_layout.tsx` + `shared/ui/BottomNav`
- **Visión / Cámara**: `src/app/camera/*` + `features/vision`
- **Modales**: `src/app/modals/*` (Expo Router stack)
- **Profile**: `features/profile` (state + API + UI)

---

## 🧰 Scripts

| Comando            | Descripción                                   |
|--------------------|-----------------------------------------------|
| `npm install`      | Instala dependencias                          |
| `npm start`        | Inicia Metro (Expo)                           |
| `npm run android`  | Build/run dev client Android                  |
| `npm run ios`      | Build/run dev client iOS                      |
| `npm run lint`     | Ejecuta ESLint                                |
| `npm run clean`    | Limpia caches `.expo` + reinstala dependencias |

> Para login real se requiere custom dev client (`npx expo run`) o build EAS. Expo Go no soporta Auth0 PKCE.

---

## ✅ Convenciones Clave

- Mantener lógica de Auth0 centralizada en `useSession`
- Consumir backend solo vía `shared/api/*` o `features/*/infrastructure`
- Tipos compartidos en `shared/types/*`
- Rutas nuevas → respetar estructura de `app/`
- Evitar `console.*` en producción
- Documentar cambios relevantes en este README

---

## 📚 Documentos útiles

- `docs/auth-routing.md`: explicación detallada de AuthSession + routing
- `eas.json`: perfiles de build
- `app.json`: configuración Expo (iconos, plugins, schemes)

---

¿Mejoras o dudas? Mantén este README actualizado para el equipo 💚
