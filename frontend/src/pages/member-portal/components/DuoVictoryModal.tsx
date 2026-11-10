import React, { useState } from 'react';
import { Trophy, CheckCircle, X, Gift, Sparkles } from 'lucide-react';
import { settleChallengePrize } from '../../../lib/api/duo';
import { DuoChallenge } from '../../../types/duo';

interface DuoVictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: DuoChallenge;
  currentUserId?: string;
  onSettled: (updated: DuoChallenge) => void;
}

export const DuoVictoryModal: React.FC<DuoVictoryModalProps> = ({
  isOpen,
  onClose,
  challenge,
  currentUserId,
  onSettled,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !challenge) return null;

  const isWinner = challenge.winnerId === currentUserId;
  const isSettled = challenge.prizeStatus === 'SETTLED';

  const handleSettle = async () => {
    setLoading(true);
    try {
      const updated = await settleChallengePrize(challenge.id);
      onSettled(updated);
    } catch (err: any) {
      console.error('Failed to settle prize:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-amber-200 dark:border-amber-900/50 overflow-hidden animate-in fade-in zoom-in duration-300 relative text-center">
        {/* Background Sparkles Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="p-8 space-y-6">
          <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full shadow-xl shadow-amber-500/30 text-white animate-bounce">
            <Trophy className="w-10 h-10" />
            <Sparkles className="w-5 h-5 absolute -top-1 -right-1 text-yellow-200" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[11px] font-bold uppercase tracking-wider rounded-full mb-2">
              Challenge Completed 🎉
            </span>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {challenge.winnerName} Won! 🏆
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {challenge.title}
            </p>
          </div>

          {/* Scores summary */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs">
            {challenge.scores.map((score) => (
              <div key={score.userId} className="text-center space-y-1">
                <p className="font-semibold text-gray-700 dark:text-gray-300 text-[11px] truncate">{score.userName}</p>
                <p className="text-lg font-black text-amber-600 dark:text-amber-400">{score.totalPoints} <span className="text-[10px] font-normal text-gray-400">pts</span></p>
              </div>
            ))}
          </div>

          {/* Wager Prize Details */}
          {challenge.wagerPrize && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/50 rounded-2xl text-left space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                <Gift className="w-4 h-4 text-amber-500" />
                <span>Wagered Prize:</span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300 font-medium pl-5">
                "{challenge.wagerPrize}"
              </p>
            </div>
          )}

          {/* Action button */}
          <div className="space-y-3 pt-2">
            {isWinner && challenge.wagerPrize && !isSettled && (
              <button
                onClick={handleSettle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                {loading ? 'Updating...' : 'Mark Wager Prize as Settled'}
              </button>
            )}

            {isSettled && (
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                <CheckCircle className="w-4 h-4" />
                <span>Prize Claim Settled & Honored</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
