export enum Gender {
  Male = 'male',
  Female = 'female',
}

export enum ActivityLevel {
  Low = 'low',
  Moderate = 'moderate',
  Active = 'active',
}

export enum Goal {
  Maintain = 'maintain',
  WeightLoss = 'loss',
  WeightGain = 'gain',
}

export enum InputMethod {
  Text = 'text',
  Voice = 'voice',
  Image = 'image',
}

export interface UserProfile {
  age: number;
  weight: number; // kg
  height: number; // cm
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: Goal;
}

export interface NutritionInfo {
  calories: number;
  protein: number; // g
  carbs: number; // g
  fats: number; // g
}

export interface DailyTargets {
  tdee: number;
  targetCalories: number;
  macros: NutritionInfo;
}

// Used during the Review/Input phase
export interface FoodItemInput {
  id: string;
  name: string;
  weight: number;
  unit: 'g' | 'kg';
  portionLabel?: string; // e.g., "Medium Bowl"
}

// Used for the final analysis
export interface DetectedFood {
  name: string;
  inputWeight: number;
  inputUnit: 'g' | 'kg';
  weightInGrams: number;
  nutritionPer100g: NutritionInfo;
  totalNutrition: NutritionInfo;
}

export interface MealPlanItem {
  meal: string;
  description: string;
  calories: number;
}

export interface MealPlan {
  breakfast: MealPlanItem;
  lunch: MealPlanItem;
  snack: MealPlanItem;
  dinner: MealPlanItem;
}

export interface ExerciseSuggestion {
  activity: string;
  duration: string;
  caloriesBurned: number;
}

export interface AnalysisResult {
  targets: DailyTargets;
  foods: DetectedFood[];
  totalNutrition: NutritionInfo;
  mealPlan: MealPlan;
  guidance: string[];
  tips: string[];
  exercises: ExerciseSuggestion[];
}

export type AppStep = 'profile' | 'input' | 'review' | 'processing' | 'results';
