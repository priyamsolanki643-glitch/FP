"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SurvivabilityGate() {
  const router = useRouter();

  // Mocking the calculated runway for UI demonstration
  const runwayDays = 67;
  const band: string = "YELLOW"; // Could be RED, YELLOW, or GREEN
  
  const proceedToSimulation = () => {
    router.push("/simulation");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground">
      <div className="w-full max-w-2xl flex flex-col">
        
        <h1 className="font-mono text-2xl tracking-widest uppercase mb-16 text-muted-foreground">
          Survivability Audit
        </h1>

        <div className="space-y-6 mb-16">
          <h2 className="font-mono text-4xl font-medium">
            Your operational runway: {runwayDays} days.
          </h2>

          <div className="flex items-center space-x-3">
            <span className="font-mono text-xl">Band:</span>
            <span className={`font-mono text-xl ${
              band === 'RED' ? 'text-status-danger' : 
              band === 'YELLOW' ? 'text-status-warning' : 
              'text-status-positive'
            }`}>
              {band} — Constrained Strategy Mode Active.
            </span>
          </div>
        </div>

        <div className="max-w-xl mb-24">
          <p className="font-sans text-xl leading-relaxed opacity-90">
            {band === 'RED' 
              ? "Your runway does not support a long-term strategy. All system resources are redirecting to a 14-day income generation protocol. Strategy mode will unlock when your runway exceeds 45 days."
              : "Your liquid capital allows for moderate experimentation but requires strict time-boxing. We will filter out capital-intensive strategies and focus on hybrid income-building trajectories that prioritize speed to cashflow."
            }
          </p>
        </div>

        <div>
          <Button 
            onClick={proceedToSimulation}
            className="rounded-none font-sans text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-none"
          >
            Understood. Proceed.
          </Button>
        </div>
        
      </div>
    </main>
  );
}
