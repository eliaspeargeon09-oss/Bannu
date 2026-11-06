import React, { useEffect, useRef } from 'react';

interface CinematicBackgroundProps {
  mood?: 'alien-planet' | 'celebration' | 'deep-space';
}

export const CinematicBackground: React.FC<CinematicBackgroundProps> = ({
  mood = 'alien-planet',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle system
    const particleCount = mood === 'celebration' ? 65 : 45;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + (mood === 'celebration' ? 1.5 : 0.8),
      speedY: Math.random() * -0.6 - (mood === 'celebration' ? 0.4 : 0.2),
      speedX: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * Math.PI,
      color:
        mood === 'celebration'
          ? Math.random() > 0.4
            ? '#fbbf24' // gold
            : '#f43f5e' // rose
          : Math.random() > 0.6
          ? '#38bdf8' // cyan
          : '#fb923c', // amber ember
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.pulse += 0.02;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.05, currentAlpha);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = mood === 'celebration' ? 10 : 6;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [mood]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Deep planetary sky gradient */}
      <div
        className={`absolute inset-0 transition-colors duration-1000 ${
          mood === 'celebration'
            ? 'bg-gradient-to-b from-[#110d1f] via-[#0d0914] to-[#060408]'
            : 'bg-gradient-to-b from-[#060b14] via-[#08111d] to-[#04080e]'
        }`}
      />

      {/* Atmospheric planetary mist & lighting */}
      {mood === 'alien-planet' && (
        <>
          {/* Distant moon 1 with ring */}
          <div className="absolute top-10 right-8 w-20 h-20 rounded-full bg-gradient-to-br from-cyan-200/20 to-transparent blur-[1px] opacity-70">
            <div className="absolute inset-0 rounded-full border border-cyan-400/30" />
            <div className="absolute -inset-4 border-t-2 border-b-2 border-cyan-300/20 rounded-[100%] rotate-[25deg]" />
          </div>

          {/* Distant smaller secondary moon */}
          <div className="absolute top-28 right-28 w-8 h-8 rounded-full bg-amber-400/15 border border-amber-300/30 blur-[0.5px]" />

          {/* Distant mountain ridge horizon (vector silhouette) */}
          <svg
            className="absolute bottom-0 left-0 right-0 w-full h-44 opacity-25 object-cover"
            viewBox="0 0 1000 300"
            preserveAspectRatio="none"
          >
            <path
              d="M0,300 L0,180 L120,130 L260,210 L390,90 L520,170 L640,110 L780,220 L910,140 L1000,190 L1000,300 Z"
              fill="#0f172a"
            />
            <path
              d="M0,300 L0,220 L160,160 L320,240 L480,150 L640,210 L820,170 L1000,240 L1000,300 Z"
              fill="#060c18"
            />
          </svg>

          {/* Distant crashed starship smoke & ember glow */}
          <div className="absolute bottom-24 right-4 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full" />
          <div className="absolute bottom-20 left-4 w-48 h-24 bg-cyan-500/10 blur-3xl rounded-full" />
        </>
      )}

      {/* Celebration stardust ambient glow */}
      {mood === 'celebration' && (
        <>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/15 blur-3xl rounded-full" />
          <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-rose-500/15 blur-3xl rounded-full" />
        </>
      )}

      {/* Floating particles canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Sci-fi HUD overlay lines */}
      <div className="absolute inset-0 bg-holo-grid opacity-20 pointer-events-none" />
    </div>
  );
};
