// In a real app, these should be securely managed.
// The prompt explicitly provides this USDA API key for the task.
export const USDA_API_KEY = "lgQvMosXBR51gJRNIxKN1cQxrOENxdaOdXphanvP";
export const USDA_API_BASE_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";

export const DEFAULT_HEIGHT = 170;

export const ACTIVITY_MULTIPLIERS = {
  low: 1.2,
  moderate: 1.55,
  active: 1.75,
};

export const GOAL_ADJUSTMENTS = {
  loss: -500,
  gain: 300,
  maintain: 0,
};

export const MACRO_RATIOS = {
  protein: 0.25,
  carbs: 0.50,
  fats: 0.25,
};

export const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fats: 9,
};

export const MEAL_CALORIE_DISTRIBUTION = {
  breakfast: 0.25,
  lunch: 0.35,
  snack: 0.15,
  dinner: 0.25,
};
