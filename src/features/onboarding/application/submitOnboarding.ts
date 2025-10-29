import type { OnboardingState } from './store';
import { computeInitialGoals } from '@/src/features/goals/application/computeInitialGoals';
import { submitProfileToServer } from '@/src/features/onboarding/infrastructure/profileApi';
import { submitTargetsToServer } from '@/src/features/onboarding/infrastructure/targetsApi';
import { calcBMI } from '@/src/shared/utils/bmi';

/**
 * Application-level use case: submit onboarding.
 *
 * Responsibilities:
 * - Decide which fields are safe to send to server (transform/omit local-only fields)
 * - Coordinate calls to infrastructure (APIs) and other application services
 * - Implement retries/metrics/telemetry where needed (out of scope here)
 */
export async function submitOnboarding(state: OnboardingState, opts?: { baseUrl?: string; token?: string }) {
  // Build DTO: include only the fields that are meant to be sent to backend.
  // IMPORTANT: If you have fields that must remain local (device tokens, ephemeral flags,
  // or local-only feature toggles), do NOT include them here.
  // Build profile DTO (these values go to Profile service)
  const profileDto = {
    birthDate: state.birthDate ?? null,
    gender: state.gender ?? null,
    heightCm: state.heightCm ?? null,
    weightKg: state.weightKg ?? null,
    goalWeightKg: state.goalWeightKg ?? null,
  };

  // Compute goals locally
  const goals = computeInitialGoals({
    birthDateIso: state.birthDate,
    gender: state.gender as any,
    heightCm: state.heightCm,
    weightKg: state.weightKg,
    activityLevel: state.activityLevel as any,
  });

  // Compute BMI if possible
  let bmi: { bmi: number; label: string } | null = null;
  if (typeof state.heightCm === 'number' && typeof state.weightKg === 'number') {
    bmi = calcBMI(state.heightCm, state.weightKg);
  }

  const targetsDto = {
    kcalTarget: goals.kcalTarget,
    proteinG: goals.proteinG,
    carbsG: goals.carbsG,
    fatsG: goals.fatsG,
    bmi: bmi,
  };

  // Call infrastructure adapters: profile and targets
  const profileRes = await submitProfileToServer(profileDto, opts);
  const targetsRes = await submitTargetsToServer(targetsDto, opts);

  return { profile: profileRes, targets: targetsRes };
}
