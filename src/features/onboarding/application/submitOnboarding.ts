import type { OnboardingState } from './store';
import { submitProfileToServer } from '@/src/features/onboarding/infrastructure/profileApi';
import { calculateTargetsFromProfile } from '@/src/features/goals/application/calorieTargetService';

/**
 * Mapea ActivityLevel del frontend al formato del backend
 */
function mapActivityLevelToBackend(activityLevel?: string): string {
  const mapping: Record<string, string> = {
    sedentary: 'sedentario',
    light: 'ligero',
    ligera: 'ligero',
    moderate: 'moderado',
    active: 'activo',
    veryActive: 'muy_activo',
    'muy activo': 'muy_activo',
  };

  if (!activityLevel) return 'ligero'; // Por defecto
  return mapping[activityLevel.toLowerCase()] || 'ligero';
}

/**
 * Calcula la edad desde una fecha de nacimiento (YYYY-MM-DD)
 */
function calculateAge(birthDate?: string): number {
  if (!birthDate) return 0;
  
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Application-level use case: submit onboarding.
 *
 * Responsibilities:
 * - Decide which fields are safe to send to server (transform/omit local-only fields)
 * - Coordinate calls to infrastructure (APIs) and other application services
 * - Implement retries/metrics/telemetry where needed (out of scope here)
 */
export async function submitOnboarding(
  state: OnboardingState,
  opts?: { baseUrl?: string; token?: string; userId?: string }
) {
  if (!opts?.userId) {
    throw new Error('userId (authId) is required to submit onboarding');
  }

  // Calcular edad desde birthDate
  const age = calculateAge(state.birthDate);

  // Mapear activity_level al formato del backend
  const activityLevelBackend = mapActivityLevelToBackend(state.activityLevel);

  // Build profile DTO según el formato esperado por el backend
  const profileDto = {
    first_name: state.firstName || '',
    last_name: state.lastName || '',
    age: age || 0,
    gender: state.gender || '',
    user_profile_completed: true,
    height_cm: state.heightCm || 0,
    weight_kg: state.weightKg || 0,
    goal_type: 'maintenance', // Por defecto según requerimiento
    activity_level: activityLevelBackend,
    desired_weight_kg: state.goalWeightKg || state.weightKg || 0,
  };

  console.log('[submitOnboarding] Enviando datos al backend:', {
    userId: opts.userId,
    profileDto,
  });

  // Compute preview targets locally using the backend algorithm (for UI preview only)
  let previewTargets: any = null;
  try {
    previewTargets = calculateTargetsFromProfile({
      weightKg: profileDto.weight_kg,
      heightCm: profileDto.height_cm,
      age: profileDto.age || 0,
      gender: profileDto.gender as any,
      goalType: profileDto.goal_type as any,
      activityLevel: profileDto.activity_level as any,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[submitOnboarding] preview targets calculation failed', e);
  }

  // Send profile to backend (onboarding completion). Do NOT send preview targets — backend computes targets itself.
  const profileRes = await submitProfileToServer(profileDto, {
    ...opts,
    userId: opts.userId,
  });

  return { profile: profileRes, targets: previewTargets };
}
