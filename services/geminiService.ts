import { GoogleGenAI, Type } from "@google/genai";
import { DailyTargets, MealPlan, FoodItemInput, ExerciseSuggestion, NutritionInfo } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Helper to clean JSON string (extracts from code blocks if present)
const cleanJsonString = (str: string) => {
  // Try to find JSON inside code blocks first
  const match = str.match(/```json\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    return match[1].trim();
  }
  // Also try just ``` blocks
  const matchGeneric = str.match(/```\s*([\s\S]*?)\s*```/);
  if (matchGeneric && matchGeneric[1]) {
    return matchGeneric[1].trim();
  }
  // Fallback: assume the whole string is JSON but might have some artifacts
  return str.replace(/```json|```/g, '').trim();
};

// Parse text/voice input into structured items
export const parseFoodItemsFromText = async (textInput: string): Promise<FoodItemInput[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Analyze the following text and extract ALL individual food items mentioned.
        Input Text: "${textInput}"
        
        Instructions:
        1. Identify every distinct food item. If the user lists multiple things (e.g., "Eggs, Toast, Coffee"), extract them as separate objects.
        2. If a dish is composite (e.g., "Rice and Curry"), split it into "Rice" and "Curry" unless it's a specific single dish name (e.g., "Biryani").
        3. Estimate the quantity/weight in grams (g) for each item based on standard serving sizes.
           - "Bowl" / "Katori" -> 300g
           - "Cup" -> 200g
           - "Plate" -> 450g
           - "Piece" / "Slice" -> 40-50g
           - "Spoon" -> 15g
        4. Assign a user-friendly "portionLabel" (e.g., "Medium Bowl", "1 Slice").
        
        Return a strict JSON array of objects.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              weight: { type: Type.NUMBER },
              unit: { type: Type.STRING, enum: ['g', 'kg'] },
              portionLabel: { type: Type.STRING }
            }
          }
        }
      }
    });

    const rawText = response.text || '[]';
    const items = JSON.parse(cleanJsonString(rawText));

    return items.map((item: any, index: number) => ({
      ...item,
      id: Date.now().toString() + index, // Ensure unique IDs
      weight: item.weight || 100,
      unit: item.unit === 'kg' ? 'kg' : 'g',
      portionLabel: item.portionLabel || 'Standard Portion'
    }));

  } catch (error) {
    console.error("Gemini Parse Error:", error);
    
    // Fallback: Try to manually split by comma or ' and ' if parsing fails
    const splitItems = textInput.split(/,| and /i).map(s => s.trim()).filter(s => s.length > 0);
    
    if (splitItems.length > 0) {
      return splitItems.map((name, index) => ({
        id: Date.now().toString() + index,
        name: name,
        weight: 300,
        unit: 'g',
        portionLabel: 'Standard Portion'
      }));
    }

    return [{
      id: Date.now().toString(),
      name: textInput,
      weight: 300,
      unit: 'g',
      portionLabel: 'Standard Portion'
    }];
  }
};

export const identifyFoodFromImage = async (base64Image: string): Promise<FoodItemInput[]> => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: `
              Look at this food image. Identify ALL distinct food items visible.
              For each item:
              1. Name the item clearly.
              2. Estimate its weight in grams.
              3. Provide a portion label (e.g. "Small Bowl", "1 Piece").
              
              Return a strict JSON array of objects.
            `
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    weight: { type: Type.NUMBER },
                    unit: { type: Type.STRING, enum: ['g', 'kg'] },
                    portionLabel: { type: Type.STRING }
                }
            }
        }
      }
    });

    const rawText = response.text || '[]';
    const items = JSON.parse(cleanJsonString(rawText));
    
    return items.map((item: any, index: number) => ({
      id: Date.now().toString() + index,
      name: item.name || "Unknown Food",
      weight: item.weight || 100,
      unit: item.unit === 'kg' ? 'kg' : 'g',
      portionLabel: item.portionLabel || 'Standard Portion'
    }));

  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return [{ id: Date.now().toString(), name: "Unknown Food", weight: 100, unit: 'g', portionLabel: 'Standard Portion' }];
  }
};

export const estimateNutrition = async (foodName: string): Promise<NutritionInfo> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Estimate the nutritional values for 100 grams of "${foodName}".
        Return a strict JSON object with values for: calories, protein, carbs, fats.
        Values should be numbers (integers or decimals).
        Be reasonably accurate based on general food data.
        Example: { "calories": 130, "protein": 3.5, "carbs": 28, "fats": 0.5 }
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fats: { type: Type.NUMBER },
          }
        }
      }
    });

    const text = response.text || '{}';
    const json = JSON.parse(cleanJsonString(text));
    
    return {
      calories: Number(json.calories) || 0,
      protein: Number(json.protein) || 0,
      carbs: Number(json.carbs) || 0,
      fats: Number(json.fats) || 0
    };

  } catch (error) {
    console.error("Gemini Nutrition Est Error:", error);
    return { calories: 0, protein: 0, carbs: 0, fats: 0 };
  }
};

export const generateMealPlanAndTips = async (targets: DailyTargets, consumedItems: string[]): Promise<{ mealPlan: MealPlan, tips: string[], guidance: string[], exercises: ExerciseSuggestion[] }> => {
  try {
    const consumedText = consumedItems.join(", ");
    const prompt = `
      Act as Nutrazo. User consumed: ${consumedText}.
      Daily Goals: ${targets.targetCalories} kcal (P:${targets.macros.protein}g, C:${targets.macros.carbs}g, F:${targets.macros.fats}g).

      Generate:
      1. Meal plan for the REST of the day (filling remaining calories).
      2. 3 Actionable Guidance steps.
      3. 3 General Health Tips.
      4. 3 Exercise suggestions to help balance this intake.

      Return strictly JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mealPlan: {
              type: Type.OBJECT,
              properties: {
                breakfast: { type: Type.OBJECT, properties: { meal: { type: Type.STRING }, description: { type: Type.STRING }, calories: { type: Type.INTEGER } } },
                lunch: { type: Type.OBJECT, properties: { meal: { type: Type.STRING }, description: { type: Type.STRING }, calories: { type: Type.INTEGER } } },
                snack: { type: Type.OBJECT, properties: { meal: { type: Type.STRING }, description: { type: Type.STRING }, calories: { type: Type.INTEGER } } },
                dinner: { type: Type.OBJECT, properties: { meal: { type: Type.STRING }, description: { type: Type.STRING }, calories: { type: Type.INTEGER } } }
              }
            },
            guidance: { type: Type.ARRAY, items: { type: Type.STRING } },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  activity: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  caloriesBurned: { type: Type.INTEGER }
                }
              }
            }
          }
        }
      }
    });

    const rawText = response.text || '{}';
    return JSON.parse(cleanJsonString(rawText));

  } catch (error) {
    console.error("Gemini Planning Error:", error);
    return {
      mealPlan: {
        breakfast: { meal: "Oatmeal", description: "Oats with berries", calories: 300 },
        lunch: { meal: "Balanced Bowl", description: "Rice and Veggies", calories: 500 },
        snack: { meal: "Fruit", description: "An apple", calories: 100 },
        dinner: { meal: "Light Salad", description: "Mixed greens", calories: 300 },
      },
      guidance: ["Prioritize protein.", "Drink water.", "Eat mindfuly."],
      tips: ["Walk daily.", "Sleep well.", "Avoid sugar."],
      exercises: [
        { activity: "Brisk Walking", duration: "30 mins", caloriesBurned: 150 },
        { activity: "Yoga", duration: "20 mins", caloriesBurned: 100 },
        { activity: "Stretching", duration: "10 mins", caloriesBurned: 50 }
      ]
    };
  }
};
