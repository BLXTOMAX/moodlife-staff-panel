"use client";

import { useMemo } from "react";

type Particle = {
  left: string;
  size: number;
  duration: string;
  delay: string;
  opacity: number;
  drift: number;
  blur: number;
};

export default function AnimatedBackground() {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 65 }, (_, i) => ({
      left: `${(i * 6.3) % 100}%`,
      size: 2 + (i % 4),
      duration: `${10 + (i % 7)}s`,
      delay: `${(i % 12) * 0.6}s`,
      opacity: 0.18 + (i % 5) * 0.08,
      drift: (i % 2 === 0 ? 1 : -1) * (8 + (i % 4) * 3),
      blur: i % 3 === 0 ? 1.4 : 0.6,
    }));
  }, []);

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#04060a]" />

        <div className="absolute left-[8%] top-[0%] h-[900px] w-[900px] rounded-full bg-yellow-400/8 blur-[180px]" />
        <div className="absolute left-[28%] top-[8%] h-[620px] w-[620px] rounded-full bg-yellow-300/7 blur-[150px]" />
        <div className="absolute right-[8%] top-[10%] h-[440px] w-[440px] rounded-full bg-yellow-500/4 blur-[130px]" />
        <div className="absolute left-1/2 top-[5%] h-[760px] w-[420px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,204,0,0.08)_0%,rgba(255,204,0,0.03)_42%,transparent_76%)] blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.18)_58%,rgba(0,0,0,0.68)_100%)]" />

        <div className="absolute inset-0">
          {particles.map((particle, index) => (
            <span
              key={index}
              className="absolute rounded-full bg-yellow-200"
              style={{
                left: particle.left,
                bottom: "-40px",
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                opacity: particle.opacity,
                filter: `blur(${particle.blur}px)`,
                boxShadow: "0 0 10px rgba(255,220,120,0.38)",
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

        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black via-black/70 to-transparent" />
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