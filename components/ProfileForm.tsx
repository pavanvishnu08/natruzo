import React from 'react';
import { UserProfile, Gender, ActivityLevel, Goal } from '../types';
import { Ruler, Weight, Activity, Target, ArrowRight } from 'lucide-react';

interface ProfileFormProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  onNext: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, setProfile, onNext }) => {
  const handleChange = (field: keyof UserProfile, value: any) => {
    setProfile({ ...profile, [field]: value });
  };

  const isValid = profile.age > 0 && profile.weight > 0 && profile.height > 0;

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <div className="text-center mb-10 space-y-2">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Personalize Your Plan</h2>
        <p className="text-slate-500 text-lg">We need a few details to calculate your optimal nutrition baseline.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">
        
        {/* Metric Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Age</label>
            <div className="relative">
              <input
                type="number"
                value={profile.age || ''}
                onChange={(e) => handleChange('age', Number(e.target.value))}
                className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition font-medium text-slate-900 placeholder:text-slate-400"
                placeholder="25"
              />
              <span className="absolute right-4 top-3.5 text-xs text-slate-400 font-medium">years</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Weight className="w-3 h-3" /> Weight
            </label>
            <div className="relative">
              <input
                type="number"
                value={profile.weight || ''}
                onChange={(e) => handleChange('weight', Number(e.target.value))}
                className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition font-medium text-slate-900 placeholder:text-slate-400"
                placeholder="70"
              />
              <span className="absolute right-4 top-3.5 text-xs text-slate-400 font-medium">kg</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Ruler className="w-3 h-3" /> Height
            </label>
            <div className="relative">
              <input
                type="number"
                value={profile.height || ''}
                onChange={(e) => handleChange('height', Number(e.target.value))}
                className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition font-medium text-slate-900 placeholder:text-slate-400"
                placeholder="175"
              />
              <span className="absolute right-4 top-3.5 text-xs text-slate-400 font-medium">cm</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* Gender Selection */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Biological Sex</label>
          <div className="grid grid-cols-2 gap-4">
            {[Gender.Male, Gender.Female].map((g) => (
              <button
                key={g}
                onClick={() => handleChange('gender', g)}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                  profile.gender === g
                    ? 'border-sky-600 bg-sky-50 text-sky-700'
                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                }`}
              >
                {g === 'male' ? 'Male' : 'Female'}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Level */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Activity className="w-3 h-3" /> Activity Level
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { val: ActivityLevel.Low, label: 'Sedentary', desc: 'Little to no exercise' },
              { val: ActivityLevel.Moderate, label: 'Moderate', desc: 'Exercise 3-5x/week' },
              { val: ActivityLevel.Active, label: 'Active', desc: 'Daily exercise/physical job' }
            ].map((item) => (
              <button
                key={item.val}
                onClick={() => handleChange('activityLevel', item.val)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  profile.activityLevel === item.val
                    ? 'border-sky-600 bg-sky-50'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className={`font-semibold text-sm ${profile.activityLevel === item.val ? 'text-sky-900' : 'text-slate-700'}`}>
                  {item.label}
                </div>
                <div className="text-xs text-slate-400 mt-1">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Target className="w-3 h-3" /> Primary Goal
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: Goal.WeightLoss, label: "Lose Weight" },
              { val: Goal.Maintain, label: "Maintain" },
              { val: Goal.WeightGain, label: "Build Muscle" }
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => handleChange('goal', opt.val)}
                className={`py-3 px-2 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                  profile.goal === opt.val
                    ? 'border-sky-600 bg-sky-50 text-sky-700'
                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <button
            disabled={!isValid}
            onClick={onNext}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center space-x-2 transition-all transform active:scale-[0.99] ${
              isValid 
              ? 'bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Continue</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
