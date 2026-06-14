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
    
    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const radius = Math.min(width, height) * 0.45;
    const particles: {x: number, y: number, z: number}[] = [];

    // 1. Exact TRON Sphere Layout
    const rows = 90;
    const cols = 150;
    const sliceAngle = Math.PI * 0.85; // Cut off the bottom to create the hole
    
    for (let i = 0; i <= rows; i++) {
      const phi = (i / rows) * Math.PI;
      if (phi > sliceAngle) continue;
      
      for (let j = 0; j < cols; j++) {
        // Create organic swirls by offsetting theta with phi
        const theta = (j / cols) * Math.PI * 2 + (phi * 1.5);
        
        // Natural gaps and clusters
        const density = Math.sin(phi) * Math.cos(theta * 2);
        if (Math.random() > 0.35 + density * 0.2) {
          particles.push({
            x: Math.sin(phi) * Math.cos(theta),
            y: Math.cos(phi),
            z: Math.sin(phi) * Math.sin(theta)
          });
        }
      }
    }

    // Flat bottom disk (the "shadow" or base in the Tron image)
    const bottomY = Math.cos(sliceAngle);
    const bottomR = Math.sin(sliceAngle);
    for (let i = 0; i < 1800; i++) {
      const r = Math.sqrt(Math.random()) * bottomR; // uniform distribution in circle
      const t = Math.random() * Math.PI * 2;
      particles.push({
        x: Math.cos(t) * r,
        y: bottomY,
        z: Math.sin(t) * r
      });
    }

    // 2. Exact TRON Inverted Pyramid (with horizontal hatching)
    const pyramidLines: {x: number, y: number, z: number}[][] = [];
    const numSlices = 50;
    const topY = 0.35;
    const botY = -0.65;
    
    // Horizontal slices to create the wireframe hatching look
    for (let i = 0; i <= numSlices; i++) {
      const y = botY + (i / numSlices) * (topY - botY);
      const size = ((y - botY) / (topY - botY)) * 0.35;
      pyramidLines.push([
        {x: size, y, z: size},
        {x: -size, y, z: size},
        {x: -size, y, z: -size},
        {x: size, y, z: -size},
        {x: size, y, z: size} // close loop
      ]);
    }
    
    // Main structural vertical edges
    pyramidLines.push([ {x:0, y:botY, z:0}, {x:0.35, y:topY, z:0.35} ]);
    pyramidLines.push([ {x:0, y:botY, z:0}, {x:-0.35, y:topY, z:0.35} ]);
    pyramidLines.push([ {x:0, y:botY, z:0}, {x:-0.35, y:topY, z:-0.35} ]);
    pyramidLines.push([ {x:0, y:botY, z:0}, {x:0.35, y:topY, z:-0.35} ]);

    let rotationY = 0;
    const rotationX = 0.15;
    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      rotationY -= 0.0025;

      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);

      const project = (p: {x: number, y: number, z: number}) => {
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;
        let y1 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        const perspective = radius * 4;
        const scale = perspective / (perspective + z2 * radius);
        return {
          x: width / 2 + x1 * radius * scale,
          y: height / 2 - y1 * radius * scale, 
          z: z2,
          scale
        };
      };

      const projParticles = particles.map(project);
      
      const drawParticles = (pts: any[]) => {
        ctx.fillStyle = 'rgba(235, 31, 41, 0.6)'; // Tron Red
        pts.forEach(p => {
          const size = Math.max(0.6, 1.8 * p.scale);
          const zNormalized = (p.z + 1) / 2;
          const opacity = Math.max(0.05, 0.6 - (zNormalized * 0.4));
          ctx.globalAlpha = opacity;
          // Using fillRect for massive performance boost with thousands of dots
          ctx.fillRect(p.x, p.y, size, size);
        });
        ctx.globalAlpha = 1.0;
      };

      // Draw Back Particles
      drawParticles(projParticles.filter(p => p.z > 0));

      // Draw Inner Pyramid (Lines)
      ctx.lineWidth = 1.0;
      pyramidLines.forEach(line => {
        const projLine = line.map(project);
        // Calculate average Z for the line
        const avgZ = projLine.reduce((sum, v) => sum + v.z, 0) / projLine.length;
        const zNorm = (avgZ + 1) / 2;
        
        ctx.strokeStyle = `rgba(235, 31, 41, ${0.1 + (0.8 * (1 - zNorm))})`;
        ctx.beginPath();
        projLine.forEach((v, i) => {
          if (i === 0) ctx.moveTo(v.x, v.y);
          else ctx.lineTo(v.x, v.y);
        });
        ctx.stroke();
      });

      // Draw Front Particles
      drawParticles(projParticles.filter(p => p.z <= 0));

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
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] max-w-[800px] max-h-[800px] pointer-events-none z-0 mix-blend-screen opacity-90"
    />
  );
}
