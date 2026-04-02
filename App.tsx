import React, { useState } from 'react';
import { AppStep, UserProfile, Gender, ActivityLevel, Goal, InputMethod, AnalysisResult, DetectedFood, FoodItemInput, NutritionInfo } from './types';
import ProfileForm from './components/ProfileForm';
import FoodInput from './components/FoodInput';
import FoodReview from './components/FoodReview';
import ResultsView from './components/ResultsView';
import { calculateDailyTargets } from './services/nutritionCalculator';
import { fetchFoodNutrition } from './services/usdaService';
import { identifyFoodFromImage, parseFoodItemsFromText, generateMealPlanAndTips, estimateNutrition } from './services/geminiService';
import { Leaf, ChevronRight, User } from 'lucide-react';

function App() {
  const [step, setStep] = useState<AppStep>('profile');
  
  // Profile State
  const [profile, setProfile] = useState<UserProfile>({
    age: 0,
    weight: 0,
    height: 0,
    gender: Gender.Male,
    activityLevel: ActivityLevel.Moderate,
    goal: Goal.Maintain,
  });

  // Food Items Input State
  const [inputItems, setInputItems] = useState<FoodItemInput[]>([]);

  // Analysis Result State
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProfileNext = () => {
    setStep('input');
  };

  const handleInputAnalyze = async (method: InputMethod, data: string) => {
    setIsProcessing(true);
    try {
      let items: FoodItemInput[] = [];
      if (method === InputMethod.Image) {
        items = await identifyFoodFromImage(data);
      } else {
        items = await parseFoodItemsFromText(data);
      }
      setInputItems(items);
      setStep('review');
    } catch (error) {
      console.error("Identification failed", error);
      alert("Could not identify foods. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalCalculation = async () => {
    setIsProcessing(true);
    try {
      // 1. Calculate Targets
      const targets = calculateDailyTargets(profile);

      // 2. Fetch Nutrition for each item
      const detectedFoods: DetectedFood[] = [];
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFats = 0;

      for (const item of inputItems) {
        // Attempt to fetch from USDA Database
        let nutritionPer100g = await fetchFoodNutrition(item.name);

        // Fallback to AI Estimation if USDA fails or food not found
        if (!nutritionPer100g) {
          nutritionPer100g = await estimateNutrition(item.name);
        }

        // Safety fallback to zeros if both fail (unlikely)
        const baseNutrition = nutritionPer100g || { calories: 0, protein: 0, carbs: 0, fats: 0 };
        
        const weightInGrams = item.unit === 'kg' ? item.weight * 1000 : item.weight;
        const multiplier = weightInGrams / 100;

        const totalItemNutrition: NutritionInfo = {
          calories: Math.round(baseNutrition.calories * multiplier),
          protein: Math.round(baseNutrition.protein * multiplier),
          carbs: Math.round(baseNutrition.carbs * multiplier),
          fats: Math.round(baseNutrition.fats * multiplier),
        };

        totalCalories += totalItemNutrition.calories;
        totalProtein += totalItemNutrition.protein;
        totalCarbs += totalItemNutrition.carbs;
        totalFats += totalItemNutrition.fats;

        detectedFoods.push({
          name: item.name,
          inputWeight: item.weight,
          inputUnit: item.unit,
          weightInGrams: weightInGrams,
          nutritionPer100g: baseNutrition,
          totalNutrition: totalItemNutrition
        });
      }

      // 3. Generate Analysis
      const eatenNames = detectedFoods.map(f => f.name);
      const { mealPlan, tips, guidance, exercises } = await generateMealPlanAndTips(targets, eatenNames);

      setResult({
        targets,
        foods: detectedFoods,
        totalNutrition: {
           calories: totalCalories,
           protein: totalProtein,
           carbs: totalCarbs,
           fats: totalFats
        },
        mealPlan,
        tips,
        guidance,
        exercises: exercises || []
      });

      setStep('results');

    } catch (error) {
      console.error("Final calculation failed", error);
      alert("Calculation failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setStep('profile');
    setResult(null);
    setInputItems([]);
  };

  const getStepIndicator = () => {
    const steps = ['Profile', 'Input', 'Review', 'Results'];
    const currentIdx = ['profile', 'input', 'review', 'results'].indexOf(step);
    
    return (
      <div className="hidden md:flex items-center space-x-2 text-sm">
        {steps.map((s, idx) => (
          <React.Fragment key={s}>
            <span className={`font-medium ${idx <= currentIdx ? 'text-sky-700' : 'text-slate-300'}`}>
              {s}
            </span>
            {idx < steps.length - 1 && <ChevronRight className="w-4 h-4 text-slate-300" />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800">
      
      {/* Professional Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center shadow-lg shadow-sky-600/20">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">Nutrazo</span>
          </div>
          
          {getStepIndicator()}

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
              <User className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col justify-center">
        <div className="w-full max-w-5xl mx-auto transition-all duration-500 ease-in-out">
          {step === 'profile' && (
            <ProfileForm 
              profile={profile} 
              setProfile={setProfile} 
              onNext={handleProfileNext} 
            />
          )}

          {step === 'input' && (
            <FoodInput 
              onAnalyze={handleInputAnalyze} 
              isAnalyzing={isProcessing} 
            />
          )}

          {step === 'review' && (
            <FoodReview 
              items={inputItems}
              setItems={setInputItems}
              onCalculate={handleFinalCalculation}
              isCalculating={isProcessing}
            />
          )}

          {step === 'results' && result && (
            <ResultsView 
              result={result} 
              onReset={handleReset} 
            />
          )}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-8 text-center text-slate-400 text-xs font-medium">
        <p>© 2024 Nutrazo AI Health. Data provided by USDA & Gemini.</p>
      </footer>

    </div>
  );
}

export default App;
