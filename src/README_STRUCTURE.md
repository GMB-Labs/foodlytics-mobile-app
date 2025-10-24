# **Foodlytics – Estructura y Guía del Proyecto**

Este documento resume **cómo está organizado el código**, **quién es dueño de cada flujo** y **reglas de negocio** que deben respetarse en toda la app.

## **0\) Stack y convenciones**

* **Expo \+ React Native \+ TypeScript**

* **Expo Router** para navegación por archivos en `src/app`

* **Arquitectura por features (DDD light)**: `features/{feature}/{application,domain,infrastructure,ui}`

* **UI** con **NativeWind** (Tailwind RN)

* Estado recomendado:

  * **TanStack Query** para datos remotos / caché

  * **Zustand** para estados locales cross-screen (p. ej. resultados de cámara)

* **Rutas** exportan pantallas desde `features/*/ui/screens` (evitar lógica en `src/app`)

* **Regla global de creación**: solo se **CREA/REGISTRA** para **HOY** (días pasados \= **solo lectura**)

---

## **1\) Mapa de carpetas (alto nivel)**

`src/`

  `app/               # Rutas (Expo Router)`

  `core/              # Tipos/ambientación global mínima`

  `features/          # Módulos de dominio (dueños de reglas)`

  `shared/            # Utilidades y UI genérica (sin reglas de negocio)`

### **1.1 `src/app/` (Rutas)**

* `onboarding/` – flujo inicial (única vez): pasos DOB, género, altura, peso, peso objetivo, actividad, resumen.

* `(tabs)/` – layout de bottom tabs:

  * `index.tsx` → **Home** (widgets: Calorías, Macros, IMC) \+ “Comidas de Hoy”

  * `meals.tsx` → **Comidas** (solo HOY para crear, pasado lectura)

  * `activity.tsx` → **Actividad / Progreso** (toggle interno)

  * `profile.tsx` → **Perfil**

* `camera/`

  * `index.tsx` → **Tomar foto** (params: `dateISO`, `mealType?`)

  * `result.tsx` → **Resultado IA** \+ editar porciones \+ elegir `mealType` si falta \+ Confirmar

* `modals/`

  * `add-activity.tsx` – registrar actividad

  * `add-weight.tsx` – registrar peso (hoy)

  * `edit-goals.tsx` – ajustar metas diarias

**Regla de navegación clave**: `/camera` y modals deben forzar/validar **HOY** (ver reglas de negocio).

### **1.2 `src/features/` (Dueños de reglas)**

Cada feature se compone de:

`features/{feature}/`

  `application/     # Casos de uso (orquestación)`

  `domain/          # Modelos y tipos del dominio (sin dependencias)`

  `infrastructure/  # Integraciones (APIs, storage, permisos)`

  `ui/              # Pantallas/Componentes propios del feature`

**Features actuales:**

* `iam/` – identidad de usuario (opcional por ahora)

* `onboarding/` – flujo inicial y cálculo de metas base

* `meals/` – registro y consulta de comidas (owner del guard de “solo hoy”)

* `vision/` – cámara e IA (detecta → produce items; guarda lo hace `meals`)

* `activity/` – registro y resumen de actividad del día \+ stats y racha

* `weight/` – registro de peso (histórico) y consulta del último

* `goals/` – metas nutricionales (kcal / P / C / G)

* `profile/` – datos personales e IMC

* `progress/` – series de peso 7d y cumplimiento semanal (agregador)

### **1.3 `src/shared/` (Genéricos sin reglas de negocio)**

* `constants/` – enums, nombres de rutas, colores

* `hooks/` – hooks globales (`useTodayISO`, `useSession`, `useToast`)

* `utils/` – helpers (`date.ts`, `bmi.ts`, `nutrition.ts`)

* `types/` – contratos compartidos simples (MealEntry, WeightEntry, Goals, Profile…)

* `ui/` – componentes UI base (Button, Card, Chip, Modal, Chart)

---

## **2\) Propiedad de pantallas (quién renderiza)**

| Ruta | Pantalla exportada | Feature dueño |
| ----- | ----- | ----- |
| `/onboarding/*` | wizard de pasos | `onboarding` (usa `goals` y `profile`) |
| `/` (Home) | widgets \+ “Comidas de Hoy” | `home` (puede vivir como UI dentro de `features/meals/activity/goals/profile`) |
| `/meals` | lista de hoy \+ botones `+` por tipo | `meals` |
| `/camera` | cámara | `vision` (guarda con `meals`) |
| `/camera/result` | resultado IA \+ confirmar | `vision` \+ `meals` |
| `/activity` | Actividad / Progreso (toggle) | `activity` \+ `progress` |
| `/profile` | Perfil (ver/editar) | `profile` |

En `src/app/...` los archivos suelen ser “proxis” que hacen `export { default } from "@/features/xxx/ui/screens/...";`

---

## **3\) Reglas de negocio (must)**

1. **Solo HOY**: `saveMeal`, `saveActivity`, `saveWeight` **deben** validar `dateISO == todayISO()`

   * UI también bloquea (deshabilita botones si no es hoy), pero la **validación final vive en application/**.

2. **Onboarding**: corre 1 sola vez, guarda `hasCompletedOnboarding`. Calcula IMC y metas iniciales.

3. **Tipos de comida**:

   * Si entras desde Home/Meals → el **mealType** se conoce (por contexto).

   * Si entras desde **Acción rápida (+)** → se elige en `camera/result` antes de confirmar.

4. **Histórico**: días pasados son **solo lectura** (ver comidas/actividades/pesos ya guardados; sin crear nuevos).

5. **Perfil**: editar **altura** y **peso** actual. IMC se recalcula. Metas pueden recalcularse o ajustarse manualmente.

6. **Sincronización**: al guardar en un módulo, **invalidar/actualizar** widgets dependientes (Home, Progreso, Perfil).

---

## **4\) Contratos de datos (resumen)**

Detallados en `src/shared/types/*.ts`. Aquí un resumen funcional (campos clave):

* **Meal**: `{ dateISO, mealType: "breakfast"|"lunch"|"dinner", items: DetectedItem[] }`  
   `DetectedItem`: `{ name, qty, unit, kcal, p, c, f }`

* **ActivityEntry**: `{ dateISO, type, durationMin, intensity, kcal }`

* **WeightEntry**: `{ dateISO, valueKg }` (+`profile.weightKg` se actualiza al guardar)

* **Goals**: `{ kcalTarget, proteinG, carbsG, fatG }`

* **UserProfile**: `{ birthDate, gender, heightCm, weightKg }` → IMC derivado

---

## **5\) Navegación: parámetros estándar**

* `dateISO`: **siempre** en flujos de creación (si falta, el Router lo fuerza a HOY).  
   Formato `YYYY-MM-DD` calculado **en zona local** (no UTC puro).

* `mealType?`: requerido solo cuando el flujo ya lo conoce (Home/Meals).  
   Si falta (Acción rápida), se solicita en `camera/result`.

---

## **6\) Flujo por dominio (resumen operativo)**

**Onboarding → Perfil \+ Metas**

1. Usuario completa pasos → `onboarding.application.completeOnboarding()`

2. Setea `profile`, calcula IMC y `goals.computeTargets()`

3. `hasCompletedOnboarding = true` → navega a Home

**Comidas**

* Desde Home/Meals: abrir `/camera` con `{ dateISO: hoy, mealType }`

* Desde `+` (rápido): abrir `/camera` con `{ dateISO: hoy }` → elegir `mealType` al confirmar

* Confirmar → `meals.application.saveMeal()` (valida HOY)

**Actividad**

* Desde `+` o botón en tab → `modals/add-activity`

* Confirmar → `activity.application.saveActivity()` (HOY)

* Actualiza: Home (kcal quemadas), Activity tab, Progreso

**Peso**

* Desde `+` o Progreso → `modals/add-weight`

* Confirmar → `weight.application.saveWeight()` (HOY) \+ actualiza `profile.weightKg`

* Actualiza: Progreso (peso 7d), Home (IMC), Perfil

**Metas**

* Desde `+` o Progreso/Perfil → `modals/edit-goals`

* Confirmar → `goals.application.updateGoals()`

* Actualiza: Home (targets), Progreso, Perfil

---

## **7\) UI y estilo**

* **NativeWind**: componentes en `shared/ui/*` (Button, Card, Chip, Modal, Chart)

* **Accesibilidad**: botones clave con `accessibilityLabel` y `hitSlop` generoso

* **Temas**: colores/tokens en `shared/constants`

---

## **8\) Calidad y pruebas**

* **Casos de uso** en `application/` probados con **mocks** de `infrastructure/`

* Simular escenarios:

  * Crear con fecha ≠ HOY → debe fallar

  * Entrar a `/camera` sin `dateISO` → se fuerza HOY

  * Guardar comida desde Acciones rápidas → exige elegir `mealType`

  * Editar altura/peso → recalcula IMC y refresca widgets

---

## **9\) Mantenimiento**

* **Un feature \= un dueño**. Si una pantalla necesita datos de otro feature, **usa su caso de uso** (no duplicar lógica).

* **No** meter reglas de negocio en `shared/*` (solo helpers puros).

* Siempre validar reglas críticas **en `application/`**, aunque la UI intente prevenirlo.

---

## **10\) Glosario**

* **HOY**: fecha local (`todayISO()`), no `new Date().toISOString()` (UTC).

* **IMC**: calculado con `bmi.ts` y label (`Bajo`, `Normal`, `Sobrepeso`, `Obesidad`).

* **Acciones rápidas (+)**: accesos uniformes a registrar Comida, Peso, Actividad y Ajustar Metas.

---

Cualquier carpeta nueva debe seguir este esquema.  
 Si un feature crece, prioriza **application/** y **domain/** como fuentes de verdad; **ui/** no debe romper reglas de negocio.

## **11\) Árbol de carpetas/archivos** 

src/

├─ app/                                   \# Expo Router

│  ├─ \_layout.tsx                         \# TODO: Stack raíz

│  ├─ (auth)/                             \# (opcional si aún no hay login)

│  │  ├─ \_layout.tsx                      \# TODO: Stack Auth

│  │  ├─ login.tsx                        \# TODO: pantalla Login

│  │  └─ register.tsx                     \# TODO: pantalla Registro

│  ├─ onboarding/                         \# Flujo inicial (1 sola vez)

│  │  ├─ \_layout.tsx                      \# TODO: Stack Onboarding

│  │  ├─ step-dob.tsx                     \# TODO: Fecha de nacimiento

│  │  ├─ step-gender.tsx                  \# TODO: Género

│  │  ├─ step-height.tsx                  \# TODO: Altura

│  │  ├─ step-weight.tsx                  \# TODO: Peso actual

│  │  ├─ step-goal-weight.tsx             \# TODO: Peso objetivo

│  │  ├─ step-activity-level.tsx          \# TODO: Nivel de actividad

│  │  └─ summary.tsx                      \# TODO: Metas calculadas (IMC/targets)

│  ├─ (tabs)/                             \# Bottom Tabs

│  │  ├─ \_layout.tsx                      \# TODO: \<Tabs/\> Inicio/Comidas/Actividad/Perfil + botón flotante “+” (no es tab)

│  │  ├─ index.tsx                        \# TODO: Home (widgets: kcal/macros/IMC) \+ Comidas de hoy

│  │  ├─ meals.tsx                        \# TODO: Registro de comidas (solo HOY, lectura pasado)

│  │  ├─ activity.tsx                     \# TODO: Vista "Actividad / Progreso" (toggle interno)

│  │  └─ profile.tsx                      \# TODO: Perfil (ver/editar)

│  ├─ camera/                             \# Flujo cámara → IA → confirmar

│  │  ├─ index.tsx                        \# TODO: Tomar foto (params: dateISO, mealType?)

│  │  └─ result.tsx                       \# TODO: Editar porciones \+ elegir mealType si falta \+ Confirmar

│  └─ modals/                             \# Acciones rápidas (modal screens)  se abren desde el “+”

│     ├─ fast-action.tsx               \#  Acciones Rápidas (overlay 4 opciones)

│     ├─ add-activity.tsx                 \# TODO: Registrar Actividad (tipo/duración/intensidad)

│     ├─ add-weight.tsx                   \# TODO: Registrar Peso (solo hoy)

│     └─ edit-goals.tsx                   \# TODO: Ajustar Metas diarias

│

├─ core/

│  ├─ types/

│  │  └─ index.d.ts                       \# TODO: Tipos globales si necesitas

│  └─ assets.d.ts                         \# (ya lo tienes) d.ts para imports de assets

│

├─ features/

│  ├─ iam/

│  │  ├─ application/                     \# use-cases: signIn, signOut, getSession

│  │  │  └─ README.md

│  │  ├─ domain/                          \# User, Session

│  │  │  └─ README.md

│  │  ├─ infrastructure/                  \# AuthAPI, SecureStorage

│  │  │  └─ README.md

│  │  └─ ui/                              \# screens/components (si usas Auth)

│  │     └─ README.md

│  ├─ onboarding/

│  │  ├─ application/                     \# computeInitialGoals, completeOnboarding

│  │  ├─ domain/                          \# ProfileDraft

│  │  ├─ infrastructure/

│  │  └─ ui/

│  ├─ meals/

│  │  ├─ application/                     \# saveMeal, getMealsByDate (solo HOY crea)

│  │  ├─ domain/                          \# Meal, MealItem, NutritionTotals

│  │  ├─ infrastructure/                  \# MealsAPI, cache

│  │  └─ ui/

│  ├─ vision/                             \# # cámara/IA

│  │  ├─ application/                     \# detectFoodFromImage

│  │  ├─ domain/                          \# Detection, FoodPortion

│  │  ├─ infrastructure/                  \# VisionAPI, permisos cámara

│  │  └─ ui/

│  ├─ activity/

│  │  ├─ application/                     \# saveActivity, getDailyActivity, getActivityStats

│  │  ├─ domain/                          \# ActivityEntry, Intensity, ActivityStats, Streak

│  │  ├─ infrastructure/

│  │  └─ ui/

│  ├─ weight/

│  │  ├─ application/                     \# saveWeight, getLastWeight

│  │  ├─ domain/                          \# WeightEntry

│  │  ├─ infrastructure/

│  │  └─ ui/

│  ├─ goals/

│  │  ├─ application/                     \# getGoals, updateGoals, computeTargets

│  │  ├─ domain/                          \# Goals, DailyTargets

│  │  ├─ infrastructure/

│  │  └─ ui/

│  ├─ profile/

│  │  ├─ application/                     \# getProfile, updateProfilePartial

│  │  ├─ domain/                          \# UserProfile (birthDate→edad, sexo, altura, peso)

│  │  ├─ infrastructure/

│  │  └─ ui/

│  └─ progress/

│     ├─ application/                     \# getWeightSeries7d, getWeeklyCompliance

│     ├─ domain/                          \# TimeSeriesPoint, Compliance

│     └─ ui/                              \# gráficos y tarjetas

│

├─ shared/

│  ├─ constants/

│  │  ├─ enums.ts                         \# TODO: MealType, ActivityType, Intensity

│  │  └─ routes.ts                        \# TODO: helpers de rutas si quieres

│  ├─ hooks/

│  │  ├─ useSession.ts                    \# TODO: sesión usuario actual

│  │  ├─ useTodayISO.ts                   \# TODO: fecha local “hoy”

│  │  └─ useToast.ts                      \# TODO: toasts/snackbars

│  ├─ utils/

│  │  ├─ date.ts                          \# todayISO(), isTodayISO(), toLocalISO()

│  │  ├─ bmi.ts                           \# calcBMI() {bmi, label}

│  │  └─ nutrition.ts                     \# helpers de macros/kcal si quieres

│  ├─ types/

│  │  ├─ meal.ts                          \# SaveMealPayload, MealEntry, DetectedItem

│  │  ├─ activity.ts                      \# ActivityEntry, ActivityStats

│  │  ├─ weight.ts                        \# WeightEntry

│  │  ├─ goals.ts                         \# Goals, DailyTargets

│  │  └─ profile.ts                       \# UserProfile

│  └─ ui/

│     ├─ Button.tsx                       \# Botón base

│     ├─ Card.tsx                         \# Tarjeta base

│     ├─ Chip.tsx                         \# Chips (ej. mealType)

│     ├─ Modal.tsx                        \# Wrapper modal

│     └─ Chart.tsx                        \# Wrapper de gráfico (si usarás recharts/victory)

│

└─ README\_STRUCTURE.md                    \# guía interna de esta estructura