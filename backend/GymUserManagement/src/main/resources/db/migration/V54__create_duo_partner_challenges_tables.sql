-- Flyway Migration V54: Create Duo Partner Partnerships and Challenges Schema

CREATE TABLE IF NOT EXISTS duo_partnerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    duo_streak_count INT NOT NULL DEFAULT 0,
    last_joint_workout_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_duo_partnership UNIQUE (org_id, requester_id, addressee_id)
);

CREATE INDEX idx_duo_partnerships_org ON duo_partnerships(org_id);
CREATE INDEX idx_duo_partnerships_requester ON duo_partnerships(requester_id);
CREATE INDEX idx_duo_partnerships_addressee ON duo_partnerships(addressee_id);

CREATE TABLE IF NOT EXISTS duo_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    partnership_id UUID NOT NULL REFERENCES duo_partnerships(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    challenge_type VARCHAR(32) NOT NULL, -- POINT_RACE, STREAK_DAYS, DURATION_RACE
    target_value INT NOT NULL DEFAULT 10,
    wager_prize VARCHAR(512),
    winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    prize_status VARCHAR(32) NOT NULL DEFAULT 'NONE', -- NONE, UNCLAIMED, SETTLED
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- PENDING, ACTIVE, COMPLETED, CANCELLED
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_duo_challenges_org ON duo_challenges(org_id);
CREATE INDEX idx_duo_challenges_partnership ON duo_challenges(partnership_id);
CREATE INDEX idx_duo_challenges_status ON duo_challenges(status);

CREATE TABLE IF NOT EXISTS duo_challenge_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES duo_challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_points INT NOT NULL DEFAULT 0,
    attendance_points INT NOT NULL DEFAULT 0,
    workout_points INT NOT NULL DEFAULT 0,
    pr_points INT NOT NULL DEFAULT 0,
    duo_sync_points INT NOT NULL DEFAULT 0,
    current_streak INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_duo_challenge_user UNIQUE (challenge_id, user_id)
);

CREATE INDEX idx_duo_scores_challenge ON duo_challenge_scores(challenge_id);
CREATE INDEX idx_duo_scores_user ON duo_challenge_scores(user_id);

CREATE TABLE IF NOT EXISTS duo_challenge_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES duo_challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL, -- ATTENDANCE, WORKOUT, STRENGTH_PR, DUO_SYNC
    points_awarded INT NOT NULL DEFAULT 0,
    description VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_duo_events_challenge ON duo_challenge_events(challenge_id);
CREATE INDEX idx_duo_events_user ON duo_challenge_events(user_id);
