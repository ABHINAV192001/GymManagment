'use client';

import Navbar from '@/app/components/Navbar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/api/auth';
import {
  FaHome,
  FaUsers,
  FaUserTie,
  FaDumbbell,
  FaChartLine,
  FaBell,
  FaCalendarDay
} from "react-icons/fa";

import AuthGuard from '@/app/components/AuthGuard';
import ChatWidget from '@/app/components/ChatWidget';
import { getProfile } from '@/lib/api/user';
import { BRANCH_ADMIN_NAV_LINKS, TRAINER_NAV_LINKS, ROLES } from '@/constants/navigation';

export default function BranchLayout({ children }) {
  const [role, setRole] = useState(null);

  useEffect(() => {
    getProfile().then(p => {
      if (p) setRole(p.role);
    }).catch(err => console.error("Layout profile fetch failed", err));
  }, []);

  const navLinks = role === ROLES.TRAINER ? TRAINER_NAV_LINKS : BRANCH_ADMIN_NAV_LINKS;

  return (
    <AuthGuard>
      <div className="branch-layout">
        {/* Animated Dynamic Background */}
        <div className="gradient-bg">
          <div className="g-blob g-blob-1"></div>
          <div className="g-blob g-blob-2"></div>
          <div className="g-blob g-blob-3"></div>
          <div className="grid-overlay"></div>
        </div>

        <div className="layout-content">
          <Navbar links={navLinks} profileLink="/branch/profile" />
          {/* Main Content Area */}
          <main className="branch-content">
            {children}
          </main>
        </div>

        <style jsx global>{`
            /* --- Global Layout Settings --- */
            .branch-layout {
                min-height: 100vh;
                position: relative;
                color: #fff;
                font-family: 'Outfit', 'Inter', sans-serif;
                background: #0f172a;
                overflow-x: hidden;
            }

            .layout-content {
                position: relative;
                z-index: 10;
                display: flex;
                flex-direction: column;
                min-height: 100vh;
            }

            .branch-content {
                flex: 1;
                padding: 2rem;
                overflow-y: auto;
                max-width: 1400px;
                width: 100%;
                margin: 0 auto;
            }

            /* --- Animated Background --- */
            .gradient-bg {
                position: fixed;
                top: 0; left: 0; width: 100%; height: 100%;
                background: #0f172a;
                z-index: 0;
                overflow: hidden;
                pointer-events: none;
            }

            .grid-overlay {
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%;
                background-image: 
                    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                background-size: 40px 40px;
                opacity: 0.5;
            }

            .g-blob {
                position: absolute;
                border-radius: 50%;
                filter: blur(80px);
                opacity: 0.6;
                animation: floatBlob 20s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
            }

            .g-blob-1 {
                top: -10%; left: -10%; width: 600px; height: 600px;
                background: radial-gradient(circle, #8b5cf6, #ec4899);
                animation-delay: 0s;
            }
            .g-blob-2 {
                bottom: -10%; right: -10%; width: 500px; height: 500px;
                background: radial-gradient(circle, #10b981, #06b6d4);
                animation-duration: 25s;
                animation-delay: -5s;
            }
            .g-blob-3 {
                top: 40%; left: 40%; width: 400px; height: 400px;
                background: radial-gradient(circle, #f59e0b, #ef4444);
                opacity: 0.4;
                animation-duration: 18s;
                animation-delay: -8s;
            }

            @keyframes floatBlob {
                0% { transform: translate(0, 0) scale(1) rotate(0deg); }
                50% { transform: translate(60px, 30px) scale(1.05) rotate(5deg); }
                100% { transform: translate(0, 0) scale(1) rotate(0deg); }
            }
        `}</style>
        <ChatWidget />
      </div>
    </AuthGuard>
  );
}
