import { UserProfile, DailyTargets, NutritionInfo, Gender, Goal, ActivityLevel } from '../types';
import { ACTIVITY_MULTIPLIERS, GOAL_ADJUSTMENTS, MACRO_RATIOS, CALORIES_PER_GRAM, DEFAULT_HEIGHT } from '../constants';

export const calculateDailyTargets = (profile: UserProfile): DailyTargets => {
  // Fail-safe defaults
  const weight = profile.weight > 0 ? profile.weight : 70;
  const height = profile.height > 0 ? profile.height : DEFAULT_HEIGHT;
  const age = profile.age > 0 ? profile.age : 30;
  const gender = profile.gender || Gender.Male;
  const activity = profile.activityLevel || ActivityLevel.Moderate;
  const goal = profile.goal || Goal.Maintain;

  // 1. BMR Calculation (Mifflin-St Jeor Equation)
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  if (gender === Gender.Male) {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  // 2. Activity Multiplier
  const multiplier = ACTIVITY_MULTIPLIERS[activity];
  const tdee = Math.round(bmr * multiplier);

  // 3. Goal Adjustment
  const adjustment = GOAL_ADJUSTMENTS[goal];
  const targetCalories = tdee + adjustment;

  // 4. Macro Calculation
  const proteinCals = targetCalories * MACRO_RATIOS.protein;
  const carbsCals = targetCalories * MACRO_RATIOS.carbs;
  const fatsCals = targetCalories * MACRO_RATIOS.fats;

  const macros: NutritionInfo = {
    calories: targetCalories,
    protein: Math.round(proteinCals / CALORIES_PER_GRAM.protein),
    carbs: Math.round(carbsCals / CALORIES_PER_GRAM.carbs),
    fats: Math.round(fatsCals / CALORIES_PER_GRAM.fats),
  };

  return {
    tdee,
    targetCalories,
    macros,
  };
};
