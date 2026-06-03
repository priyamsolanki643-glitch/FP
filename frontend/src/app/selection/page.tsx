"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type PathType = "Alpha" | "Beta" | null;

export default function PathSelection() {
  const router = useRouter();
  const [selectedPath, setSelectedPath] = useState<PathType>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const lockTrajectory = () => {
    if (!isConfirmed) return;
    router.push("/dashboard");
  };

  return (
    <main className="flex h-screen w-full relative bg-background overflow-hidden">
      
      {/* PATH ALPHA (Left) */}
      <div className="w-1/2 h-full border-r border-border p-16 flex flex-col justify-between">
        <div>
          <h2 className="font-mono text-4xl mb-6 uppercase">Path Alpha: The High-Yield Engine</h2>
          <p className="font-sans text-xl text-muted-foreground mb-8">
            Build localized no-code integration systems for regional SMEs.
          </p>
          
          <div className="mb-12">
            <span className="font-mono text-4xl text-status-warning block mb-2">18.4%</span>
            <span className="font-mono text-sm text-muted-foreground uppercase">Probability of $10k/mo convergence</span>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="font-sans font-bold text-sm uppercase tracking-widest mb-3">Requires</h3>
              <ul className="space-y-2 font-sans text-sm text-foreground/80 list-disc pl-4">
                <li>High operational consistency.</li>
                <li>4 hours daily deep-work capacity.</li>
                <li>Direct B2B cold outreach capability.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-sans font-bold text-sm uppercase tracking-widest mb-3">Returns</h3>
              <ul className="space-y-2 font-sans text-sm text-foreground/80 list-disc pl-4">
                <li>High asymmetric financial upside.</li>
                <li>Scalable agency structure potential.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-sans font-bold text-sm uppercase tracking-widest mb-3 text-status-danger">Failure Mode</h3>
              <p className="font-sans text-sm text-foreground/80">
                Burnout from compounding rejection before reaching minimum viable cashflow.
              </p>
            </div>
          </div>
        </div>

        <Button 
          onClick={() => setSelectedPath("Alpha")}
          variant="outline"
          className="w-full rounded-none h-14 font-sans text-lg border-border hover:bg-border/50 transition-none"
        >
          Lock Alpha Trajectory
        </Button>
      </div>

      {/* PATH BETA (Right) */}
      <div className="w-1/2 h-full p-16 flex flex-col justify-between">
        <div>
          <h2 className="font-mono text-4xl mb-6 uppercase">Path Beta: The Predictable Compounder</h2>
          <p className="font-sans text-xl text-muted-foreground mb-8">
            Targeted freelance technical writing for Series A SaaS startups.
          </p>
          
          <div className="mb-12">
            <span className="font-mono text-4xl text-status-positive block mb-2">74.2%</span>
            <span className="font-mono text-sm text-muted-foreground uppercase">Probability of $2k/mo convergence</span>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="font-sans font-bold text-sm uppercase tracking-widest mb-3">Requires</h3>
              <ul className="space-y-2 font-sans text-sm text-foreground/80 list-disc pl-4">
                <li>High communication alpha.</li>
                <li>2 hours daily execution capacity.</li>
                <li>Patience through slow initial scaling.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-sans font-bold text-sm uppercase tracking-widest mb-3">Returns</h3>
              <ul className="space-y-2 font-sans text-sm text-foreground/80 list-disc pl-4">
                <li>Highly predictable, low-risk income base.</li>
                <li>Strong compounding network effects.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-sans font-bold text-sm uppercase tracking-widest mb-3 text-status-danger">Failure Mode</h3>
              <p className="font-sans text-sm text-foreground/80">
                Boredom leading to execution failure before structural compounding occurs.
              </p>
            </div>
          </div>
        </div>

        <Button 
          onClick={() => setSelectedPath("Beta")}
          variant="outline"
          className="w-full rounded-none h-14 font-sans text-lg border-border hover:bg-border/50 transition-none"
        >
          Lock Beta Trajectory
        </Button>
      </div>

      {/* CONFIRMATION MODAL TAKEOVER */}
      {selectedPath && (
        <div className="absolute inset-0 z-50 bg-background flex flex-col items-center justify-center p-6">
          <div className="max-w-2xl w-full border border-border p-12 bg-card">
            
            <h2 className="font-mono text-3xl mb-8 uppercase text-primary">
              Locking Path {selectedPath}
            </h2>
            
            <p className="font-sans text-lg leading-relaxed mb-8">
              You are about to lock this trajectory. The strategy engine will be committed to this path. 
              Subsequent requests to change direction without a verified structural life change will be 
              rejected by the system. You accept that motivation shifts and new ideas are not grounds 
              for trajectory modification.
            </p>

            <div className="flex items-start space-x-4 mb-12">
              <Checkbox 
                id="confirm" 
                checked={isConfirmed}
                onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
                className="mt-1 w-6 h-6 rounded-none border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" 
              />
              <label 
                htmlFor="confirm" 
                className="font-sans text-lg cursor-pointer select-none"
              >
                I understand what I am locking.
              </label>
            </div>

            <div className="flex space-x-4">
              <Button 
                onClick={lockTrajectory}
                disabled={!isConfirmed}
                className="rounded-none flex-1 font-sans text-lg h-14 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-none"
              >
                Lock Trajectory
              </Button>
              <Button 
                onClick={() => {
                  setSelectedPath(null);
                  setIsConfirmed(false);
                }}
                variant="outline"
                className="rounded-none font-sans text-lg h-14 px-8 border-border hover:bg-border/50 transition-none"
              >
                Cancel
              </Button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}
