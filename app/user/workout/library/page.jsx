"use client";

import { useState } from "react";

export default function WorkoutLibraryPage() {
    const [selectedPart, setSelectedPart] = useState("All");

    const bodyParts = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Abs", "Cardio"];

    const exercises = [
        { id: 1, name: "Bench Press", part: "Chest", difficulty: "Intermediate" },
        { id: 2, name: "Squat", part: "Legs", difficulty: "Advanced" },
        { id: 3, name: "Deadlift", part: "Back", difficulty: "Advanced" },
        { id: 4, name: "Pull Up", part: "Back", difficulty: "Intermediate" },
        { id: 5, name: "Dumbbell Curl", part: "Arms", difficulty: "Beginner" },
        { id: 6, name: "Overhead Press", part: "Shoulders", difficulty: "Intermediate" },
        { id: 7, name: "Plank", part: "Abs", difficulty: "Beginner" },
        { id: 8, name: "Treadmill Run", part: "Cardio", difficulty: "Beginner" },
    ];

    const filteredExercises = selectedPart === "All"
        ? exercises
        : exercises.filter(ex => ex.part === selectedPart);

    return (
        <div className="page-container">
            <header className="page-header">
                <h1>Exercise Library</h1>
                <div className="search-bar">
                    <input type="text" placeholder="Search exercises..." />
                </div>
            </header>

            <div className="filters">
                {bodyParts.map(part => (
                    <button
                        key={part}
                        className={`filter-btn ${selectedPart === part ? "active" : ""}`}
                        onClick={() => setSelectedPart(part)}
                    >
                        {part}
                    </button>
                ))}
            </div>

            <div className="library-grid">
                {filteredExercises.map((ex) => (
                    <div key={ex.id} className="lib-card">
                        <div className="card-img">
                            <span>🎥</span>
                        </div>
                        <div className="card-content">
                            <h3>{ex.name}</h3>
                            <div className="tags">
                                <span className="tag part">{ex.part}</span>
                                <span className="tag diff">{ex.difficulty}</span>
                            </div>
                            <button className="add-btn">+ Add to Plan</button>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
        .page-container {
          color: #fff;
        }

        .page-header {
          margin-bottom: 30px;
        }

        .search-bar input {
          width: 100%;
          max-width: 400px;
          padding: 12px 20px;
          background: #111;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 30px;
          color: #fff;
          margin-top: 15px;
        }

        .filters {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 10px;
          margin-bottom: 30px;
        }

        .filter-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #aaa;
          padding: 8px 20px;
          border-radius: 20px;
          cursor: pointer;
          white-space: nowrap;
          transition: 0.3s;
        }

        .filter-btn.active,
        .filter-btn:hover {
          background: var(--primary);
          color: #000;
          border-color: var(--primary);
        }

        .library-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
        }

        .lib-card {
          background: #111;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          overflow: hidden;
          transition: 0.3s;
        }

        .lib-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
        }

        .card-img {
          height: 120px;
          background: #222;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
        }

        .card-content {
          padding: 15px;
        }

        .card-content h3 {
          margin: 0 0 10px;
          font-size: 16px;
        }

        .tags {
          display: flex;
          gap: 8px;
          margin-bottom: 15px;
        }

        .tag {
          font-size: 10px;
          padding: 4px 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.05);
          color: #888;
        }

        .add-btn {
          width: 100%;
          padding: 8px;
          background: transparent;
          border: 1px solid var(--primary);
          color: var(--primary);
          border-radius: 8px;
          cursor: pointer;
          transition: 0.3s;
        }

        .add-btn:hover {
          background: var(--primary);
          color: #000;
        }
      `}</style>
        </div>
    );
}
