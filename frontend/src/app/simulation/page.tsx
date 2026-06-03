"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const SIMULATION_STEPS = [
  "Mapping local opportunity signals for Kanpur, India...",
  "Applying capability constraints: Technical Velocity — MODERATE | Communication Alpha — 0.61...",
  "Running trajectory simulations across verified market vectors...",
  "Stress-testing paths against shock variables: infrastructure failure, market saturation, platform shifts...",
  "Calculating probability distributions...",
  "Identifying highest-viability trajectories..."
];

export default function SimulationSequence() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Reveal steps one by one to simulate 8-second computation
    const stepDuration = 8000 / SIMULATION_STEPS.length;
    
    if (activeStep < SIMULATION_STEPS.length) {
      const timer = setTimeout(() => {
        setActiveStep(prev => prev + 1);
      }, stepDuration);
      return () => clearTimeout(timer);
    } else {
      // All steps shown, wait a moment then show completion
      const completeTimer = setTimeout(() => {
        setIsComplete(true);
        
        // Wait another 2 seconds before redirecting
        setTimeout(() => {
          router.push("/selection");
        }, 2000);
      }, 500);
      return () => clearTimeout(completeTimer);
    }
  }, [activeStep, router]);

  return (
    <main className="flex h-screen w-full items-center justify-center bg-background p-12">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col space-y-4 font-mono text-lg text-foreground/80">
          
          {SIMULATION_STEPS.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: activeStep > idx ? 1 : 0 }}
              className="flex items-center"
            >
              <span>{step}</span>
              {/* Show cursor only on the currently active step */}
              {activeStep === idx + 1 && !isComplete && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="ml-1 inline-block w-2 h-5 bg-primary"
                />
              )}
            </motion.div>
          ))}

          {isComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-8 text-primary"
            >
              <span>Simulation complete. 2 viable trajectories identified.</span>
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="ml-1 inline-block w-2 h-5 bg-primary"
              />
            </motion.div>
          )}

        </div>
      </div>
    </main>
  );
}
