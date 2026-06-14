"use client";

import { useEffect, useRef } from 'react';

export function ParticleSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    
    // Handle resize
    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: {x: number, y: number, z: number, phase: number}[] = [];
    const numParticles = 2500; // High density for the Tron look
    const radius = Math.min(width, height) * 0.45;

    // Fibonacci sphere distribution for uniform dot placement
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < numParticles; i++) {
      const y = 1 - (i / (numParticles - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      particles.push({
        x: Math.cos(theta) * r,
        y: y,
        z: Math.sin(theta) * r,
        phase: Math.random() * Math.PI * 2 // For twinkling
      });
    }

    let rotationY = 0;
    const rotationX = 0.2; // Slight tilt to see the poles

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      rotationY += 0.0015; // Slow elegant spin

      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);

      // We sort particles by Z depth to draw back-to-front (painters algorithm)
      // This is crucial for 3D blending
      const projected = particles.map(p => {
        // Rotate around Y axis
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;
        
        // Rotate around X axis
        let y1 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        return { x: x1, y: y1, z: z2, phase: p.phase };
      });

      projected.sort((a, b) => b.z - a.z);

      const time = Date.now() * 0.001;

      projected.forEach(p => {
        // Project 3D to 2D
        const perspective = radius * 3; // Keep camera far enough to avoid warping
        const scale = perspective / (perspective + p.z * radius);
        const x2D = width / 2 + p.x * radius * scale;
        const y2D = height / 2 + p.y * radius * scale;

        // Calculate size and opacity based on Z depth
        const size = Math.max(0.5, 1.2 * scale);
        
        // Z goes from -1 (front) to 1 (back)
        const zNormalized = (p.z + 1) / 2; // 0 (front) to 1 (back)
        
        // Base opacity
        let opacity = Math.max(0.05, 0.45 - (zNormalized * 0.4)); 
        
        // Twinkle effect (Tron spheres shimmer)
        const twinkle = Math.sin(time * 2 + p.phase);
        if (twinkle > 0.8 && zNormalized < 0.5) {
            opacity += 0.3; // bright twinkle on front dots
        }

        ctx.beginPath();
        ctx.arc(x2D, y2D, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] max-w-[900px] max-h-[900px] pointer-events-none z-0"
    />
  );
}
