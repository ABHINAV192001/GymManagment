import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getStoredToken } from '../../lib/api/client';
import { claimDuoInviteCode } from '../../lib/api/duo';
import { Flame, Loader2, AlertCircle } from 'lucide-react';

export const DuoJoinHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'LOADING' | 'ERROR'>('LOADING');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const code = searchParams.get('code') || searchParams.get('inviteCode');

  useEffect(() => {
    if (!code) {
      navigate('/duo', { replace: true });
      return;
    }

    // Save invite code into sessionStorage
    sessionStorage.setItem('pending_duo_invite', code);

    const token = getStoredToken();
    if (!token) {
      // User is not logged in: redirect to login page
      navigate(`/auth/login?redirect=/duo&duoCode=${code}`, { replace: true });
      return;
    }

    // User is logged in: claim the invite code immediately
    claimDuoInviteCode(code)
      .then(() => {
        sessionStorage.removeItem('pending_duo_invite');
        navigate('/duo', { replace: true });
      })
      .catch((err: any) => {
        setErrorMessage(err.message || 'Failed to claim Gym Duo partner invite. Ensure you belong to the same gym organization.');
        setStatus('ERROR');
      });
  }, [code, navigate]);

  if (status === 'ERROR') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-red-200 dark:border-red-900/50 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-950 text-red-500 rounded-2xl flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Unable to Accept Duo Invite</h2>
          <p className="text-xs text-gray-600 dark:text-gray-300">{errorMessage}</p>
          <button
            onClick={() => navigate('/duo', { replace: true })}
            className="w-full py-3 bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md hover:bg-amber-600 transition-colors"
          >
            Go to Gym Duo Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-amber-500 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-amber-500/30 animate-pulse">
          <Flame className="w-8 h-8 fill-white" />
        </div>
        <div className="flex items-center justify-center gap-2 text-sm font-extrabold text-gray-800 dark:text-gray-200">
          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
          <span>Linking Gym Duo Partner...</span>
        </div>
      </div>
    </div>
  );
};
