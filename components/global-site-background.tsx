"use client";

import { useMemo } from "react";

export default function GlobalSiteBackground() {
  const particles = useMemo(
    () =>
      Array.from({ length: 120 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 2 + Math.random() * 4,
        duration: 6 + Math.random() * 8,
        delay: Math.random() * 5,
        opacity: 0.2 + Math.random() * 0.8,
      })),
    []
  );

  return (
    <>
      <div className="fixed inset-0 -z-50 bg-[#040404]" />

      <div className="fixed inset-0 -z-50 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(234,179,8,0.08),transparent_26%),radial-gradient(circle_at_right,rgba(250,204,21,0.10),transparent_24%),linear-gradient(135deg,#030303,#090909,#050505)]" />

      <div className="fixed inset-0 -z-50 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:70px_70px]" />

      <div className="mood-orb fixed left-1/2 top-[-120px] -z-50 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-yellow-400/12 blur-[140px]" />
      <div className="mood-orb-slow fixed bottom-[-120px] left-[-80px] -z-50 h-[320px] w-[320px] rounded-full bg-amber-300/10 blur-[130px]" />
      <div className="mood-orb fixed right-[-80px] top-[20%] -z-50 h-[300px] w-[300px] rounded-full bg-yellow-500/10 blur-[130px]" />

      <div className="pointer-events-none fixed inset-0 -z-40">
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="mood-particle absolute rounded-full bg-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.5)]"
            style={{
              left: particle.left,
              top: particle.top,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
              opacity: particle.opacity,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes floatParticle {
          0% {
            transform: translateY(0px) scale(1);
            opacity: 0.15;
          }
          25% {
            opacity: 0.9;
          }
          50% {
            transform: translateY(-18px) scale(1.15);
            opacity: 0.45;
          }
          75% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.2;
          }
        }

        @keyframes glowMove {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-12px) scale(1.04);
          }
        }

        @keyframes glowMoveSlow {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(14px) scale(1.06);
          }
        }

        .mood-particle {
          animation-name: floatParticle;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        .mood-orb {
          animation: glowMove 9s ease-in-out infinite;
        }

        .mood-orb-slow {
          animation: glowMoveSlow 12s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}