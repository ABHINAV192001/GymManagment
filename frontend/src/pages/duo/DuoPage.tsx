import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Flame,
  Zap,
  Users,
  Award,
  Gift,
  X,
  Calendar,
  CheckCircle,
  Plus,
  Share2,
  Trash2,
  Copy,
  Check,
  TrendingUp,
  UserPlus,
  Info,
  Edit3,
  UserMinus
} from 'lucide-react';
import {
  getMyPartner,
  getPendingInvites,
  getActiveChallenges,
  acceptPartnerInvite,
  logDuoEvent,
  deleteDuoChallenge,
  removeParticipantFromChallenge,
  removeDuoPartnership
} from '../../lib/api/duo';
import { getUserProfile } from '../../lib/api/user';
import { InvitePartnerModal } from '../member-portal/components/InvitePartnerModal';
import { CreateDuoChallengeModal } from '../member-portal/components/CreateDuoChallengeModal';
import { DuoVictoryModal } from '../member-portal/components/DuoVictoryModal';
import { JoinDuoChallengeModal } from '../member-portal/components/JoinDuoChallengeModal';
import { VerifyPartnerTaskModal } from '../member-portal/components/VerifyPartnerTaskModal';

export const DuoPage: React.FC = () => {
  const [partner, setPartner] = useState<DuoPartnership | null>(null);
  const [pendingInvites, setPendingInvites] = useState<DuoPartnership[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<DuoChallenge[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals & Share State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<DuoChallenge | null>(null);
  const [shareChallenge, setShareChallenge] = useState<DuoChallenge | null>(null);
  const [copiedCodeLink, setCopiedCodeLink] = useState(false);
  const [selectedVictoryChallenge, setSelectedVictoryChallenge] = useState<DuoChallenge | null>(null);
  const [verifyTaskTarget, setVerifyTaskTarget] = useState<{ id: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'SHOWDOWN' | 'HUB'>('SHOWDOWN');

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!window.confirm('Are you sure you want to delete this challenge? All recorded scores and task schedules will be permanently deleted.')) {
      return;
    }
    try {
      await deleteDuoChallenge(challengeId);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete challenge');
    }
  };

  const handleRemoveParticipant = async (challengeId: string, participantUserId: string, participantName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${participantName} from this challenge?`)) {
      return;
    }
    try {
      await removeParticipantFromChallenge(challengeId, participantUserId);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove participant');
    }
  };

  const handleRemovePartnership = async (partnershipId: string, partnerName: string) => {
    if (!window.confirm(`Are you sure you want to unlink partner connection with ${partnerName}?`)) {
      return;
    }
    try {
      await removeDuoPartnership(partnershipId);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to unlink partner connection');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [partnerData, pendingData, challengesData, profileData] = await Promise.all([
        getMyPartner(),
        getPendingInvites(),
        getActiveChallenges(),
        getUserProfile().catch(() => null),
      ]);
      setPartner(partnerData);
      setPendingInvites(pendingData);
      setActiveChallenges(challengesData);
      if (profileData) {
        setCurrentUser(profileData);
      }
    } catch (err) {
      console.error('Failed to load Gym Duo data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAcceptInvite = async (partnershipId: string) => {
    try {
      await acceptPartnerInvite(partnershipId);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to accept partner invite');
    }
  };

  const handleLogWorkoutForPartner = async (targetUserId: string, targetUserName: string) => {
    try {
      await logDuoEvent('WORKOUT', `Verified & logged workout session for ${targetUserName}`, targetUserId);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to log workout session for partner');
    }
  };

  const currentChallenge = activeChallenges.length > 0 ? activeChallenges[0] : null;

  const getActivePartnerName = () => {
    if (partner) {
      return partner.addressee?.name || partner.requester?.name || 'Linked Partner';
    }
    if (currentChallenge && currentChallenge.scores && currentChallenge.scores.length > 0) {
      const otherMembers = currentChallenge.scores.filter(s => s.userId !== currentChallenge.creatorId);
      if (otherMembers.length > 0) {
        return otherMembers.map(m => m.userName).join(', ');
      } else {
        return `Waiting for Members (${currentChallenge.scores.length}/${currentChallenge.maxMembers})`;
      }
    }
    return 'No Partner Linked';
  };

  const getDuoStreakCount = () => {
    if (partner) return partner.duoStreakCount;
    if (currentChallenge && currentChallenge.scores && currentChallenge.scores.length > 0) {
      return Math.max(...currentChallenge.scores.map(s => s.currentStreak || 0));
    }
    return 0;
  };

  const isHostUser = currentUser && currentChallenge && currentUser.id === currentChallenge.creatorId;

  if (loading && !activeChallenges.length && !partner) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-28 sm:pb-12">
      
      {/* ========================================================================= */}
      {/* HERO HEADER & STATS BAR                                                    */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-yellow-300/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-yellow-200 fill-yellow-200 animate-pulse" />
              <span>Partner Workout Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              Gym Duo & Partner Streaks 🔥
            </h1>
            <p className="text-sm text-amber-100 max-w-xl">
              Challenge your gym partner to strength & consistency showdowns, keep daily workout streaks, and wager fun custom prizes!
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white text-orange-600 hover:bg-orange-50 font-bold text-xs shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              Create Challenge
            </button>

            <button
              onClick={() => setIsJoinOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-950/40 hover:bg-amber-950/60 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
            >
              <Users className="w-4 h-4 text-yellow-300" />
              Join Challenge
            </button>
          </div>
        </div>

        {/* Header Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/20 relative z-10 text-xs">
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
            <span className="text-amber-100 text-[11px] font-semibold block">Duo Flame Streak</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Flame className="w-5 h-5 text-yellow-300 fill-yellow-300" />
              <span className="text-lg font-black">{getDuoStreakCount()} Days</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
            <span className="text-amber-100 text-[11px] font-semibold block">Active Partner</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Users className="w-4 h-4 text-white" />
              <span className="text-sm font-bold truncate">
                {getActivePartnerName()}
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
            <span className="text-amber-100 text-[11px] font-semibold block">Active Challenge</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Trophy className="w-4 h-4 text-yellow-200" />
              <span className="text-sm font-bold truncate">
                {currentChallenge ? currentChallenge.title : 'None'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Pending Invites Alert */}
      {pendingInvites.length > 0 && !partner && (
        <div className="p-5 bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Users className="w-6 h-6 text-yellow-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Partner Workout Invitation Received!</h3>
              <p className="text-xs text-orange-100 mt-0.5">
                <b>{pendingInvites[0].requester.name}</b> wants to link up as your gym partner!
              </p>
            </div>
          </div>
          <button
            onClick={() => handleAcceptInvite(pendingInvites[0].id)}
            className="px-5 py-2.5 bg-white text-orange-600 font-extrabold text-xs rounded-xl shadow-md hover:bg-orange-50 transition-all shrink-0"
          >
            Accept Partner Request
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2 overflow-x-auto scrollbar-none max-w-full">
        <button
          onClick={() => setActiveTab('SHOWDOWN')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shrink-0 transition-all ${
            activeTab === 'SHOWDOWN'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Active Showdown & Scoreboard</span>
        </button>

        <button
          onClick={() => setActiveTab('HUB')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shrink-0 transition-all ${
            activeTab === 'HUB'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Partner Connection Hub</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACTIVE SHOWDOWN & SCOREBOARD                                        */}
      {/* ========================================================================= */}
      {activeTab === 'SHOWDOWN' && (
        <div className="space-y-6">
          {currentChallenge ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Matchup Card */}
              <div className="lg:col-span-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
                
                {/* Challenge Header & Actions Row */}
                <div className="flex flex-col gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                        Active Challenge
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {currentChallenge.title}
                      </h2>
                    </div>

                    <span className="px-3.5 py-1.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 font-extrabold text-xs rounded-xl shadow-xs self-start sm:self-auto shrink-0">
                      Target: {currentChallenge.targetValue} {currentChallenge.challengeType === 'POINT_RACE' ? 'Points' : 'Days'}
                    </span>
                  </div>

                  {/* Action Buttons Toolbar (Role & Permission Gated) */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {/* Edit Challenge Button (Host Only) */}
                    {isHostUser && (
                      <button
                        onClick={() => setEditingChallenge(currentChallenge)}
                        className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs"
                        title="Edit Challenge Settings & Tasks"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Challenge</span>
                      </button>
                    )}

                    {/* Invite Code & Share Button */}
                    {currentChallenge.inviteCode && (
                      <button
                        onClick={() => setShareChallenge(currentChallenge)}
                        className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs"
                        title="Share Challenge Invite Link & Code"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Invite Link</span>
                      </button>
                    )}

                    {/* Delete Challenge Button (Host Only) */}
                    {isHostUser && (
                      <button
                        onClick={() => handleDeleteChallenge(currentChallenge.id)}
                        className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs"
                        title="Delete Challenge"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Wager Banner */}
                {currentChallenge.wagerPrize && (
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200/70 dark:border-amber-800/60 rounded-2xl flex items-center gap-3">
                    <Gift className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                        Wagered Prize
                      </span>
                      <p className="text-sm font-extrabold text-amber-900 dark:text-amber-100">
                        "{currentChallenge.wagerPrize}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Score Comparison Cards */}
                <div className="space-y-4 pt-1">
                  {currentChallenge.scores.map((score) => {
                    const target = currentChallenge.targetValue || 10;
                    const percentage = Math.min(100, Math.round((score.totalPoints / target) * 100));
                    const isCreator = score.userId === currentChallenge.creatorId;
                    const isSelf = currentUser && score.userId === currentUser.id;

                    return (
                      <div key={score.userId} className="p-4 sm:p-5 bg-gray-50/70 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800/80 space-y-3.5 shadow-xs">
                        
                        {/* Top Row: User Avatar + Name + Badges + Score Display */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          {/* Left: Avatar, Name & Badges */}
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                              {score.userName.charAt(0)}
                            </div>
                            <span className="font-extrabold text-sm text-gray-900 dark:text-white truncate">{score.userName}</span>
                            {isCreator && (
                              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] rounded-md border border-amber-300 dark:border-amber-800 shrink-0">
                                Host
                              </span>
                            )}
                            {isSelf && (
                              <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-extrabold text-[10px] rounded-md shrink-0">
                                You
                              </span>
                            )}
                          </div>

                          {/* Right: Score Points */}
                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <span className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 whitespace-nowrap">
                              {score.totalPoints} / {target} pts
                            </span>
                            {isHostUser && !isCreator && (
                              <button
                                onClick={() => handleRemoveParticipant(currentChallenge.id, score.userId, score.userName)}
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors shrink-0"
                                title={`Remove ${score.userName} from challenge`}
                              >
                                <UserMinus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Middle Row: Progress Bar */}
                        <div className="w-full h-3.5 bg-gray-200/80 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 border border-gray-200/60 dark:border-gray-700/50">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full transition-all duration-500 shadow-xs"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        {/* Bottom Row: Breakdown Pills & Verification Action */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-gray-200/40 dark:border-gray-800/60">
                          {/* Stats Pills */}
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 flex-wrap">
                            <span>Check-ins: <b className="text-gray-700 dark:text-gray-200">+{score.attendancePoints}</b></span>
                            <span>•</span>
                            <span>Workouts: <b className="text-gray-700 dark:text-gray-200">+{score.workoutPoints}</b></span>
                            <span>•</span>
                            <span>Duo Sync: <b className="text-gray-700 dark:text-gray-200">+{score.duoSyncPoints}</b></span>
                            <span>•</span>
                            <span>Streak: <b className="text-gray-700 dark:text-gray-200">{score.currentStreak} Days</b></span>
                          </div>

                          {/* Action Button / Partner Hint */}
                          <div className="self-end sm:self-auto shrink-0">
                            {!isSelf ? (
                              <button
                                onClick={() => setVerifyTaskTarget({ id: score.userId, name: score.userName })}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
                                title={`Verify & Log today's task for ${score.userName}`}
                              >
                                <Zap className="w-3.5 h-3.5 text-yellow-200 fill-current" />
                                <span>Verify Task (+10 Pts)</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold italic">
                                (Partner logs for you)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Daily Task Breakdown Schedule Section */}
                {currentChallenge.tasks && currentChallenge.tasks.length > 0 && (
                  <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50/70 to-orange-50/70 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-3xl space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                        <span>Daily Challenge Schedule ({currentChallenge.tasks.length} Tasks)</span>
                      </h3>
                      <span className="px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-full text-xs font-extrabold self-start sm:self-auto shrink-0">
                        {currentChallenge.durationDays || currentChallenge.tasks.length} Days Duration
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
                      {currentChallenge.tasks.map((task) => (
                        <div key={task.dayIndex} className="p-3.5 bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 rounded-2xl space-y-1.5 shadow-xs hover:border-amber-400 transition-all">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-extrabold">
                              <span>Day {task.dayIndex}</span>
                              {task.dayOfWeek && <span>• {task.dayOfWeek}</span>}
                            </span>
                            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-extrabold rounded-md text-[10px] border border-amber-300 dark:border-amber-800/60">
                              +{task.points} Pts
                            </span>
                          </div>
                          <p className="text-xs font-extrabold text-gray-900 dark:text-white line-clamp-2">
                            {task.taskName}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Action Footer */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                    Cross-logging Rule: <b>Partners log workouts for each other (+2 Pts / 1 Log Per Day Limit)!</b>
                  </span>
                </div>
              </div>

              {/* Right Column: Duo Sidecard */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Challenge Profile
                  </h3>

                  {partner ? (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-lg flex items-center justify-center shadow-md">
                        {(partner.addressee?.name || partner.requester?.name || 'P').charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">{partner.addressee?.name || partner.requester?.name || 'Partner'}</h4>
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                          <Flame className="w-3.5 h-3.5 fill-amber-500" />
                          {partner.duoStreakCount} Days Joint Streak
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 rounded-2xl space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-300">
                        <span>Participants Limit</span>
                        <span>{currentChallenge.scores?.length || 1} / {currentChallenge.maxMembers || 2} Members</span>
                      </div>
                      {currentChallenge.inviteCode && (
                        <div className="pt-2 border-t border-amber-200/50 dark:border-amber-800/50 flex items-center justify-between text-xs font-mono">
                          <span className="text-gray-400 font-sans">Invite Code:</span>
                          <span className="font-extrabold text-amber-400">{currentChallenge.inviteCode}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Launch Another Challenge
                  </button>
                </div>
              </div>
            </div>
          ) : partner ? (
            <div className="p-10 text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl space-y-4">
              <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-950/60 text-amber-500 rounded-3xl flex items-center justify-center">
                <Trophy className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Partner Linked & Ready!</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  You are paired up with <b>{partner.addressee?.name || partner.requester?.name || 'Partner'}</b>. Launch a head-to-head points or streak challenge to start competing!
                </p>
              </div>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
              >
                <Trophy className="w-4 h-4" />
                Start Challenge & Wager
              </button>
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl space-y-4">
              <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-950/60 text-amber-500 rounded-3xl flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Gym Partner Linked Yet</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Invite a gym member in your organization or launch a custom challenge with an invite code!
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsInviteOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs rounded-2xl transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite Gym Partner
                </button>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
                >
                  <Trophy className="w-4 h-4" />
                  Create Challenge
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PARTNER HUB                                                         */}
      {/* ========================================================================= */}
      {activeTab === 'HUB' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Partner Connection Hub</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manage gym workout partners and active challenge members within your organization</p>
            </div>
            <button
              onClick={() => setIsInviteOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Invite New Partner
            </button>
          </div>

          {/* Section 1: Linked 1-on-1 Partner */}
          {partner && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Linked 1-on-1 Partner</h3>
              <div className="p-5 border border-amber-200 dark:border-amber-900/50 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-xl flex items-center justify-center shadow-lg">
                    {(partner.addressee?.name || partner.requester?.name || 'P').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-white">{partner.addressee?.name || partner.requester?.name || 'Partner'}</h3>
                    <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1.5 mt-0.5">
                      <Flame className="w-4 h-4 fill-amber-500" />
                      {partner.duoStreakCount} Days Gym Streak Counter
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs rounded-full">
                    Active Buddy
                  </span>
                  <button
                    onClick={() => handleRemovePartnership(partner.id, partner.addressee?.name || partner.requester?.name || 'Partner')}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors"
                    title="Unlink Partner Connection"
                  >
                    <UserMinus className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Active Challenge Members */}
          {currentChallenge && currentChallenge.scores && currentChallenge.scores.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Active Challenge Members ({currentChallenge.title})
                </h3>
                <span className="text-xs text-gray-400 font-medium">
                  {currentChallenge.scores.length} / {currentChallenge.maxMembers} Members Joined
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentChallenge.scores.map(member => {
                  const isHost = member.userId === currentChallenge.creatorId;
                  return (
                    <div key={member.userId} className="p-4 border border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-800/40 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-sm flex items-center justify-center shadow-md">
                          {member.userName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">{member.userName}</h4>
                            {isHost && (
                              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-extrabold text-[10px] rounded-md border border-amber-300 dark:border-amber-800">
                                Host
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                            <span>Points: <b className="text-amber-500">{member.totalPoints} pts</b></span>
                            <span>•</span>
                            <span>Streak: <b>{member.currentStreak}d</b></span>
                          </p>
                        </div>
                      </div>

                      {!isHost && (
                        <button
                          onClick={() => handleRemoveParticipant(currentChallenge.id, member.userId, member.userName)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors"
                          title={`Remove ${member.userName} from challenge`}
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!partner && (!currentChallenge || !currentChallenge.scores || currentChallenge.scores.length === 0) && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-xs">
              No active partner or challenge connected yet. Search for a gym member or share a challenge invite code to pair up!
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SCORING RULES                                                       */}
      {/* Modals */}
      <InvitePartnerModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={loadData}
      />

      <CreateDuoChallengeModal
        isOpen={isCreateOpen || !!editingChallenge}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingChallenge(null);
        }}
        partnership={partner || undefined}
        editingChallenge={editingChallenge}
        onSuccess={async () => {
          setIsCreateOpen(false);
          setEditingChallenge(null);
          await loadData();
        }}
      />

      <JoinDuoChallengeModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onSuccess={loadData}
      />

      <VerifyPartnerTaskModal
        isOpen={!!verifyTaskTarget}
        onClose={() => setVerifyTaskTarget(null)}
        challenge={currentChallenge}
        targetMember={verifyTaskTarget}
        onSuccess={loadData}
      />

      {selectedVictoryChallenge && (
        <DuoVictoryModal
          isOpen={!!selectedVictoryChallenge}
          onClose={() => setSelectedVictoryChallenge(null)}
          challenge={selectedVictoryChallenge}
          onSettled={loadData}
        />
      )}

      {/* Challenge Share Invite Modal */}
      {shareChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-gray-900 border border-amber-500/30 text-white rounded-3xl p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Share2 className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base">Share Challenge Invite</h3>
              </div>
              <button
                onClick={() => setShareChallenge(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Invite Code Display */}
              <div className="p-4 bg-gray-800/80 rounded-2xl border border-gray-700 space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Challenge Invite Code
                </span>
                <p className="text-xl font-mono font-black text-amber-400 tracking-wider">
                  {shareChallenge.inviteCode}
                </p>
              </div>

              {/* Shareable Link Box */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                  Direct Join Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/duo/join?code=${shareChallenge.inviteCode}`}
                    className="flex-1 px-3 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-xs font-mono font-bold text-gray-200"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/duo/join?code=${shareChallenge.inviteCode}`);
                      setCopiedCodeLink(true);
                      setTimeout(() => setCopiedCodeLink(false), 2000);
                    }}
                    className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    {copiedCodeLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCodeLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* WhatsApp Share Button */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Join my Gym Duo Challenge "${shareChallenge.title}"! Enter invite code: ${shareChallenge.inviteCode} or click to join: ${window.location.origin}/duo/join?code=${shareChallenge.inviteCode}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
