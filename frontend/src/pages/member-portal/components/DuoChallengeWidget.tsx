import React, { useEffect, useState } from 'react';
import { Flame, Trophy, Users, Plus, Award, CheckCircle, Zap, ShieldAlert, ChevronRight, Share2, Trash2, Copy, Check, X } from 'lucide-react';
import { getMyPartner, getPendingInvites, getActiveChallenges, acceptPartnerInvite, logDuoEvent, deleteDuoChallenge } from '../../../lib/api/duo';
import { DuoChallenge, DuoPartnership } from '../../../types/duo';
import { InvitePartnerModal } from './InvitePartnerModal';
import { CreateDuoChallengeModal } from './CreateDuoChallengeModal';
import { DuoVictoryModal } from './DuoVictoryModal';
import { JoinDuoChallengeModal } from './JoinDuoChallengeModal';

export const DuoChallengeWidget: React.FC = () => {
  const [partner, setPartner] = useState<DuoPartnership | null>(null);
  const [pendingInvites, setPendingInvites] = useState<DuoPartnership[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<DuoChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Share State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [shareChallenge, setShareChallenge] = useState<DuoChallenge | null>(null);
  const [copiedCodeLink, setCopiedCodeLink] = useState(false);
  const [selectedVictoryChallenge, setSelectedVictoryChallenge] = useState<DuoChallenge | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [partnerData, pendingData, challengesData] = await Promise.all([
        getMyPartner(),
        getPendingInvites(),
        getActiveChallenges(),
      ]);
      setPartner(partnerData);
      setPendingInvites(pendingData);
      setActiveChallenges(challengesData);
    } catch (err) {
      console.error('Failed to load Duo partner data:', err);
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
      alert(err.message || 'Failed to accept invite');
    }
  };

  const handleQuickLogWorkout = async () => {
    try {
      await logDuoEvent('WORKOUT', 'Logged workout from member portal widget');
      await loadData();
    } catch (err) {
      console.error('Failed to log workout:', err);
    }
  };

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

  const currentChallenge = activeChallenges.length > 0 ? activeChallenges[0] : null;

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse space-y-4">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3" />
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-xl shadow-md">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white">Gym Duo & Streaks</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Compete with your partner & wager prizes</p>
          </div>
        </div>

        {partner && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Challenge</span>
            </button>
            <button
              onClick={() => setIsJoinOpen(true)}
              className="px-3 py-1.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold text-xs rounded-xl transition-colors"
            >
              <span>Join Code</span>
            </button>
          </div>
        )}
      </div>

      {/* Pending Partner Invite Banner */}
      {pendingInvites.length > 0 && !partner && (
        <div className="p-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl shadow-lg flex items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-extrabold block">Gym Partner Request Received!</span>
            <span className="text-orange-100"><b>{pendingInvites[0].requester.name}</b> wants to link up as your gym partner.</span>
          </div>
          <button
            onClick={() => handleAcceptInvite(pendingInvites[0].id)}
            className="px-3.5 py-1.5 bg-white text-orange-600 font-bold rounded-xl shadow-sm hover:bg-orange-50 transition-colors shrink-0"
          >
            Accept
          </button>
        </div>
      )}

      {!partner ? (
        <div className="p-8 text-center bg-gray-50/60 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 mx-auto bg-amber-100 dark:bg-amber-950/60 text-amber-500 rounded-2xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">No Gym Partner Linked Yet</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              Link up with your gym partner (within your gym) to track workout streaks, start friendly point challenges, and wager prizes!
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => setIsInviteOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 hover:opacity-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              Invite Partner
            </button>
            <button
              onClick={() => setIsJoinOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold text-xs rounded-xl transition-all"
            >
              <Users className="w-4 h-4" />
              Join Challenge Code
            </button>
          </div>
        </div>
      ) : currentChallenge ? (
        /* Active Challenge Card */
        <div className="space-y-4">
          <div className="p-5 bg-white dark:bg-gray-800/80 rounded-2xl border border-amber-200/70 dark:border-amber-900/50 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-3">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                {currentChallenge.title}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 rounded-full">
                  Target: {currentChallenge.targetValue} {currentChallenge.challengeType === 'POINT_RACE' ? 'Pts' : 'Days'}
                </span>

                {/* Invite Code & Share Button */}
                {currentChallenge.inviteCode && (
                  <button
                    onClick={() => setShareChallenge(currentChallenge)}
                    className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-lg transition-colors"
                    title="Share Challenge Invite Link & Code"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Delete Challenge Button */}
                <button
                  onClick={() => handleDeleteChallenge(currentChallenge.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                  title="Delete Challenge"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Wager Banner */}
            {currentChallenge.wagerPrize && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/50 dark:border-amber-800/50 rounded-xl flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200 font-medium">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                <span><b>Wager Stake:</b> "{currentChallenge.wagerPrize}"</span>
              </div>
            )}

            {/* Score Comparison Bars */}
            <div className="space-y-3 pt-1">
              {currentChallenge.scores.map((score) => {
                const target = currentChallenge.targetValue || 10;
                const percentage = Math.min(100, Math.round((score.totalPoints / target) * 100));

                return (
                  <div key={score.userId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200">
                      <span>{score.userName}</span>
                      <span className="text-amber-600 dark:text-amber-400">{score.totalPoints} / {target} pts</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/60 text-xs">
              <span className="text-gray-500 dark:text-gray-400 text-[11px]">
                🔥 Same-Day Duo Sync: <b>+2 Pts Bonus</b>
              </span>
              <button
                onClick={handleQuickLogWorkout}
                className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:underline"
              >
                <Zap className="w-3.5 h-3.5" />
                Log Workout (+2 Pts)
              </button>
            </div>
          </div>

          {currentChallenge.status === 'COMPLETED' && (
            <button
              onClick={() => setSelectedVictoryChallenge(currentChallenge)}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              View Victory & Claim Wager
            </button>
          )}
        </div>
      ) : (
        <div className="p-5 text-center bg-white dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">No active duo challenge running.</p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-3.5 py-1.5 bg-amber-500 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-amber-600 transition-colors"
            >
              Start Custom Challenge
            </button>
            <button
              onClick={() => setIsJoinOpen(true)}
              className="px-3.5 py-1.5 bg-amber-100 text-amber-700 border border-amber-200 font-bold text-xs rounded-xl transition-colors"
            >
              Join Code
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <InvitePartnerModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={loadData}
      />

      <CreateDuoChallengeModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        partnership={partner || undefined}
        onSuccess={async () => {
          setIsCreateOpen(false);
          await loadData();
          if (window.location.pathname !== '/duo') {
            window.location.href = '/duo';
          }
        }}
      />

      <JoinDuoChallengeModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
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
