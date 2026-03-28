"use client";

import Navbar from "../components/Navbar";
import AuthGuard from '@/app/components/AuthGuard';
import ChatWidget from '@/app/components/ChatWidget'; // Added

import { ADMIN_NAV_LINKS } from "@/constants/navigation";

export default function AdminLayout({ children }) {

  return (
    <AuthGuard>
      <div className="admin-layout">
        {/* Animated Dynamic Background */}
        <div className="gradient-bg">
          <div className="g-blob g-blob-1"></div>
          <div className="g-blob g-blob-2"></div>
          <div className="g-blob g-blob-3"></div>
          <div className="grid-overlay"></div>
        </div>

        <div className="layout-content">
          <Navbar links={ADMIN_NAV_LINKS} homeLink="/admin/dashboard" />
          <main className="main-content">
            {children}
          </main>
        </div>

        <style jsx global>{`
            /* --- Global Layout Settings --- */
            .admin-layout {
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
            }

            .main-content {
                max-width: 1400px;
                margin: 0 auto;
                padding: 30px;
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
