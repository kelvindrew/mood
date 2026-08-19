import React, { useRef, useEffect } from 'react';

type Props = {
  onDraw: (ctx: CanvasRenderingContext2D, t: number) => void;
  className?: string;
  onPointer?: (e: PointerEvent, canvas: HTMLCanvasElement) => void;
};

export const GameCanvas: React.FC<Props> = ({ onDraw, className, onPointer }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      // Reset transform so drawing uses CSS pixels (accounts for DPR)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const loop = (t: number) => {
      const delta = t - lastRef.current;
      lastRef.current = t;
      // clear full canvas (CSS pixels)
      const r = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, r.width, r.height);
      onDraw(ctx, t);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onDraw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onPointer) return;
    const handler = (ev: PointerEvent) => onPointer(ev, canvas);
    canvas.addEventListener('pointerdown', handler as any);
    return () => canvas.removeEventListener('pointerdown', handler as any);
  }, [onPointer]);

  return <canvas ref={canvasRef} className={className} style={{ width: '100%', height: '100%' }} />;
};
