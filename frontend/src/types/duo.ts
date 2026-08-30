export type PartnershipStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'REMOVED';
export type ChallengeType = 'POINT_RACE' | 'STREAK_DAYS' | 'DURATION_RACE';
export type ChallengeStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type PrizeStatus = 'NONE' | 'UNCLAIMED' | 'SETTLED';

export interface UserSummary {
  id: string;
  name: string;
  username?: string;
  email?: string;
}

export interface DuoPartnership {
  id: string;
  requester: UserSummary;
  addressee?: UserSummary;
  inviteCode?: string;
  status: PartnershipStatus;
  duoStreakCount: number;
  lastJointWorkoutDate?: string;
  createdAt: string;
}

export interface DuoScoreboard {
  userId: string;
  userName: string;
  totalPoints: number;
  attendancePoints: number;
  workoutPoints: number;
  prPoints: number;
  duoSyncPoints: number;
  currentStreak: number;
}

export interface ChallengeTask {
  dayIndex: number;
  dayOfWeek?: string;
  taskName: string;
  points: number;
}

export interface DuoChallenge {
  id: string;
  partnershipId?: string;
  title: string;
  challengeType: ChallengeType;
  targetValue: number;
  wagerPrize?: string;
  maxMembers?: number;
  durationDays?: number;
  inviteCode?: string;
  tasks?: ChallengeTask[];
  creatorId: string;
  creatorName: string;
  winnerId?: string;
  winnerName?: string;
  prizeStatus: PrizeStatus;
  status: ChallengeStatus;
  startDate?: string;
  endDate?: string;
  duoStreakCount: number;
  scores: DuoScoreboard[];
  createdAt: string;
}

export interface CreateDuoChallengeRequest {
  partnershipId?: string;
  title: string;
  challengeType: ChallengeType;
  targetValue: number;
  wagerPrize?: string;
  maxMembers?: number;
  durationDays?: number;
  tasks?: ChallengeTask[];
}

export interface DuoWhatsAppInvite {
  inviteCode: string;
  inviteUrl: string;
  whatsappUrl: string;
  requesterName: string;
  organizationName: string;
}
