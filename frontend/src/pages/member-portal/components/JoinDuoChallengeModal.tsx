import React, { useState } from 'react';
import { Users, X, KeyRound, Flame, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { joinDuoChallengeByCode } from '../../../lib/api/duo';
import { DuoChallenge } from '../../../types/duo';

interface JoinDuoChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (challenge: DuoChallenge) => void;
}

export const JoinDuoChallengeModal: React.FC<JoinDuoChallengeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const challenge = await joinDuoChallengeByCode(inviteCode.trim());
      onSuccess(challenge);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to join challenge. Ensure you belong to the same gym organization.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">Join Gym Challenge</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Enter invite code to compete with gym partners</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 rounded-2xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
              Challenge Invite Code
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g. CHALLENGE-1F5E42C3"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all uppercase"
              />
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
              🔒 Challenge participants must belong to the exact same gym organization.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !inviteCode.trim()}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Joining Challenge...</span>
            ) : (
              <>
                <span>Join Duo Challenge</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
