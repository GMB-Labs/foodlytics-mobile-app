/**
 * Consolidated Profile types used across the application
 * Single source of truth for profile-related types
 */

/**
 * Profile DTO from backend API
 * Matches the structure returned by /api/v1/profiles/{userId}
 */
export type ProfileDto = {
  user_id?: string;
  user_profile_completed?: boolean | null;
  first_name?: string | null;
  last_name?: string | null;
  age?: number | null;
  gender?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  desired_weight_kg?: number | null;
  activity_level?: string | null;
  goal_type?: string | null;
  daily_calories?: number | null;
  has_profile_picture?: boolean | null;
  profile_picture_url?: string | null;
  nutritionist_id?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

/**
 * User profile stored in session state
 * Frontend-friendly structure
 */
export type UserProfile = {
  id?: string;
  email?: string;
  name?: string;
  age?: number;
  gender?: string;
  heightCm?: number;
  weightKg?: number;
  goalWeight?: number;
  activity?: string;
  goalType?: string;
  dailyCalories?: number;
  hasProfilePicture?: boolean;
  avatar?: string | null;
  nutritionistId?: string | null;
  user_profile_completed?: boolean;
  [key: string]: unknown;
};

/**
 * Profile fetch result from API
 */
export type ProfileFetchResult = {
  dto: ProfileDto | null;
  completion: boolean;
};

/**
 * Local profile state (used in profile feature)
 */
export type Profile = {
  name: string;
  email: string;
  avatar: string | null;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  goalWeight: number;
  activity: string;
  dailyCalories: number;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  calorieTargetsUpdatedAt?: string | null;
  goalType: string;
  nutritionistId: string | null;
  hasProfilePicture: boolean;
};

export const EMPTY_PROFILE: Profile = {
  name: '',
  email: '',
  avatar: null,
  age: 0,
  gender: '',
  heightCm: 0,
  weightKg: 0,
  bmi: 0,
  goalWeight: 0,
  activity: '',
  dailyCalories: 0,
  calories: 0,
  proteinGrams: 0,
  carbGrams: 0,
  fatGrams: 0,
  calorieTargetsUpdatedAt: null,
  goalType: '',
  nutritionistId: null,
  hasProfilePicture: false,
};

