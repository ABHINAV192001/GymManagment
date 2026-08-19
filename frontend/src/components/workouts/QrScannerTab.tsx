import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { qrScan } from '../../lib/api/attendance';
import { getUserProfile } from '../../lib/api/user';

import { X, CheckCircle, AlertTriangle } from 'lucide-react';

export default function QrScannerTab() {
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [user, setUser] = useState<{ id: string; branchId?: string } | null>(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed?.id || parsed?.userId) {
          return { id: parsed.id || parsed.userId, branchId: parsed.branchId };
        }
      } catch (e) {}
    }
    return null;
  });

  useEffect(() => {
    if (!user?.id) {
      getUserProfile()
        .then(profile => {
          if (profile?.id) {
            setUser({ id: profile.id, branchId: profile.branchId });
          }
        })
        .catch(err => console.error('Error loading scanner user profile:', err));
    }
  }, []);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (isScanning && user?.id) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(async (decodedText) => {
        // Stop scanning after successful read to prevent multiple hits
        scanner?.clear();
        setIsScanning(false);
        try {
          const res = await qrScan(user.id, decodedText);
          setScanResult(res);
          setError(null);
        } catch (err: any) {
          setError(err.message || 'Failed to process QR code');
          setScanResult(null);
        }
      }, (err) => {
        // Ignored, happens when no QR code is in view
      });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error(e));
      }
    };
  }, [isScanning, user]);

  const handleReset = () => {
    setScanResult(null);
    setError(null);
    setIsScanning(true);
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-6 text-center border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white mb-2">3D Sci-Fi Target Scanner</h2>
          <p className="text-sm text-zinc-400">Position the QR code inside the frame to mark your attendance.</p>
        </div>
        
        <div className="p-6 relative bg-black min-h-[300px] flex items-center justify-center">
          
          {/* Scanner View */}
          {isScanning && (
            <div className="w-full h-full relative">
              <div id="reader" className="w-full text-white" />
              {/* Sci-fi overlay */}
              <div className="absolute inset-0 pointer-events-none border-2 border-cyan-500/30">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400" />
              </div>
            </div>
          )}

          {/* Error State */}
          {!isScanning && error && (
            <div className="text-center animate-fadeIn">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-red-500 mb-2">Scan Failed</h3>
              <p className="text-zinc-300 mb-6">{error}</p>
              <button 
                onClick={handleReset}
                className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Success State */}
          {!isScanning && scanResult && (
            <div className="text-center animate-fadeIn w-full">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 mb-4 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                <CheckCircle className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Access Granted</h3>
              
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 mb-6 text-left space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Status</span>
                  <span className="text-emerald-400 font-mono text-sm">LOGGED_IN</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Time</span>
                  <span className="text-white font-mono text-sm">
                    {new Date(scanResult.checkInTime).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Streak</span>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold text-sm">+{scanResult.streakGained}</span>
                    <span className="text-zinc-500 text-xs">(Total: {scanResult.totalStreak})</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Membership</span>
                  <span className={`font-mono text-sm ${scanResult.daysLeftOnMembership > 5 ? 'text-cyan-400' : 'text-red-400'}`}>
                    {scanResult.daysLeftOnMembership} Days Left
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-500 mb-6">A confirmation email has been sent.</p>
              
              <button 
                onClick={handleReset}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all shadow-[0_0_10px_rgba(8,145,178,0.5)] font-medium"
              >
                Scan Next QR
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Simulation Box for Testing */}
      {isScanning && (
        <div className="mt-8 p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
          <p className="text-sm text-zinc-400 mb-3">Testing without a camera?</p>
          <button
            onClick={async () => {
              if (user) {
                setIsScanning(false);
                try {
                  // Simulate generating a valid token for today
                  const today = new Date().toISOString().split('T')[0];
                  const qrData = btoa(`${user.branchId}|${today}`);
                  const res = await qrScan(user.id, qrData);
                  setScanResult(res);
                  setError(null);
                } catch (err: any) {
                  setError(err.message || 'Failed to process QR code');
                  setScanResult(null);
                }
              }
            }}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded transition-colors"
          >
            Simulate Scan My Own QR
          </button>
        </div>
      )}
    </div>
  );
}
