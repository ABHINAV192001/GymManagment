import React, { useState } from 'react';
import { Users, X, Send, AlertCircle, MessageCircle, Copy, Check } from 'lucide-react';
import { sendPartnerInvite, generateWhatsAppInvite } from '../../../lib/api/duo';
import { DuoPartnership } from '../../../types/duo';

interface InvitePartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (partnership: DuoPartnership) => void;
}

export const InvitePartnerModal: React.FC<InvitePartnerModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleWhatsAppShare = async () => {
    setWhatsappLoading(true);
    setError(null);
    try {
      const inviteData = await generateWhatsAppInvite();
      setGeneratedLink(inviteData.inviteUrl);
      // Open WhatsApp Web or app with pre-filled message
      window.open(inviteData.whatsappUrl, '_blank');
    } catch (err: any) {
      setError(err.message || 'Failed to generate WhatsApp invite link.');
    } finally {
      setWhatsappLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const partnership = await sendPartnerInvite(identifier.trim());
      onSuccess(partnership);
      setIdentifier('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send invite. Ensure member belongs to your gym organization.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Invite Gym Partner</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Share via WhatsApp or invite by username</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary WhatsApp Share Button */}
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
              <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Share Invite via WhatsApp</span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
              Generate a unique join link & redirect to WhatsApp. When your partner clicks the link, they will log in and automatically pair with you!
            </p>

            <button
              type="button"
              onClick={handleWhatsAppShare}
              disabled={whatsappLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              {whatsappLoading ? 'Generating Link...' : 'Invite via WhatsApp 💬'}
            </button>

            {generatedLink && (
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-700 text-xs text-gray-800 dark:text-gray-200 select-all font-mono"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 rounded-lg text-xs font-bold shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-gray-200 dark:border-gray-800 w-full" />
            <span className="bg-white dark:bg-gray-900 px-3 text-[10px] uppercase font-bold text-gray-400 shrink-0">
              Or Invite directly by Username
            </span>
          </div>

          {/* Form for manual username invite */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Partner Username or Email
              </label>
              <input
                type="text"
                placeholder="e.g. tejaswee / partner@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
              />
              <p className="mt-1.5 text-[11px] text-gray-400">
                * Both members must belong to your gym organization.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !identifier.trim()}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 rounded-xl shadow-md shadow-orange-500/20 transition-all"
              >
                {loading ? 'Sending...' : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send Invite
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
