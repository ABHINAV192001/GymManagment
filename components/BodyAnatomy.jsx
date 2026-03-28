"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Data extracted from react-body-highlighter (approximate) ---
// ViewBox updated: -70 0 240 230 to fit long labels like "Adductors (Inner Thighs)"

const DATA = {
    anterior: [
        {
            name: 'Chest',
            id: 'Chest',
            tx: 130, ty: 45, mx: 55, my: 50,
            direction: 'right',
            points: [
                '51.84 41.63 51.02 55.10 57.96 57.96 67.76 55.51 70.61 47.35 62.04 41.63',
                '29.80 46.53 31.43 55.51 40.82 57.96 48.16 55.10 47.76 42.04 37.55 42.04'
            ]
        },
        {
            name: 'Obliques',
            id: 'Obliques',
            tx: -30, ty: 85, mx: 35, my: 75,
            direction: 'left',
            points: [
                '68.57 63.27 67.35 57.14 58.78 59.59 60 64.08 60.41 83.27 65.71 78.78 66.53 69.80',
                '33.88 78.37 33.06 71.84 31.02 63.27 32.24 57.14 40.82 59.18 39.18 63.27 39.18 83.67'
            ]
        },
        {
            name: 'Abs',
            id: 'Abs',
            tx: 130, ty: 80, mx: 50, my: 80,
            direction: 'right',
            points: [
                '56.33 59.18 57.96 64.08 58.37 77.96 58.37 92.65 56.33 98.37 55.10 104.08 51.43 107.76 51.02 84.49 50.61 67.35 51.02 57.14',
                '43.67 58.78 48.57 57.14 48.98 67.35 48.57 84.49 48.16 107.35 44.49 103.67 40.82 91.43 40.82 78.37 41.22 64.49'
            ]
        },
        {
            name: 'Biceps',
            id: 'Biceps',
            tx: -30, ty: 65, mx: 24, my: 62,
            direction: 'left',
            points: [
                '16.73 68.16 17.96 71.43 22.86 66.12 28.98 53.88 27.76 49.39 20.41 55.92',
                '71.43 49.39 70.20 54.69 76.33 66.12 81.63 71.84 82.86 68.98 78.78 55.51'
            ]
        },
        {
            name: 'Forearms',
            id: 'Forearms',
            tx: 130, ty: 105, mx: 85, my: 90,
            direction: 'right',
            points: [
                '6.12 88.57 10.20 75.10 14.69 70.20 16.33 74.29 19.18 73.47 4.49 97.55 0 100',
                '84.49 69.80 83.27 73.47 80 73.06 95.10 98.37 100 100.41 93.47 89.39 89.80 76.33',
                '77.55 72.24 77.55 77.55 80.41 84.08 85.31 89.80 92.24 101.22 94.69 99.59',
                '6.94 101.22 13.47 90.61 18.78 84.08 21.63 77.14 21.22 71.84 4.90 98.78'
            ]
        },
        {
            name: 'Shoulders',
            id: 'Shoulders',
            tx: -30, ty: 40, mx: 25, my: 42,
            direction: 'left',
            points: [
                '78.37 53.06 79.59 47.76 79.18 41.22 75.92 37.96 71.02 36.33 72.24 42.86 71.43 47.35',
                '28.16 47.35 21.22 53.06 20 47.76 20.41 40.82 24.49 37.14 28.57 37.14 26.94 43.27'
            ]
        },
        {
            name: 'Traps',
            id: 'Traps',
            points: [
                '55.51 23.67 50.61 33.47 50.61 39.18 61.63 40 70.61 44.90 69.39 36.73 63.27 35.10 58.37 30.61',
                '28.98 44.90 30.20 37.14 36.33 35.10 41.22 30.20 44.49 24.49 48.98 33.88 48.57 39.18 37.96 39.59'
            ]
        },
        {
            name: 'Head',
            id: 'Head',
            points: ['42.45 2.86 40 11.84 42.04 19.59 46.12 23.27 49.80 25.31 54.69 22.45 57.55 19.18 59.18 10.20 57.14 2.45 49.80 0']
        },
        {
            name: 'Quads',
            id: 'Quads',
            tx: -30, ty: 150, mx: 35, my: 130,
            direction: 'left',
            points: [
                '34.69 98.78 37.14 108.16 37.14 127.76 34.29 137.14 31.02 132.65 29.39 120 28.16 111.43 29.39 100.82 32.24 94.69',
                '63.27 105.71 64.49 100 66.94 94.69 70.20 101.22 71.02 111.84 68.16 133.06 65.31 137.55 62.45 128.57 62.04 111.43',
                '38.78 129.39 38.37 112.24 41.22 118.37 44.49 129.39 42.86 135.10 40 146.12 36.33 146.53 35.51 140',
                '59.59 145.71 55.51 128.98 60.82 113.88 61.22 130.20 64.08 139.59 62.86 146.53',
                '32.65 138.37 26.53 145.71 25.71 136.73 25.71 127.35 26.94 114.29 29.39 133.47',
                '71.84 113.06 73.88 124.08 73.88 140.41 72.65 145.71 66.53 138.37 70.20 133.47'
            ]
        },
        {
            name: 'Abductors',
            id: 'Abductors',
            tx: -30, ty: 120, mx: 38, my: 105,
            direction: 'left',
            points: [
                '52.65 110.20 54.29 124.90 60 110.20 62.04 100 64.90 94.29 60 92.65 56.73 104.49',
                '47.76 110.61 44.90 125.31 42.04 115.92 40.41 113.06 39.59 107.35 37.96 102.45 34.69 93.88 39.59 92.24 41.63 99.18 43.67 105.31'
            ]
        },
        {
            name: 'Knees',
            id: 'Knees',
            points: [
                '33.88 140 34.69 143.27 35.51 147.35 36.33 151.02 35.10 156.73 29.80 156.73 27.35 152.65 27.35 147.35 30.20 144.08',
                '65.71 140 72.24 147.76 72.24 152.24 69.80 157.14 64.90 156.73 62.86 151.02'
            ]
        },
        {
            name: 'Calves',
            id: 'Calves',
            points: [
                '71.43 160.41 73.47 153.47 76.73 161.22 79.59 167.76 78.37 187.76 79.59 195.51 74.69 195.51',
                '24.90 194.69 27.76 164.90 28.16 160.41 26.12 154.29 24.90 157.55 22.45 161.63 20.82 167.76 22.04 188.16 20.82 195.51',
                '72.65 195.10 69.80 159.18 65.31 158.37 64.08 162.45 64.08 165.31 65.71 177.14',
                '35.51 158.37 35.92 162.45 35.92 166.94 35.10 172.24 35.10 176.73 32.24 182.04 30.61 187.35 26.94 194.69 27.35 187.76 28.16 180.41 28.57 175.51 28.98 169.80 29.80 164.08 30.20 158.78'
            ]
        },
        {
            name: 'Adductors', // Inner Thighs
            id: 'Adductors',
            tx: 130, ty: 130, mx: 55, my: 120, // Inner thigh
            direction: 'right',
            points: [
                '48.09 122.98 44.68 122.98 41.28 125.53 45.11 144.26 48.51 135.74 48.94 129.36',
                '51.91 122.55 55.74 123.40 59.15 125.96 54.89 144.26 51.91 136.17 51.06 129.36'
            ]
        },
        {
            name: 'Cardio',
            id: 'Cardio',
            tx: 130, ty: 160, mx: 110, my: 160,
            direction: 'right',
            points: []
        }
    ],
    posterior: [
        {
            name: 'Traps',
            id: 'Traps',
            tx: -30, ty: 30, mx: 42, my: 30,
            direction: 'left',
            points: [
                '44.68 21.70 47.66 21.70 47.23 38.30 47.66 64.68 38.30 53.19 35.32 40.85 31.06 36.60 39.15 33.19 43.83 27.23',
                '52.34 21.70 55.74 21.70 56.60 27.23 60.85 32.77 68.94 36.60 64.68 40.43 61.70 53.19 52.34 64.68 53.19 38.30'
            ]
        },
        {
            name: 'Rear Shoulders',
            id: 'Shoulders',
            tx: -30, ty: 50, mx: 25, my: 45,
            direction: 'left',
            points: [
                '29.36 37.02 22.98 39.15 17.45 44.26 18.30 53.62 24.26 49.36 27.23 46.38',
                '71.06 37.02 78.30 39.57 82.55 44.68 81.70 53.62 74.89 48.94 72.34 45.11'
            ]
        },
        {
            name: 'Lats',
            id: 'Lats',
            tx: 130, ty: 65, mx: 65, my: 60,
            direction: 'right',
            points: [
                '31.06 38.72 28.09 48.94 28.51 55.32 34.04 75.32 47.23 71.06 47.23 66.38 36.60 54.04 33.62 41.28',
                '68.94 38.72 71.91 49.36 71.49 56.17 65.96 75.32 52.77 71.06 52.77 66.38 63.40 54.47 66.38 41.70'
            ]
        },
        {
            name: 'Upper Back',
            id: 'Traps',
            tx: -30, ty: 70, mx: 50, my: 50,
            direction: 'left',
            points: []
        },
        {
            name: 'Triceps',
            id: 'Triceps',
            tx: 130, ty: 85, mx: 80, my: 65,
            direction: 'right',
            points: [
                '26.81 49.79 17.87 55.74 14.47 72.34 16.60 81.70 21.70 63.83 26.81 55.74',
                '73.62 50.21 82.13 55.74 85.96 73.19 83.40 82.13 77.87 62.98 73.19 55.74',
                '26.81 58.30 26.81 68.51 22.98 75.32 19.15 77.45 22.55 65.53',
                '72.77 58.30 77.02 64.68 80.43 77.45 76.60 75.32 72.77 68.94'
            ]
        },
        {
            name: 'Lower Back',
            id: 'Lower Back',
            tx: 130, ty: 105, mx: 50, my: 95,
            direction: 'right',
            points: [
                '47.66 72.77 34.47 77.02 35.32 83.40 49.36 102.13 46.81 82.98',
                '52.34 72.77 65.53 77.02 64.68 83.40 50.64 102.13 53.19 83.83'
            ]
        },
        {
            name: 'Glutes',
            id: 'Glutes',
            tx: 130, ty: 125, mx: 55, my: 110,
            direction: 'right',
            points: [
                '44.68 99.57 30.21 108.51 29.79 118.72 31.49 125.96 47.23 121.28 49.36 114.89',
                '55.32 99.15 51.06 114.47 52.34 120.85 68.09 125.96 69.79 119.15 69.36 108.51'
            ]
        },
        {
            name: 'Hamstrings',
            id: 'Hamstrings',
            tx: 130, ty: 145, mx: 65, my: 140,
            direction: 'right',
            points: [
                '28.94 122.13 31.06 129.36 36.60 125.96 35.32 135.32 34.47 150.21 29.36 158.30 28.94 146.81 27.66 141.28 27.23 131.49',
                '71.49 121.70 69.36 128.94 63.83 125.96 65.53 136.60 66.38 150.21 71.06 158.30 71.49 147.66 72.77 142.13 73.62 131.91',
                '38.72 125.53 44.26 145.96 40.43 166.81 36.17 152.77 37.02 135.32',
                '61.70 125.53 63.40 136.17 64.26 153.19 60 166.81 56.17 146.38'
            ]
        },
        {
            name: 'Calves',
            id: 'Calves',
            tx: 130, ty: 175, mx: 68, my: 170,
            direction: 'right',
            points: [
                '29.36 160.43 28.51 167.23 24.68 179.57 23.83 192.77 25.53 197.02 28.51 193.19 29.79 180 31.91 171.06 31.91 166.81',
                '37.45 165.11 35.32 167.66 33.19 171.91 31.06 180.43 30.21 191.91 34.04 200 38.72 190.64 39.15 168.94',
                '62.98 165.11 61.28 168.51 61.70 190.64 66.38 199.57 70.64 191.91 68.94 179.57 66.81 170.21',
                '70.64 160.43 72.34 168.51 75.74 179.15 76.60 192.77 74.47 196.60 72.34 193.62 70.64 179.57 68.09 168.09',
                '28.51 195.74 30.21 195.74 33.62 201.70 30.64 220 28.51 213.62 26.81 198.30',
                '69.79 195.74 71.91 195.74 73.62 198.30 71.91 213.19 70.21 219.57 67.23 202.13'
            ]
        },
        {
            name: 'Head',
            id: 'Head',
            points: ['50.64 0 45.96 0.85 40.85 5.53 40.43 12.77 45.11 20 55.74 20 59.15 13.62 59.57 4.68 55.74 1.28']
        }
    ]
};

const pointsToPath = (points) => {
    const coords = points.trim().split(/\s+/);
    if (coords.length < 2) return "";
    let d = `M ${coords[0]} ${coords[1]}`;
    for (let i = 2; i < coords.length; i += 2) {
        d += ` L ${coords[i]} ${coords[i + 1]}`;
    }
    return d + " Z";
};

const Annotation = ({ data, selectedMuscle, onSelect }) => {
    if (data.tx === undefined || data.ty === undefined) return null;

    const isSelected = selectedMuscle === data.id;
    return (
        <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cursor-pointer"
            onClick={() => onSelect(data.id)}
        >
            <text
                x={data.tx}
                y={data.ty}
                textAnchor={data.direction === 'left' ? 'end' : 'start'}
                dominantBaseline="middle"
                className={`text-[8px] fill-slate-800 dark:fill-white hover:fill-amber-500 dark:hover:fill-amber-400 transition-colors ${isSelected ? 'fill-amber-500 font-bold' : ''}`}
                style={{ fontSize: '6px', fontFamily: 'sans-serif' }}
            >
                {data.name}
            </text>

            <path
                d={data.direction === 'left'
                    ? `M ${data.tx + 2} ${data.ty + 2} L ${data.mx} ${data.my}`
                    : `M ${data.tx - 2} ${data.ty + 2} L ${data.mx} ${data.my}`
                }
                className={
                    isSelected
                        ? "stroke-amber-500 dark:stroke-amber-400"
                        : "stroke-slate-300 dark:stroke-white/40"
                }
                strokeWidth="0.5"
                fill="none"
            />

            <rect
                x={data.mx - 1.5}
                y={data.my - 1.5}
                width="3"
                height="3"
                fill="none"
                className={
                    isSelected
                        ? "stroke-amber-500 dark:stroke-amber-400"
                        : "stroke-slate-400 dark:stroke-white/60"
                }
                strokeWidth="0.5"
            />
        </motion.g>
    );
}

const BodyAnatomy = ({ selectedMuscle, onSelect }) => {
    const [view, setView] = useState('front');

    const toggleView = () => {
        setView(prev => prev === 'front' ? 'back' : 'front');
    };

    return (
        <div className="relative w-full max-w-[450px] aspect-[210/230] bg-white dark:bg-neutral-900 rounded-3xl shadow-xl dark:shadow-2xl overflow-hidden flex flex-col items-center border border-gray-200 dark:border-slate-800 transition-colors duration-300">

            <div className="absolute bottom-4 right-4 z-20">
                <button
                    onClick={toggleView}
                    className="flex items-center space-x-2 bg-amber-50 dark:bg-amber-100/90 hover:bg-amber-100 dark:hover:bg-amber-200 text-amber-900 border border-amber-200 dark:border-amber-300 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                    <span className="text-lg">⟳</span>
                    <span>Rotate</span>
                </button>
            </div>

            <div className="flex-1 w-full flex items-center justify-center relative p-0">
                <svg viewBox="-70 0 240 230" className="w-full h-full">
                    <AnimatePresence mode="wait">
                        <motion.g
                            key={view}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            {(view === 'front' ? DATA.anterior : DATA.posterior).map((muscle, i) => (
                                <React.Fragment key={muscle.id + i}>
                                    {muscle.points && muscle.points.map((p, idx) => (
                                        <motion.path
                                            key={`${muscle.id}-${idx}`}
                                            d={pointsToPath(p)}
                                            initial={{ fill: "#9ca3af", opacity: 0.5 }}
                                            animate={{
                                                fill: selectedMuscle === muscle.id ? "#fbbf24" : "currentColor", // uses text color
                                                opacity: selectedMuscle === muscle.id ? 1 : 0.6
                                            }}
                                            whileHover={{ fill: "#fbbf24", opacity: 0.9 }}
                                            onClick={() => onSelect(muscle.id)}
                                            // Using classes for light/dark properties where standard fill/stroke is insufficient
                                            className={`cursor-pointer transition-colors duration-300 ${selectedMuscle === muscle.id ? '' : 'text-slate-300 dark:text-slate-500' // Base muscle color
                                                }`}
                                            stroke="currentColor"
                                            strokeWidth="0.5"
                                        />
                                    ))}
                                    {/* Render Annotations separately to be on top */}
                                    <Annotation
                                        key={`anno-${i}`}
                                        data={muscle}
                                        selectedMuscle={selectedMuscle}
                                        onSelect={onSelect}
                                    />
                                </React.Fragment>
                            ))}
                        </motion.g>
                    </AnimatePresence>
                </svg>
            </div>
        </div>
    );
};

export default BodyAnatomy;
