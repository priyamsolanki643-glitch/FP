"use client";

import { useEffect, useRef } from "react";

export function ParticleSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Handle Resize
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle Configuration
    const particleCount = 400; // Total number of dots
    const sphereRadius = Math.min(width, height) * 0.4; // Responsive radius
    const particles: { x: number; y: number; z: number; color: string }[] = [];

    // Generate random colors (RGB / Cyberpunk aesthetic)
    const colors = ["#00ffcc", "#ff00cc", "#0066ff", "#ffffff"];

    // Distribute points evenly on a sphere using Golden Ratio (Fibonacci sphere)
    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y); // radius at y
      const theta = phi * i; // golden angle increment

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      particles.push({
        x: x * sphereRadius,
        y: y * sphereRadius,
        z: z * sphereRadius,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    let animationFrameId: number;
    let rotationX = 0;
    let rotationY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Center canvas
      const cx = width / 2;
      const cy = height / 2;

      // Slow continuous rotation
      rotationX += 0.001;
      rotationY += 0.002;

      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);

      // Sort particles by Z-index to draw back-to-front (fake 3D depth)
      const projected = particles.map(p => {
        // Rotate around X
        const y1 = p.y * cosX - p.z * sinX;
        const z1 = p.y * sinX + p.z * cosX;

        // Rotate around Y
        const x2 = p.x * cosY + z1 * sinY;
        const z2 = -p.x * sinY + z1 * cosY;

        // Perspective projection
        const fov = 400; // Field of view
        const scale = fov / (fov + z2 + sphereRadius * 1.5); // Add distance so scale isn't infinity

        return {
          x: x2 * scale + cx,
          y: y1 * scale + cy,
          z: z2,
          scale: scale,
          color: p.color
        };
      });

      // Sort by Z (furthest first)
      projected.sort((a, b) => b.z - a.z);

      // Draw dots
      projected.forEach(p => {
        // Size gets smaller as it goes further back
        const size = Math.max(0.5, 3 * p.scale); 
        
        // Opacity gets lower as it goes further back
        const maxZ = sphereRadius;
        const minZ = -sphereRadius;
        const normalizedZ = (p.z - minZ) / (maxZ - minZ); // 0 (front) to 1 (back)
        const opacity = Math.max(0.1, 1 - (normalizedZ * 0.8)); // Front is bright, back is dim

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        
        // Apply RGB color with depth-based opacity
        ctx.fillStyle = p.color;
        ctx.globalAlpha = opacity;
        ctx.fill();
        ctx.globalAlpha = 1; // Reset
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  );
}
