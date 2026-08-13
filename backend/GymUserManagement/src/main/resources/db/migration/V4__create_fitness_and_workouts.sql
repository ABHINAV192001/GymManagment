-- 5. FITNESS & WORKOUTS
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    muscle_group VARCHAR(255),
    description VARCHAR(1000),
    video_url VARCHAR(255)
);

CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    category VARCHAR(255),
    difficulty VARCHAR(255),
    duration VARCHAR(255),
    calories INTEGER
);

CREATE TABLE workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    sets INTEGER,
    reps VARCHAR(255),
    time INTEGER
);

CREATE TABLE weekly_workout_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    monday_workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
    tuesday_workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
    wednesday_workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
    thursday_workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
    friday_workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
    saturday_workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
    sunday_workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL
);

CREATE TABLE trainer_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating FLOAT NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
