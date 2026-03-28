"use client";

import React from 'react';

const JoyfulBackground = () => {
    return (
        <div className="gradient-bg-global">
            <div className="g-blob-global g-blob-1"></div>
            <div className="g-blob-global g-blob-2"></div>
            <div className="g-blob-global g-blob-3"></div>
            <div className="grid-overlay-global"></div>

            <style jsx global>{`
        .gradient-bg-global {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: var(--bg-base);
          z-index: -50; /* Keep it way behind everything */
          overflow: hidden;
          transition: background 0.5s ease;
        }

        .grid-overlay-global {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background-image: 
              linear-gradient(var(--grid-line) 1px, transparent 1px),
              linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.4;
          z-index: -49;
          pointer-events: none;
        }

        .g-blob-global {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
          animation: floatBlobGlobal 25s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
          z-index: -48;
        }

        .g-blob-1 {
          top: -10%; left: -10%; width: 50vw; height: 50vw;
          background: var(--blob-1);
          animation-delay: 0s;
        }
        .g-blob-2 {
          bottom: -10%; right: -10%; width: 40vw; height: 40vw;
          background: var(--blob-2);
          animation-duration: 30s;
          animation-delay: -5s;
        }
        .g-blob-3 {
          top: 40%; left: 40%; width: 30vw; height: 30vw;
          background: var(--blob-3);
          opacity: 0.3;
          animation-duration: 20s;
          animation-delay: -8s;
        }

        @keyframes floatBlobGlobal {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          100% { transform: translate(30px, -20px) scale(1.1) rotate(8deg); }
        }
      `}</style>
        </div>
    );
};

export default JoyfulBackground;
