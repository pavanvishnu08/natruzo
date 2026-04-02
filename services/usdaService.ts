import { USDA_API_KEY, USDA_API_BASE_URL } from '../constants';
import { NutritionInfo } from '../types';

interface USDAFoodNutrient {
  nutrientId: number;
  nutrientName: string;
  value: number;
  unitName: string;
}

interface USDAFoodItem {
  fdcId: number;
  description: string;
  foodNutrients: USDAFoodNutrient[];
}

interface USDASearchResponse {
  foods: USDAFoodItem[];
}

// Nutrient IDs in USDA Standard Reference
const NUTRIENT_IDS = {
  ENERGY: 1008, // kcal (Energy)
  PROTEIN: 1003, // Protein
  FAT: 1004, // Total Lipid (fat)
  CARBS: 1005, // Carbohydrate, by difference
};

// Fallback for Energy if 1008 is missing (sometimes 2047 is used for Energy (Atwater Factors))
const ALT_ENERGY_ID = 2047;

export const fetchFoodNutrition = async (foodName: string): Promise<NutritionInfo | null> => {
  try {
    const params = new URLSearchParams({
      api_key: USDA_API_KEY,
      query: foodName,
      pageSize: '1',
      dataType: 'Foundation,Survey (FNDDS),Branded', // Prioritize quality databases
    });

    const response = await fetch(`${USDA_API_BASE_URL}?${params.toString()}`);

    if (!response.ok) {
      // Log warning instead of error to indicate this is handled by fallback
      console.warn(`USDA API Unavailable (${response.status}): Using AI fallback.`);
      return null;
    }

    const data: USDASearchResponse = await response.json();

    if (!data.foods || data.foods.length === 0) {
      return null;
    }

    const food = data.foods[0];
    const nutrients = food.foodNutrients;

    const getNutrientValue = (id: number): number => {
      const nutrient = nutrients.find((n) => n.nutrientId === id);
      return nutrient ? nutrient.value : 0;
    };

    let calories = getNutrientValue(NUTRIENT_IDS.ENERGY);
    if (calories === 0) calories = getNutrientValue(ALT_ENERGY_ID);

    return {
      calories: Math.round(calories),
      protein: Math.round(getNutrientValue(NUTRIENT_IDS.PROTEIN)),
      fats: Math.round(getNutrientValue(NUTRIENT_IDS.FAT)),
      carbs: Math.round(getNutrientValue(NUTRIENT_IDS.CARBS)),
    };

  } catch (error) {
    console.warn('Error fetching USDA data:', error);
    return null;
  }
};
