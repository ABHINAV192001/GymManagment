import React, { useState } from 'react';
import { Sparkles, RotateCw, Activity, Target, Compass, Zap, ShieldCheck } from 'lucide-react';

export type MuscleGroupKey =
  | 'CHEST'
  | 'BACK'
  | 'SHOULDERS'
  | 'BICEPS'
  | 'TRICEPS'
  | 'FOREARMS'
  | 'ABS'
  | 'QUADS'
  | 'HAMSTRINGS'
  | 'GLUTES'
  | 'CALVES';

interface HumanBodyMapProps {
  selectedMuscle: MuscleGroupKey | null;
  onSelectMuscle: (muscle: MuscleGroupKey | null) => void;
  exerciseCounts?: Record<string, number>;
}

export const HumanBodyMap: React.FC<HumanBodyMapProps> = ({
  selectedMuscle,
  onSelectMuscle,
  exerciseCounts = {},
}) => {
  const [view, setView] = useState<'FRONT' | 'BACK'>('FRONT');
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleGroupKey | null>(null);

  const active = hoveredMuscle || selectedMuscle;

  // Muscle Metadata
  const muscleMeta: Record<MuscleGroupKey, { name: string; tag: string; desc: string; focus: string }> = {
    CHEST: {
      name: 'Pectoralis Major & Minor',
      tag: 'Upper Body Push Powerhouse',
      desc: 'Clavicular & sternal chest heads responsible for pushing horizontal loads and hugging movements.',
      focus: 'Barbell Bench Press, Incline DB Press, Cable Flyes',
    },
    SHOULDERS: {
      name: 'Deltoids (Front, Lateral, Rear)',
      tag: '3D Shoulder Cap & Mobility',
      desc: 'Multi-angled deltoid heads providing arm rotation, overhead pressing, and side width.',
      focus: 'Overhead Press, Lateral Raises, Arnold Press',
    },
    BACK: {
      name: 'Latissimus Dorsi & Rhomboids',
      tag: 'V-Taper Width & Mid-Back Thickness',
      desc: 'Broad back musculature controlling pulling movements, posture, and scapular retraction.',
      focus: 'Deadlifts, Lat Pulldowns, Heavy Barbell Rows',
    },
    BICEPS: {
      name: 'Biceps Brachii (Long/Short Head)',
      tag: 'Arm Flexion & Peak Contraction',
      desc: 'Two-headed arm flexor controlling elbow flexion and wrist supination.',
      focus: 'Barbell Curls, Incline DB Curls, Preacher Curls',
    },
    TRICEPS: {
      name: 'Triceps Brachii (Lateral/Long/Medial)',
      tag: '60% of Arm Volume & Lockout Strength',
      desc: 'Three-headed tricep complex extending elbows and stabilizing overhead pressing.',
      focus: 'Rope Pushdown, Skull Crushers, Close-Grip Press',
    },
    FOREARMS: {
      name: 'Brachioradialis & Wrist Flexors',
      tag: 'Grip Strength & Forearm Density',
      desc: 'Controls grip endurance, wrist stabilization, and heavy pulling hold power.',
      focus: 'Wrist Curls, Farmers Walk, Reverse Curls',
    },
    ABS: {
      name: 'Rectus Abdominis & Obliques',
      tag: 'Core Stabilization & 6-Pack Aesthetics',
      desc: 'Core wall stabilizing spinal flexion, rotation, and heavy compound lift bracing.',
      focus: 'Hanging Leg Raises, Cable Crunches, Planks',
    },
    QUADS: {
      name: 'Quadriceps (Vastus Lateralis/Medialis)',
      tag: 'Lower Body Primary Driver',
      desc: 'Four-headed knee extensor powering squats, lunges, and athletic explosive power.',
      focus: 'Barbell Squats, Leg Press, Bulgarian Split Squats',
    },
    HAMSTRINGS: {
      name: 'Biceps Femoris & Semitendinosus',
      tag: 'Posterior Knee Flexion & Sprint Engine',
      desc: 'Posterior thigh complex driving hip extension and knee flexion.',
      focus: 'Romanian Deadlifts (RDL), Leg Curls, Glute Ham Raise',
    },
    GLUTES: {
      name: 'Gluteus Maximus & Medius',
      tag: 'Body Power Generator',
      desc: 'Largest muscle in the human body driving hip extension, abduction, and pelvis stability.',
      focus: 'Barbell Hip Thrusts, Sumo Deadlifts, Cable Kickbacks',
    },
    CALVES: {
      name: 'Gastrocnemius & Soleus',
      tag: 'Ankle Extension & Lower Leg Sweep',
      desc: 'Durable ankle plantar flexors providing calf height, soleus thickness, and jump drive.',
      focus: 'Standing Calf Raises, Seated Calf Raises, Donkey Calf Raises',
    },
  };

  const currentMeta = active ? muscleMeta[active] : null;

  // Helper for fill selection
  const getPlateFill = (muscle: MuscleGroupKey) => {
    if (selectedMuscle === muscle) return 'url(#activeNeonCyan)';
    if (hoveredMuscle === muscle) return 'url(#hoverNeonCyan)';
    return 'url(#darkMetallicPlate)';
  };

  const getPlateStroke = (muscle: MuscleGroupKey) => {
    if (selectedMuscle === muscle) return '#38bdf8';
    if (hoveredMuscle === muscle) return '#818cf8';
    return '#3f4756';
  };

  const getPlateFilter = (muscle: MuscleGroupKey) => {
    if (selectedMuscle === muscle) return 'url(#activeGlowFilter)';
    if (hoveredMuscle === muscle) return 'url(#hoverGlowFilter)';
    return 'none';
  };

  return (
    <div className="relative p-6 lg:p-8 rounded-3xl bg-white dark:bg-[#090b10] border border-zinc-200 dark:border-cyan-500/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-2xl">
      {/* Sci-Fi Fine Tech Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e2638_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header controls & Top Floating Target Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10 border-b border-zinc-200 dark:border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '10s' }} />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-wider uppercase flex items-center gap-2">
                3D Sci-Fi Target Scanner
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Targeting Matrix
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Interactive wireframe mannequin & 3D muscle plate targeting system.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-2 bg-zinc-50 dark:bg-[#10141d]/90 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
          <button
            type="button"
            onClick={() => setView('FRONT')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              view === 'FRONT'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 font-black'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            Anterior (Front)
          </button>
          <button
            type="button"
            onClick={() => setView('BACK')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              view === 'BACK'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 font-black'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" /> Posterior (Back)
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Column: Quick Muscle Selector Grid */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-black text-zinc-500 dark:text-zinc-400 tracking-wider">
            <span>SELECT MUSCLE REGION</span>
            {selectedMuscle && (
              <button
                onClick={() => onSelectMuscle(null)}
                className="text-cyan-400 hover:underline text-[11px] font-bold"
              >
                Clear Selection
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
            {[
              { key: 'CHEST', label: 'Chest (Pecs)', count: exerciseCounts['CHEST'] || 10 },
              { key: 'SHOULDERS', label: 'Shoulders (Delts)', count: exerciseCounts['SHOULDERS'] || 10 },
              { key: 'BACK', label: 'Back (Lats/Traps)', count: exerciseCounts['BACK'] || 10 },
              { key: 'BICEPS', label: 'Biceps', count: exerciseCounts['BICEPS'] || 10 },
              { key: 'TRICEPS', label: 'Triceps', count: exerciseCounts['TRICEPS'] || 10 },
              { key: 'FOREARMS', label: 'Forearms', count: exerciseCounts['FOREARMS'] || 10 },
              { key: 'ABS', label: 'Abs & Core', count: exerciseCounts['ABS'] || 10 },
              { key: 'QUADS', label: 'Quads (Legs)', count: exerciseCounts['QUADS'] || 10 },
              { key: 'HAMSTRINGS', label: 'Hamstrings', count: exerciseCounts['HAMSTRINGS'] || 10 },
              { key: 'GLUTES', label: 'Glutes', count: exerciseCounts['GLUTES'] || 10 },
              { key: 'CALVES', label: 'Calves', count: exerciseCounts['CALVES'] || 10 },
            ].map(m => (
              <button
                key={m.key}
                type="button"
                onClick={() => onSelectMuscle(selectedMuscle === m.key ? null : (m.key as MuscleGroupKey))}
                onMouseEnter={() => setHoveredMuscle(m.key as MuscleGroupKey)}
                onMouseLeave={() => setHoveredMuscle(null)}
                className={`p-3 rounded-2xl text-left border transition-all flex items-center justify-between text-xs ${
                  selectedMuscle === m.key
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20 font-bold scale-[1.02]'
                    : hoveredMuscle === m.key
                    ? 'bg-zinc-50 dark:bg-zinc-900/90 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100'
                    : 'bg-zinc-100 dark:bg-[#10141d]/60 border-zinc-200 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Target className={`w-3.5 h-3.5 ${selectedMuscle === m.key ? 'text-cyan-400 animate-pulse' : 'text-zinc-600'}`} />
                  <span className="truncate">{m.label}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                  {m.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Center: 3D Holographic Wireframe Mannequin & 3D Glossy Muscle Plates */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-[#0c0e15]/80 rounded-3xl border border-cyan-500/30 min-h-[500px] relative overflow-hidden shadow-2xl">
          {/* Top HUD Floating Glass Pill (Matches exact image: Targeting: ABS) */}
          <div className="absolute top-4 px-5 py-2 bg-white dark:bg-[#090e18]/90 border border-cyan-500/40 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur-md flex items-center gap-2.5 z-30">
            <div className="w-5 h-5 rounded-full border border-cyan-400 flex items-center justify-center text-cyan-400">
              <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
            <span className="text-sm font-black text-cyan-300 tracking-wider">
              Targeting: <span className="text-zinc-900 dark:text-white">{active ? active : 'ALL SYSTEM'}</span>
            </span>
          </div>

          {/* Sci-Fi HUD Background Elements (Code text + coordinates like in screenshot) */}
          <div className="absolute inset-0 pointer-events-none font-mono text-[9px] text-cyan-500/25 p-4 flex justify-between items-start">
            <div className="space-y-1">
              <div>SYS.SCAN // 0.03.00</div>
              <div>LOC.TARGET // OK</div>
              <div>GRID.RESOLUTION // 1024</div>
            </div>
            <div className="text-right space-y-1">
              <div>1.03.00</div>
              <div>-1.93.9222</div>
              <div>ORBIT.ZOOM // 1.25x</div>
            </div>
          </div>

          <svg viewBox="0 0 400 620" className="w-full max-w-[340px] h-[480px] transition-all duration-300 relative z-20">
            <defs>
              {/* Active Electric Cyan/Blue 3D Glossy Muscle Gradient */}
              <radialGradient id="activeNeonCyan" cx="40%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#7dd3fc" />
                <stop offset="35%" stopColor="#38bdf8" />
                <stop offset="75%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0369a1" />
              </radialGradient>

              {/* Hover Vibrant Cyan/Purple Gradient */}
              <radialGradient id="hoverNeonCyan" cx="40%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#a5f3fc" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#4338ca" />
              </radialGradient>

              {/* Inactive Metallic Carbon Armor Plate Gradient */}
              <linearGradient id="darkMetallicPlate" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#333947" />
                <stop offset="40%" stopColor="#1e232e" />
                <stop offset="100%" stopColor="#11141c" />
              </linearGradient>

              {/* Specular White Glass Reflection Overlay */}
              <linearGradient id="glassReflection" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                <stop offset="40%" stopColor="#ffffff" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>

              {/* Glow Filters */}
              <filter id="activeGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              <filter id="hoverGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Faint Outer HUD Orbit Ring with Tick Marks */}
            <circle cx="200" cy="300" r="185" fill="none" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="6 6" opacity="0.25" />
            <circle cx="200" cy="300" r="230" fill="none" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="3 9" opacity="0.15" />

            {/* 3D MANNEQUIN WIREFRAME MESH SILHOUETTE */}
            <g opacity="0.6">
              {/* Head with Wireframe Mesh Lines */}
              <ellipse cx="200" cy="65" rx="30" ry="38" fill="#141824" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8" />
              {/* Head Vertical/Horizontal Grid Lines */}
              <path d="M 200 27 L 200 103" stroke="#38bdf8" strokeWidth="0.5" opacity="0.5" />
              <path d="M 170 65 Q 200 80 230 65" fill="none" stroke="#38bdf8" strokeWidth="0.5" opacity="0.5" />
              <path d="M 173 50 Q 200 62 227 50" fill="none" stroke="#38bdf8" strokeWidth="0.5" opacity="0.5" />

              {/* Neck */}
              <path d="M 190 102 L 210 102 L 214 125 L 186 125 Z" fill="#141824" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />

              {/* Body Mannequin Outline */}
              <path
                d="M 145 130 Q 120 135 110 160 L 90 240 L 80 320 L 115 320 L 125 240 L 140 180 L 155 330 L 135 480 L 115 580 L 150 580 L 175 490 L 185 360 L 200 360 L 215 490 L 250 580 L 285 580 L 265 480 L 245 330 L 260 180 L 275 240 L 285 320 L 320 320 L 310 240 Q 300 135 255 130 Z"
                fill="#0d1017"
                stroke="#2a3346"
                strokeWidth="1.5"
              />

              {/* Horizontal Body Contour Mesh Lines */}
              {[140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 350, 380, 410, 440, 470, 500, 530, 560].map(y => (
                <line key={y} x1="70" y1={y} x2="330" y2={y} stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 4" />
              ))}
            </g>

            {/* 3D GLOSSY METALLIC/GLASS MUSCLE PLATES */}
            {view === 'FRONT' ? (
              /* ANTERIOR (FRONT) 3D PLATES */
              <g>
                {/* SHOULDERS (DELTOIDS) */}
                <g
                  onClick={() => onSelectMuscle(selectedMuscle === 'SHOULDERS' ? null : 'SHOULDERS')}
                  onMouseEnter={() => setHoveredMuscle('SHOULDERS')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-300"
                  filter={getPlateFilter('SHOULDERS')}
                >
                  <path
                    d="M 148 132 C 122 135 106 155 102 188 C 100 205 116 218 132 205 C 142 192 148 162 148 132 Z"
                    fill={getPlateFill('SHOULDERS')}
                    stroke={getPlateStroke('SHOULDERS')}
                    strokeWidth="2"
                  />
                  {/* Glass Top Highlight Arc */}
                  <path d="M 145 135 C 126 138 112 152 108 175" fill="none" stroke="url(#glassReflection)" strokeWidth="3" />

                  <path
                    d="M 252 132 C 278 135 294 155 298 188 C 300 205 284 218 268 205 C 258 192 252 162 252 132 Z"
                    fill={getPlateFill('SHOULDERS')}
                    stroke={getPlateStroke('SHOULDERS')}
                    strokeWidth="2"
                  />
                  <path d="M 255 135 C 274 138 288 152 292 175" fill="none" stroke="url(#glassReflection)" strokeWidth="3" />
                </g>

                {/* CHEST (PECTORALS - 2 Glossy 3D Chest Plates) */}
                <g
                  onClick={() => onSelectMuscle(selectedMuscle === 'CHEST' ? null : 'CHEST')}
                  onMouseEnter={() => setHoveredMuscle('CHEST')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-300"
                  filter={getPlateFilter('CHEST')}
                >
                  <path
                    d="M 154 138 C 176 135 194 142 196 200 C 174 212 142 202 138 172 C 136 152 144 140 154 138 Z"
                    fill={getPlateFill('CHEST')}
                    stroke={getPlateStroke('CHEST')}
                    strokeWidth="2"
                  />
                  <path d="M 156 142 C 174 140 188 146 192 175" fill="none" stroke="url(#glassReflection)" strokeWidth="3" />

                  <path
                    d="M 246 138 C 224 135 206 142 204 200 C 226 212 258 202 262 172 C 264 152 256 140 246 138 Z"
                    fill={getPlateFill('CHEST')}
                    stroke={getPlateStroke('CHEST')}
                    strokeWidth="2"
                  />
                  <path d="M 244 142 C 226 140 212 146 208 175" fill="none" stroke="url(#glassReflection)" strokeWidth="3" />
                </g>

                {/* BICEPS (BICEPS BRACHII) */}
                <g
                  onClick={() => onSelectMuscle(selectedMuscle === 'BICEPS' ? null : 'BICEPS')}
                  onMouseEnter={() => setHoveredMuscle('BICEPS')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-300"
                  filter={getPlateFilter('BICEPS')}
                >
                  <path
                    d="M 108 208 C 96 208 86 225 90 268 C 98 280 114 275 118 252 C 122 235 120 212 108 208 Z"
                    fill={getPlateFill('BICEPS')}
                    stroke={getPlateStroke('BICEPS')}
                    strokeWidth="2"
                  />
                  <path d="M 106 212 C 98 215 92 230 94 250" fill="none" stroke="url(#glassReflection)" strokeWidth="2.5" />

                  <path
                    d="M 292 208 C 304 208 314 225 310 268 C 302 280 286 275 282 252 C 278 235 280 212 292 208 Z"
                    fill={getPlateFill('BICEPS')}
                    stroke={getPlateStroke('BICEPS')}
                    strokeWidth="2"
                  />
                  <path d="M 294 212 C 302 215 308 230 306 250" fill="none" stroke="url(#glassReflection)" strokeWidth="2.5" />
                </g>

                {/* FOREARMS */}
                <g
                  onClick={() => onSelectMuscle(selectedMuscle === 'FOREARMS' ? null : 'FOREARMS')}
                  onMouseEnter={() => setHoveredMuscle('FOREARMS')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-300"
                  filter={getPlateFilter('FOREARMS')}
                >
                  <path
                    d="M 88 276 C 76 276 66 295 70 350 L 88 350 C 96 325 98 295 88 276 Z"
                    fill={getPlateFill('FOREARMS')}
                    stroke={getPlateStroke('FOREARMS')}
                    strokeWidth="2"
                  />
                  <path
                    d="M 312 276 C 324 276 334 295 330 350 L 312 350 C 304 325 302 295 312 276 Z"
                    fill={getPlateFill('FOREARMS')}
                    stroke={getPlateStroke('FOREARMS')}
                    strokeWidth="2"
                  />
                </g>

                {/* ABS (RECTUS ABDOMINIS — EXACT MATCH 6-PACK GLOSSY TILES IN SCREENSHOT) */}
                <g
                  onClick={() => onSelectMuscle(selectedMuscle === 'ABS' ? null : 'ABS')}
                  onMouseEnter={() => setHoveredMuscle('ABS')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-300"
                  filter={getPlateFilter('ABS')}
                >
                  {/* Row 1 Upper Abs */}
                  <g>
                    <rect x="156" y="210" width="38" height="34" rx="8" fill={getPlateFill('ABS')} stroke={getPlateStroke('ABS')} strokeWidth="2" />
                    <rect x="159" y="212" width="32" height="12" rx="4" fill="url(#glassReflection)" />
                  </g>
                  <g>
                    <rect x="206" y="210" width="38" height="34" rx="8" fill={getPlateFill('ABS')} stroke={getPlateStroke('ABS')} strokeWidth="2" />
                    <rect x="209" y="212" width="32" height="12" rx="4" fill="url(#glassReflection)" />
                  </g>

                  {/* Row 2 Mid Abs */}
                  <g>
                    <rect x="156" y="250" width="38" height="36" rx="8" fill={getPlateFill('ABS')} stroke={getPlateStroke('ABS')} strokeWidth="2" />
                    <rect x="159" y="252" width="32" height="12" rx="4" fill="url(#glassReflection)" />
                  </g>
                  <g>
                    <rect x="206" y="250" width="38" height="36" rx="8" fill={getPlateFill('ABS')} stroke={getPlateStroke('ABS')} strokeWidth="2" />
                    <rect x="209" y="252" width="32" height="12" rx="4" fill="url(#glassReflection)" />
                  </g>

                  {/* Row 3 Lower Abs */}
                  <g>
                    <rect x="156" y="292" width="38" height="38" rx="8" fill={getPlateFill('ABS')} stroke={getPlateStroke('ABS')} strokeWidth="2" />
                    <rect x="159" y="294" width="32" height="12" rx="4" fill="url(#glassReflection)" />
                  </g>
                  <g>
                    <rect x="206" y="292" width="38" height="38" rx="8" fill={getPlateFill('ABS')} stroke={getPlateStroke('ABS')} strokeWidth="2" />
                    <rect x="209" y="294" width="32" height="12" rx="4" fill="url(#glassReflection)" />
                  </g>
                </g>

                {/* QUADS (THIGHS) */}
                <g
                  onClick={() => onSelectMuscle(selectedMuscle === 'QUADS' ? null : 'QUADS')}
                  onMouseEnter={() => setHoveredMuscle('QUADS')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-300"
                  filter={getPlateFilter('QUADS')}
                >
                  <path
                    d="M 148 350 C 132 350 120 380 126 480 C 146 500 178 490 180 460 C 182 400 175 360 148 350 Z"
                    fill={getPlateFill('QUADS')}
                    stroke={getPlateStroke('QUADS')}
                    strokeWidth="2"
                  />
                  <path d="M 144 355 C 134 365 128 390 130 430" fill="none" stroke="url(#glassReflection)" strokeWidth="3" />

                  <path
                    d="M 252 350 C 268 350 280 380 274 480 C 254 500 222 490 220 460 C 218 400 225 360 252 350 Z"
                    fill={getPlateFill('QUADS')}
                    stroke={getPlateStroke('QUADS')}
                    strokeWidth="2"
                  />
                  <path d="M 256 355 C 266 365 272 390 270 430" fill="none" stroke="url(#glassReflection)" strokeWidth="3" />
                </g>

                {/* CALVES (SHINS) */}
                <g
                  onClick={() => onSelectMuscle(selectedMuscle === 'CALVES' ? null : 'CALVES')}
                  onMouseEnter={() => setHoveredMuscle('CALVES')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-300"
                  filter={getPlateFilter('CALVES')}
                >
                  <path
                    d="M 136 500 C 122 500 118 535 126 595 L 152 595 C 158 555 152 510 136 500 Z"
                    fill={getPlateFill('CALVES')}
                    stroke={getPlateStroke('CALVES')}
                    strokeWidth="2"
                  />
                  <path
                    d="M 264 500 C 278 500 282 535 274 595 L 248 595 C 242 555 248 510 264 500 Z"
                    fill={getPlateFill('CALVES')}
                    stroke={getPlateStroke('CALVES')}
                    strokeWidth="2"
                  />
                </g>
              </g>
            ) : (
              /* POSTERIOR (BACK) 3D PLATES */
              <g>
                {/* LATS / BACK PLATES */}
                <g
                  onClick={() => onSelectMuscle(selectedMuscle === 'BACK' ? null : 'BACK')}
                  onMouseEnter={() => setHoveredMuscle('BACK')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-300"
                  filter={getPlateFilter('BACK')}
                >
                  <path
                    d="M 140 145 C 120 145 115 180 145 270 C 170 280 195 275 195 210 Z"
                    fill={getPlateFill('BACK')}
                    stroke={getPlateStroke('BACK')}
                    strokeWidth="2"
                  />
                  <path
                    d="M 260 145 C 280 145 285 180 255 270 C 230 280 205 275 205 210 Z"
                    fill={getPlateFill('BACK')}
                    stroke={getPlateStroke('BACK')}
                    strokeWidth="2"
                  />
                </g>

                {/* TRICEPS POSTERIOR */}
                <g
                  onClick={() => onSelectMuscle(selectedMuscle === 'TRICEPS' ? null : 'TRICEPS')}
                  onMouseEnter={() => setHoveredMuscle('TRICEPS')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-300"
                  filter={getPlateFilter('TRICEPS')}
                >
                  <path
                    d="M 108 200 C 96 200 88 220 92 265 C 102 275 114 270 118 250 Z"
                    fill={getPlateFill('TRICEPS')}
                    stroke={getPlateStroke('TRICEPS')}
                    strokeWidth="2"
                  />
                  <path
                    d="M 292 200 C 304 200 312 220 308 265 C 298 275 286 270 282 250 Z"
                    fill={getPlateFill('TRICEPS')}
                    stroke={getPlateStroke('TRICEPS')}
                    strokeWidth="2"
                  />
                </g>

                {/* GLUTES */}
                <g
                  onClick={() => onSelectMuscle(selectedMuscle === 'GLUTES' ? null : 'GLUTES')}
                  onMouseEnter={() => setHoveredMuscle('GLUTES')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-300"
                  filter={getPlateFilter('GLUTES')}
                >
                  <ellipse cx="160" cy="320" rx="32" ry="36" fill={getPlateFill('GLUTES')} stroke={getPlateStroke('GLUTES')} strokeWidth="2" />
                  <ellipse cx="240" cy="320" rx="32" ry="36" fill={getPlateFill('GLUTES')} stroke={getPlateStroke('GLUTES')} strokeWidth="2" />
                </g>

                {/* HAMSTRINGS */}
                <g
                  onClick={() => onSelectMuscle(selectedMuscle === 'HAMSTRINGS' ? null : 'HAMSTRINGS')}
                  onMouseEnter={() => setHoveredMuscle('HAMSTRINGS')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-300"
                  filter={getPlateFilter('HAMSTRINGS')}
                >
                  <path
                    d="M 148 360 C 130 360 120 400 128 480 C 150 495 178 490 178 450 Z"
                    fill={getPlateFill('HAMSTRINGS')}
                    stroke={getPlateStroke('HAMSTRINGS')}
                    strokeWidth="2"
                  />
                  <path
                    d="M 252 360 C 270 360 280 400 272 480 C 250 495 222 490 222 450 Z"
                    fill={getPlateFill('HAMSTRINGS')}
                    stroke={getPlateStroke('HAMSTRINGS')}
                    strokeWidth="2"
                  />
                </g>

                {/* CALVES POSTERIOR */}
                <g
                  onClick={() => onSelectMuscle(selectedMuscle === 'CALVES' ? null : 'CALVES')}
                  onMouseEnter={() => setHoveredMuscle('CALVES')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-300"
                  filter={getPlateFilter('CALVES')}
                >
                  <path
                    d="M 136 500 C 120 500 114 535 126 595 L 152 595 Z"
                    fill={getPlateFill('CALVES')}
                    stroke={getPlateStroke('CALVES')}
                    strokeWidth="2"
                  />
                  <path
                    d="M 264 500 C 280 500 286 535 274 595 L 248 595 Z"
                    fill={getPlateFill('CALVES')}
                    stroke={getPlateStroke('CALVES')}
                    strokeWidth="2"
                  />
                </g>
              </g>
            )}

            {/* CONCENTRIC NEON HOLOGRAPHIC TARGET NODES (EXACT MATCH SCREENSHOT NODES) */}
            {[
              { id: 'CHEST', cx: 168, cy: 170, view: 'FRONT' },
              { id: 'SHOULDERS', cx: 125, cy: 160, view: 'FRONT' },
              { id: 'BICEPS', cx: 110, cy: 235, view: 'FRONT' },
              { id: 'FOREARMS', cx: 82, cy: 310, view: 'FRONT' },
              { id: 'ABS', cx: 200, cy: 250, view: 'FRONT' },
              { id: 'QUADS', cx: 154, cy: 420, view: 'FRONT' },
              { id: 'CALVES', cx: 138, cy: 535, view: 'FRONT' },
              { id: 'BACK', cx: 200, cy: 200, view: 'BACK' },
              { id: 'TRICEPS', cx: 110, cy: 235, view: 'BACK' },
              { id: 'GLUTES', cx: 170, cy: 320, view: 'BACK' },
              { id: 'HAMSTRINGS', cx: 152, cy: 420, view: 'BACK' },
            ]
              .filter(node => node.view === view)
              .map(node => {
                const isSel = selectedMuscle === node.id;
                const isHov = hoveredMuscle === node.id;
                return (
                  <g
                    key={node.id}
                    className="cursor-pointer group/node"
                    onClick={() => onSelectMuscle(selectedMuscle === node.id ? null : (node.id as MuscleGroupKey))}
                    onMouseEnter={() => setHoveredMuscle(node.id as MuscleGroupKey)}
                    onMouseLeave={() => setHoveredMuscle(null)}
                  >
                    {/* Outer Target Node Ring */}
                    <circle
                      cx={node.cx}
                      cy={node.cy}
                      r={isSel ? '16' : isHov ? '14' : '10'}
                      fill="none"
                      stroke={isSel ? '#38bdf8' : isHov ? '#818cf8' : '#00f0ff'}
                      strokeWidth="2"
                      opacity={isSel || isHov ? '1' : '0.7'}
                      className="transition-all duration-300"
                    />

                    {/* Inner Filled Dot */}
                    <circle
                      cx={node.cx}
                      cy={node.cy}
                      r={isSel ? '6' : '4'}
                      fill={isSel ? '#ffffff' : '#00f0ff'}
                    />

                    {/* Active Radar Pulse Ring for Selected Muscle */}
                    {isSel && (
                      <>
                        <circle
                          cx={node.cx}
                          cy={node.cy}
                          r="28"
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          className="animate-ping"
                          opacity="0.8"
                        />
                        {/* Target Reticle Crosshair Ticks */}
                        <line x1={node.cx - 24} y1={node.cy} x2={node.cx - 14} y2={node.cy} stroke="#38bdf8" strokeWidth="2" />
                        <line x1={node.cx + 14} y1={node.cy} x2={node.cx + 24} y2={node.cy} stroke="#38bdf8" strokeWidth="2" />
                        <line x1={node.cx} y1={node.cy - 24} x2={node.cx} y2={node.cy - 14} stroke="#38bdf8" strokeWidth="2" />
                        <line x1={node.cx} y1={node.cy + 14} x2={node.cx} y2={node.cy + 24} stroke="#38bdf8" strokeWidth="2" />
                      </>
                    )}
                  </g>
                );
              })}
          </svg>
        </div>

        {/* Right Column: Selected Muscle Telemetry Card */}
        <div className="lg:col-span-3">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0e121b]/90 border border-cyan-500/30 space-y-4 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-cyan-400" /> System Telemetry
              </span>
              {selectedMuscle && (
                <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Target Lock Active
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                {currentMeta ? currentMeta.name : 'Human Musculature System'}
              </h3>
              <p className="text-xs font-bold text-cyan-400">
                {currentMeta ? currentMeta.tag : 'Multi-Group Hypertrophy Target'}
              </p>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {currentMeta
                ? currentMeta.desc
                : 'Click any glossy 3D muscle plate or holographic node on the wireframe scanner to isolate exercises & periodized plans.'}
            </p>

            {currentMeta && (
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#07090e] border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-zinc-500 block">
                  Top Recommended Exercises
                </span>
                <p className="text-xs font-medium text-cyan-200">{currentMeta.focus}</p>
              </div>
            )}

            {selectedMuscle && (
              <button
                type="button"
                onClick={() => onSelectMuscle(null)}
                className="w-full py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold text-xs rounded-xl border border-cyan-500/30 transition-all shadow"
              >
                Reset Target Scanner
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
