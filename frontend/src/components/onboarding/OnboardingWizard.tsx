import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  User,
  Scale,
  Dumbbell,
  Target,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Flame,
  Droplets,
  Apple,
  Zap,
  Activity,
  Heart,
  Award,
  ShieldCheck,
  Loader2,
  X
} from 'lucide-react';
import { submitOnboardingApi } from '../../lib/api/user';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  triggerAnnouncement: (msg: string) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
  triggerAnnouncement
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Biometrics
  const [age, setAge] = useState<number | string>(24);
  const [gender, setGender] = useState<string>('MALE');
  const [heightCm, setHeightCm] = useState<number | string>(175);
  const [weightKg, setWeightKg] = useState<number | string>(72);

  // Step 2: Experience & Frequency
  const [experienceLevel, setExperienceLevel] = useState<string>('INTERMEDIATE'); // BEGINNER | INTERMEDIATE | PRO
  const [workoutDays, setWorkoutDays] = useState<number>(4);
  const [environment, setEnvironment] = useState<string>('GYM'); // GYM | HOME

  // Step 3: Primary Goal
  const [goal, setGoal] = useState<string>('WEIGHT_LOSS'); // WEIGHT_LOSS | MUSCLE_GAIN | STRENGTH | MAINTENANCE

  // Calculations for Step 4 (Deterministic Fitness Formula)
  const planSummary = useMemo(() => {
    const h = Number(heightCm) || 0;
    const w = Number(weightKg) || 0;
    const a = Number(age) || 0;

    const hM = h / 100;
    const bmi = (hM > 0 && w > 0) ? parseFloat((w / (hM * hM)).toFixed(1)) : 0;

    // BMR using Mifflin-St Jeor Formula
    let bmr = (w > 0 && h > 0 && a > 0) ? (10 * w + 6.25 * h - 5 * a) : 0;
    if (bmr > 0) {
      if (gender === 'MALE') bmr += 5;
      else bmr -= 161;
    }
    bmr = Math.max(0, bmr);

    // Activity Multiplier
    let actMultiplier = 1.375; // 2-3 days
    if (workoutDays === 5) actMultiplier = 1.55; // 4-5 days
    else if (workoutDays >= 6) actMultiplier = 1.725; // 6-7 days

    let tdee = Math.round(bmr * actMultiplier);
    let targetCalories = tdee;

    if (bmr > 0) {
      if (goal === 'WEIGHT_LOSS') targetCalories = Math.round(tdee - 450);
      else if (goal === 'MUSCLE_GAIN') targetCalories = Math.round(tdee + 350);
      else if (goal === 'STRENGTH') targetCalories = Math.round(tdee + 200);
    }
    targetCalories = Math.max(0, targetCalories);

    // Macros
    const proteinG = w > 0 ? Math.round(w * (goal === 'MUSCLE_GAIN' ? 2.2 : 2.0)) : 0;
    const fatG = targetCalories > 0 ? Math.round((targetCalories * 0.25) / 9) : 0;
    const carbsG = targetCalories > 0 ? Math.max(0, Math.round((targetCalories - (proteinG * 4 + fatG * 9)) / 4)) : 0;
    const waterL = w > 0 ? parseFloat((w * 0.045).toFixed(1)) : 0;

    // Micronutrient & Minerals recommendations
    const minerals = [
      { name: 'Dietary Fiber', target: '30 - 38g', purpose: 'Gut motility & glucose control' },
      { name: 'Vitamin D3 + K2', target: '3000 IU', purpose: 'Bone strength & muscle recovery' },
      { name: 'Magnesium Glycinate', target: '400mg', purpose: 'Sleep quality & muscle relaxation' },
      { name: 'Zinc Picolinate', target: '15 - 25mg', purpose: 'Testosterone & immunity support' },
      { name: 'Omega-3 (EPA/DHA)', target: '2000mg', purpose: 'Joint health & anti-inflammation' },
      { name: 'Potassium & Sodium', target: '3500mg / 2300mg', purpose: 'Electrolyte balance & pump' }
    ];

    // Recommended Workout Split
    let splitName = 'Classic 3-Day Full Body & Core Split';
    if (workoutDays === 5) splitName = 'Upper / Lower & Push Pull Legs (4-5x/week)';
    else if (workoutDays >= 6) splitName = '6-7 Day High Volume Hypertrophy & Pro Split';

    return {
      bmi,
      bmr: Math.round(bmr),
      tdee,
      targetCalories,
      proteinG,
      carbsG,
      fatG,
      waterL,
      minerals,
      splitName
    };
  }, [heightCm, weightKg, age, gender, workoutDays, goal]);

  if (!isOpen) return null;

  const handleNextStep = () => {
    if (step === 1) {
      const h = Number(heightCm);
      const w = Number(weightKg);
      const a = Number(age);

      if (!h || h < 50 || h > 300) {
        triggerAnnouncement('Height must be between 50 cm and 300 cm');
        return;
      }
      if (!w || w < 20 || w > 500) {
        triggerAnnouncement('Weight must be between 20 kg and 500 kg');
        return;
      }
      if (!a || a < 10 || a > 120) {
        triggerAnnouncement('Age must be between 10 and 120 years');
        return;
      }
    }
    if (step < 4) setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const handleSubmitOnboarding = async () => {
    setIsSubmitting(true);
    try {
      let activityLevelStr = 'LIGHT';
      if (workoutDays === 5) activityLevelStr = 'MODERATE';
      else if (workoutDays >= 6) activityLevelStr = 'ACTIVE';

      await submitOnboardingApi({
        age: Number(age),
        gender,
        height: Number(heightCm),
        weight: Number(weightKg),
        activityLevel: activityLevelStr,
        goal
      });

      triggerAnnouncement('Fitness Profile & Personalized Nutrition Plan saved successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      triggerAnnouncement(`Onboarding submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        
        {/* Header Bar */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-zinc-100 flex items-center gap-2">
                Member Onboarding & Setup <span className="text-xs font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">Step {step} of 4</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">Customize your personalized fitness, diet & macro plan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-zinc-950 h-1.5 flex">
          <div
            className="bg-gradient-to-r from-blue-500 via-emerald-500 to-indigo-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Step Content Viewport */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* =================================================================== */}
          {/* STEP 1: BIOMETRICS & BMI INITIALIZATION                            */}
          {/* =================================================================== */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-zinc-100">Step 1: Your Body Biometrics & BMI</h3>
                <p className="text-xs text-zinc-400">Provide accurate height, weight, and age to compute your BMI and Basal Metabolic Rate.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Age (Years)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                    placeholder="e.g. 24"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Gender</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other / Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Height (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={e => setHeightCm(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                    placeholder="e.g. 175"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Current Weight (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={e => setWeightKg(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                    placeholder="e.g. 72"
                  />
                </div>
              </div>

              {/* Real-time BMI Summary Card */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Computed BMI Score</span>
                  <span className="text-2xl font-black text-blue-400 font-mono">{planSummary.bmi}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Est. Basal Metabolic Rate (BMR)</span>
                  <span className="text-lg font-extrabold text-emerald-400 font-mono">{planSummary.bmr} kcal/day</span>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* STEP 2: WORKOUT EXPERIENCE & FREQUENCY                             */}
          {/* =================================================================== */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-zinc-100">Step 2: Experience & Frequency</h3>
                <p className="text-xs text-zinc-400">Tell us how experienced you are and how many days per week you plan to train.</p>
              </div>

              {/* Experience Level Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-400">Gym Experience Level</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'BEGINNER', title: 'Beginner', desc: '0 - 6 months lifting' },
                    { id: 'INTERMEDIATE', title: 'Intermediate', desc: '6 - 24 months consistent' },
                    { id: 'PRO', title: 'Gym Pro / Advanced', desc: '2+ years heavy lifting' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setExperienceLevel(item.id)}
                      className={`p-4 rounded-2xl border text-left transition space-y-1 ${
                        experienceLevel === item.id
                          ? 'bg-blue-950/40 border-blue-500/80 text-blue-200 shadow-lg shadow-blue-950/40'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span className="font-extrabold text-sm block text-zinc-100">{item.title}</span>
                      <span className="text-[11px] block opacity-80">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Workout Days Per Week */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-400">Weekly Workout Commitment</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 3, label: '2 - 3 Days / Wk', desc: 'Casual / Maintenance' },
                    { value: 5, label: '4 - 5 Days / Wk', desc: 'Consistent / Active' },
                    { value: 6, label: '6 - 7 Days / Wk', desc: 'Hardcore / Daily' }
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setWorkoutDays(option.value)}
                      className={`p-3.5 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                        workoutDays === option.value
                          ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/40'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-xs font-extrabold text-zinc-100">{option.label}</span>
                      <span className="text-[10px] text-zinc-500 font-medium">{option.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Environment */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-400">Preferred Training Environment</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEnvironment('GYM')}
                    className={`p-3.5 rounded-2xl border text-center font-bold text-xs transition ${
                      environment === 'GYM'
                        ? 'bg-indigo-950/50 border-indigo-500 text-indigo-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    🏢 Commercial Gym Setup
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnvironment('HOME')}
                    className={`p-3.5 rounded-2xl border text-center font-bold text-xs transition ${
                      environment === 'HOME'
                        ? 'bg-indigo-950/50 border-indigo-500 text-indigo-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    🏡 Home / Minimal Equipment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* STEP 3: FITNESS GOALS                                              */}
          {/* =================================================================== */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-zinc-100">Step 3: What is Your Primary Fitness Goal?</h3>
                <p className="text-xs text-zinc-400">Select your target outcome so our engine can generate your daily macro targets.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: 'WEIGHT_LOSS',
                    title: 'Fat Loss & Weight Loss',
                    icon: Flame,
                    color: 'text-orange-400 border-orange-500/40 bg-orange-950/20',
                    desc: 'Caloric deficit, fat oxidation, and metabolic conditioning.'
                  },
                  {
                    id: 'MUSCLE_GAIN',
                    title: 'Muscle Gain & Hypertrophy',
                    icon: Dumbbell,
                    color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
                    desc: 'High protein intake, progressive overload, & lean surplus.'
                  },
                  {
                    id: 'STRENGTH',
                    title: 'Strength Training',
                    icon: Zap,
                    color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
                    desc: 'Heavy compound movements & athletic power production.'
                  },
                  {
                    id: 'MAINTENANCE',
                    title: 'Endurance & Maintenance',
                    icon: Activity,
                    color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
                    desc: 'Cardiovascular health, stamina, mobility & body balance.'
                  }
                ].map(item => {
                  const IconC = item.icon;
                  const isSelected = goal === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGoal(item.id)}
                      className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                        isSelected
                          ? `${item.color} shadow-lg`
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl border ${isSelected ? item.color : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
                        <IconC className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-zinc-100 text-sm">{item.title}</h4>
                        <p className="text-[11px] text-zinc-400 mt-1">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* STEP 4: PERSONALIZED NUTRITION, MACRO & MICRONUTRIENT CHART PLAN     */}
          {/* =================================================================== */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-zinc-100">Step 4: Your AI Fitness & Nutrition Plan Chart</h3>
                <p className="text-xs text-zinc-400">Generated tailored macros, essential diet minerals, and workout split based on your biometrics.</p>
              </div>

              {/* Target Calories & Water Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-orange-500/30 text-center">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Target Energy</span>
                  <span className="text-lg font-black text-orange-400 font-mono">{planSummary.targetCalories} <span className="text-xs">kcal/day</span></span>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-emerald-500/30 text-center">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Target Protein</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">{planSummary.proteinG} g/day</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-cyan-500/30 text-center">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Target Carbs</span>
                  <span className="text-lg font-black text-cyan-400 font-mono">{planSummary.carbsG} g/day</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-amber-500/30 text-center">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Target Fats</span>
                  <span className="text-lg font-black text-amber-400 font-mono">{planSummary.fatG} g/day</span>
                </div>
              </div>

              {/* Workout Split Recommendation */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-zinc-950 border border-blue-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-wider block">Recommended Routine Split</span>
                  <span className="text-sm font-extrabold text-zinc-100">{planSummary.splitName}</span>
                </div>
                <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800">
                  {workoutDays} Days / Week
                </span>
              </div>

              {/* Essential Micronutrients & Minerals Chart Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Apple className="w-4 h-4 text-emerald-400" /> Essential Micronutrients & Diet Minerals
                </h4>

                <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950/60">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 font-bold uppercase text-[10px]">
                        <th className="p-2.5">Mineral / Vitamin</th>
                        <th className="p-2.5 font-mono">Daily Target</th>
                        <th className="p-2.5 hidden sm:table-cell">Health Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {planSummary.minerals.map((m, idx) => (
                        <tr key={idx} className="hover:bg-zinc-900/30">
                          <td className="p-2.5 font-bold text-zinc-200">{m.name}</td>
                          <td className="p-2.5 font-mono text-emerald-400 font-bold">{m.target}</td>
                          <td className="p-2.5 text-zinc-400 hidden sm:table-cell">{m.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Bar: Nav Buttons */}
        <div className="p-6 border-t border-zinc-800 flex items-center justify-between bg-zinc-950/60 shrink-0">
          <button
            onClick={handlePrevStep}
            disabled={step === 1 || isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 font-bold text-xs transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < 4 ? (
            <button
              onClick={handleNextStep}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmitOnboarding}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Plan to Profile...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Save Profile & Launch Dashboard
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
