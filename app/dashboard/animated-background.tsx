"use client";

import { useMemo } from "react";

type Particle = {
  left: string;
  size: number;
  duration: string;
  delay: string;
  opacity: number;
  drift: number;
};

export default function AnimatedBackground() {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      left: `${(i * 7.9) % 100}%`,
      size: 4 + (i % 5) * 3,
      duration: `${9 + (i % 8)}s`,
      delay: `${(i % 10) * 0.7}s`,
      opacity: 0.45 + (i % 4) * 0.12,
      drift: (i % 2 === 0 ? 1 : -1) * (12 + (i % 5) * 4),
    }));
  }, []);

  return (
    <>
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute inset-0 bg-[#04060a]" />

        <div className="absolute left-[6%] top-[0%] h-[1100px] w-[1100px] rounded-full bg-yellow-400/10 blur-[170px]" />
        <div className="absolute left-[24%] top-[10%] h-[800px] w-[800px] rounded-full bg-yellow-300/8 blur-[145px]" />
        <div className="absolute right-[6%] top-[10%] h-[580px] w-[580px] rounded-full bg-yellow-500/5 blur-[130px]" />
        <div className="absolute left-1/2 top-[5%] h-[900px] w-[500px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,204,0,0.10)_0%,rgba(255,204,0,0.04)_38%,transparent_75%)] blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.14)_58%,rgba(0,0,0,0.62)_100%)]" />

        <div className="absolute inset-0">
          {particles.map((particle, index) => (
            <span
              key={index}
              className="absolute rounded-full bg-yellow-200"
              style={{
                left: particle.left,
                bottom: "-60px",
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                opacity: particle.opacity,
                boxShadow: "0 0 12px rgba(255,220,120,0.75)",
                animationName: "snowflakeUp",
                animationDuration: particle.duration,
                animationDelay: particle.delay,
                animationTimingFunction: "linear",
                animationIterationCount: "infinite",
                ["--drift" as string]: `${particle.drift}px`,
              }}
            />
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </div>

      <style jsx global>{`
        @keyframes snowflakeUp {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(var(--drift), -110vh, 0);
          }
        }
      `}</style>
    </>
  );
}