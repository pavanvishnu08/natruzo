import React, { useState } from 'react';
import { FoodItemInput } from '../types';
import { Plus, X, Calculator, Loader2, ChefHat, PenLine } from 'lucide-react';

interface FoodReviewProps {
  items: FoodItemInput[];
  setItems: (items: FoodItemInput[]) => void;
  onCalculate: () => void;
  isCalculating: boolean;
}

const PORTION_OPTIONS = [
  { label: 'Small Side / Dip', weight: 150 },
  { label: 'Medium Bowl', weight: 300 },
  { label: 'Large Bowl', weight: 450 },
  { label: 'Full Meal Plate', weight: 600 },
  { label: '1 Cup', weight: 200 },
  { label: '1 Piece / Slice', weight: 40 },
  { label: 'Handful / Spoon', weight: 20 },
];

const FoodReview: React.FC<FoodReviewProps> = ({ items, setItems, onCalculate, isCalculating }) => {
  const [newItemName, setNewItemName] = useState('');

  const updateItemName = (id: string, name: string) => {
    setItems(items.map(item => item.id === id ? { ...item, name } : item));
  };

  const updateItemPortion = (id: string, weight: number) => {
    const option = PORTION_OPTIONS.find(o => o.weight === weight);
    setItems(items.map(item => item.id === id ? { 
      ...item, 
      weight: weight, 
      unit: 'g',
      portionLabel: option ? option.label : 'Custom'
    } : item));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const addItem = () => {
    if (!newItemName.trim()) return;
    
    // Split by comma to allow adding multiple items at once (e.g. "Rice, Dal")
    const names = newItemName.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    const newItems: FoodItemInput[] = names.map((name, index) => ({
      id: Date.now().toString() + index,
      name: name,
      weight: 300, 
      unit: 'g',
      portionLabel: 'Medium Bowl'
    }));

    setItems([...items, ...newItems]);
    setNewItemName('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in space-y-6">
       
       <div className="text-center mb-8">
         <h2 className="text-2xl font-bold text-slate-800">Confirm Items</h2>
         <p className="text-slate-500 text-sm mt-1">Check the portion sizes before we analyze.</p>
       </div>

       {/* List of Items */}
       <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="group bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              
              {/* Icon & Name */}
              <div className="flex-1 flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 relative">
                   <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItemName(item.id, e.target.value)}
                    className="w-full bg-transparent font-semibold text-slate-900 focus:outline-none focus:border-b focus:border-indigo-500 transition-colors placeholder:text-slate-300"
                    placeholder="Item Name"
                  />
                  <PenLine className="w-3 h-3 text-slate-300 absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>

              {/* Portion Selector */}
              <div className="w-full sm:w-auto flex items-center gap-3">
                <select
                    value={item.weight}
                    onChange={(e) => updateItemPortion(item.id, parseInt(e.target.value))}
                    className="flex-1 sm:w-48 bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {PORTION_OPTIONS.map((p, idx) => (
                      <option key={idx} value={p.weight}>{p.label}</option>
                    ))}
                </select>
                
                <button 
                  onClick={() => removeItem(item.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}

          {/* Empty State */}
          {items.length === 0 && (
             <div className="p-10 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400">
               <p>No items added yet.</p>
             </div>
          )}
       </div>

       {/* Add Item Input */}
       <div className="relative">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Add another item (e.g. Curd, Salad)..."
            className="w-full pl-5 pr-12 py-4 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
          />
          <button
            onClick={addItem}
            disabled={!newItemName.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-slate-900 text-white rounded-lg flex items-center justify-center hover:bg-slate-800 disabled:opacity-50 disabled:bg-slate-200 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
       </div>

       {/* Action Button */}
       <div className="pt-6">
        <button
          onClick={onCalculate}
          disabled={items.length === 0 || isCalculating}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center space-x-2 transition-all ${
            isCalculating || items.length === 0
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-[0.99]'
          }`}
        >
          {isCalculating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing Nutrition...</span>
            </>
          ) : (
            <>
              <Calculator className="w-5 h-5" />
              <span>Get Full Analysis</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FoodReview;
