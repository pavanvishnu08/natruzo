import React from 'react';
import { AnalysisResult, MealPlanItem } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Check, Droplet, Flame, Utensils, Zap, Repeat, Activity, Timer } from 'lucide-react';

interface ResultsViewProps {
  result: AnalysisResult;
  onReset: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ result, onReset }) => {
  const { targets, foods, totalNutrition, mealPlan, guidance, tips, exercises } = result;

  const macroData = [
    { name: 'Protein', value: totalNutrition.protein, color: '#6366f1' }, // Indigo-500
    { name: 'Carbs', value: totalNutrition.carbs, color: '#10b981' }, // Emerald-500
    { name: 'Fats', value: totalNutrition.fats, color: '#f59e0b' }, // Amber-500
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      
      {/* 1. Top Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Nutrition Report</h1>
          <p className="text-slate-500">Analysis for <span className="font-semibold text-slate-900">{foods.length} items</span> consumed.</p>
        </div>
        <button 
          onClick={onReset} 
          className="flex items-center px-5 py-2.5 bg-slate-50 text-slate-600 rounded-full text-sm font-semibold hover:bg-slate-100 transition-colors border border-slate-200"
        >
          <Repeat className="w-4 h-4 mr-2" /> Log Another Meal
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 2. Main Calorie Circle (Left Column) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
          
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 z-10">Calorie Intake</h3>
          
          <div className="w-64 h-64 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={85}
                  outerRadius={105}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={8}
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-5xl font-extrabold text-slate-900 tracking-tight">{totalNutrition.calories}</span>
              <span className="text-sm font-medium text-slate-400 mt-1">/ {targets.targetCalories} kcal</span>
            </div>
          </div>

          {/* Macro Pills */}
          <div className="grid grid-cols-3 gap-3 w-full mt-8 z-10">
            <div className="bg-indigo-50 p-3 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] font-bold text-indigo-400 uppercase">Protein</span>
              <span className="text-xl font-bold text-indigo-700">{totalNutrition.protein}g</span>
            </div>
            <div className="bg-emerald-50 p-3 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Carbs</span>
              <span className="text-xl font-bold text-emerald-700">{totalNutrition.carbs}g</span>
            </div>
            <div className="bg-amber-50 p-3 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] font-bold text-amber-400 uppercase">Fats</span>
              <span className="text-xl font-bold text-amber-700">{totalNutrition.fats}g</span>
            </div>
          </div>
        </div>

        {/* 3. Breakdown List (Right Column) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <Utensils className="w-5 h-5 mr-3 text-slate-400" /> Consumed Items
            </h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {foods.map((food, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <div className="font-semibold text-slate-900 capitalize text-lg">{food.name}</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">~{food.weightInGrams}g portion</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{food.totalNutrition.calories}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">kcal</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exercise Suggestions */}
          {exercises && exercises.length > 0 && (
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
               <div className="relative z-10">
                 <h3 className="font-bold flex items-center text-indigo-300 mb-4">
                   <Activity className="w-4 h-4 mr-2" /> Suggested Burn
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {exercises.map((ex, idx) => (
                      <div key={idx} className="bg-white/10 rounded-xl p-3 border border-white/5">
                        <div className="font-semibold text-sm">{ex.activity}</div>
                        <div className="flex justify-between items-end mt-2">
                           <span className="text-xs text-slate-400 flex items-center"><Timer className="w-3 h-3 mr-1" /> {ex.duration}</span>
                           <span className="text-xs font-bold text-indigo-300">-{ex.caloriesBurned}</span>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Meal Plan Grid */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-6 px-2">Recommended for Remainder of Day</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {(Object.entries(mealPlan) as [string, MealPlanItem][]).map(([key, item]) => (
            <div key={key} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors">
               <div className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest mb-3">{key}</div>
               <div className="font-bold text-slate-900 text-lg mb-1 leading-snug">{item.meal}</div>
               <div className="text-xs font-medium text-slate-400 mb-4">{item.calories} kcal</div>
               <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Tips & Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100">
           <h3 className="text-lg font-bold text-indigo-900 mb-6 flex items-center">
             <Zap className="w-5 h-5 mr-3 text-indigo-500" /> Action Plan
           </h3>
           <ul className="space-y-4">
             {guidance.map((step, idx) => (
               <li key={idx} className="flex items-start">
                 <div className="bg-white p-1 rounded-full mr-4 text-indigo-600 shadow-sm mt-0.5">
                   <Check className="w-3 h-3" />
                 </div>
                 <span className="text-indigo-800 font-medium leading-relaxed">{step}</span>
               </li>
             ))}
           </ul>
        </div>
        
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
             <Droplet className="w-5 h-5 mr-3 text-sky-500" /> Health Tips
           </h3>
           <ul className="space-y-4">
             {tips.map((tip, idx) => (
               <li key={idx} className="flex items-start text-slate-600">
                  <span className="mr-3 text-sky-500 font-bold">•</span>
                  <span className="leading-relaxed">{tip}</span>
               </li>
             ))}
           </ul>
        </div>
      </div>

    </div>
  );
};

export default ResultsView;
