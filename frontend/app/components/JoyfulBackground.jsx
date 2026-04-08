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
          background: #0b0b0b;
          z-index: -50;
          overflow: hidden;
        }

        .grid-overlay-global {
          display: none;
        }

        .g-blob-global {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.15;
          animation: floatBlobGlobal 30s infinite alternate ease-in-out;
          z-index: -48;
        }

        .g-blob-1 {
          top: -15%; left: -5%; width: 60vw; height: 60vw;
          background: radial-gradient(circle, rgba(0, 245, 255, 0.4), transparent 70%);
        }
        .g-blob-2 {
          bottom: -20%; right: -10%; width: 50vw; height: 50vw;
          background: radial-gradient(circle, rgba(203, 255, 51, 0.3), transparent 70%);
          animation-delay: -5s;
        }
        .g-blob-3 {
          top: 30%; right: 10%; width: 40vw; height: 40vw;
          background: radial-gradient(circle, rgba(255, 157, 0, 0.25), transparent 70%);
          animation-duration: 25s;
        }

        @keyframes floatBlobGlobal {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          50% { transform: translate(5%, 10%) scale(1.1) rotate(5deg); }
          100% { transform: translate(-5%, -5%) scale(0.9) rotate(-3deg); }
        }
      `}</style>
        </div>
    );
};

export default JoyfulBackground;
