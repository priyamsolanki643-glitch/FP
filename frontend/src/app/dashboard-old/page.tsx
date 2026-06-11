"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Mock Data
const TASKS = [
  {
    id: 1,
    description: "Map workflow bottlenecks for 3 regional logistics businesses.",
    type: "DEEP-WORK CLUSTER",
    compression: "Complete profile database by 22:00. No time extensions.",
    completed: false
  },
  {
    id: 2,
    description: "Write initial cold outreach script for the mapped bottlenecks.",
    type: "SPRINT",
    compression: "90-minute hyper-focused execution.",
    completed: true
  }
];

export default function Dashboard() {
  const router = useRouter();

  const handleDeclareFailure = () => {
    // Navigate to critique terminal to simulate failure intercept
    router.push("/dashboard/critique");
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden text-foreground">
      
      {/* HEADER BAR */}
      <header className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center space-x-4">
          <span className="font-mono text-xl font-bold tracking-widest">FP</span>
          <span className="font-mono text-xs text-status-positive uppercase tracking-widest">
            Trajectory: Active
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="font-mono text-sm text-muted-foreground uppercase">Consistency</span>
          <span className="font-mono text-xl font-bold">84</span>
          {/* Simple mock sparkline */}
          <div className="flex items-end h-6 space-x-1 opacity-80">
            <div className="w-1.5 h-3 bg-muted-foreground" />
            <div className="w-1.5 h-4 bg-muted-foreground" />
            <div className="w-1.5 h-2 bg-status-danger" />
            <div className="w-1.5 h-4 bg-muted-foreground" />
            <div className="w-1.5 h-5 bg-status-positive" />
            <div className="w-1.5 h-6 bg-status-positive" />
          </div>
        </div>
      </header>

      {/* MAIN CANVAS - 3 COLUMNS */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT COLUMN: Status Panel (narrow) */}
        <aside className="w-64 border-r border-border p-6 flex flex-col space-y-12 overflow-y-auto scrollbar-none">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Active Trajectory</h3>
            <p className="font-mono text-sm uppercase leading-relaxed">
              Localized No-Code Integration System for Regional SMEs
            </p>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Milestone Probability</h3>
            <p className="font-mono text-2xl text-status-warning">18.4%</p>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Runway Band</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-none bg-status-warning" />
              <span className="font-mono text-sm uppercase text-status-warning">Yellow</span>
            </div>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Operational Timeline</h3>
            <div className="flex justify-between font-mono text-sm mb-1">
              <span>Day 14</span>
              <span className="text-muted-foreground">Day 90</span>
            </div>
            <div className="h-1 w-full bg-muted">
              <div className="h-full bg-primary" style={{ width: "15%" }} />
            </div>
            <p className="font-mono text-xs text-muted-foreground mt-2 text-right">
              76 days to milestone
            </p>
          </div>
        </aside>

        {/* CENTER COLUMN: Execution Zone (widest) */}
        <main className="flex-1 p-12 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-sans text-3xl font-medium mb-12 text-foreground">
              Map and profile 3 local logistics businesses requiring digitisation, and secure contact data for decision makers.
            </h1>

            <div className="space-y-6">
              {TASKS.map(task => (
                <div 
                  key={task.id} 
                  className={`border border-border p-6 bg-card transition-opacity duration-500 ${
                    task.completed ? "opacity-40 grayscale" : "opacity-100"
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <p className={`font-sans text-lg ${task.completed ? "line-through" : ""}`}>
                      {task.description}
                    </p>
                    <span className="font-mono text-xs uppercase tracking-widest bg-muted text-muted-foreground px-2 py-1 shrink-0 ml-4">
                      {task.type}
                    </span>
                  </div>
                  
                  <p className="font-mono text-sm text-primary mb-8 uppercase">
                    [METRIC]: {task.compression}
                  </p>
                  
                  <div className="flex space-x-4">
                    <Button 
                      disabled={task.completed}
                      className="rounded-none font-sans bg-foreground text-background hover:bg-foreground/90 transition-none"
                    >
                      {task.completed ? "Completed" : "Log Completion"}
                    </Button>
                    {!task.completed && (
                      <Button 
                        onClick={handleDeclareFailure}
                        variant="outline" 
                        className="rounded-none font-sans border-status-danger text-status-danger hover:bg-status-danger/10 transition-none"
                      >
                        Declare Failure
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* RIGHT COLUMN: Context Panel (medium) */}
        <aside className="w-80 border-l border-border p-6 flex flex-col space-y-12 overflow-y-auto scrollbar-none">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-6">Active Ideology Runtimes</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-status-positive" />
                <span className="font-mono text-sm uppercase">Parkinson's Engine</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-status-positive" />
                <span className="font-mono text-sm uppercase">First-Principles Logic</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-6">Opportunity Signals</h3>
            <div className="space-y-6">
              <div className="border-l-2 border-primary pl-4">
                <p className="font-sans text-sm text-foreground/90 mb-2">
                  Regional SME logistics sector showing 34% under-digitization.
                </p>
                <p className="font-mono text-xs text-primary uppercase">Matches Active Trajectory</p>
              </div>
              <div className="border-l-2 border-muted pl-4 opacity-50">
                <p className="font-sans text-sm text-foreground/90 mb-2">
                  Local real estate agencies reporting CRM bloat.
                </p>
                <p className="font-mono text-xs text-muted-foreground uppercase">Outside Focus Vector</p>
              </div>
            </div>
          </div>
        </aside>

      </div>

      {/* BOTTOM ACTION BAR */}
      <footer className="h-16 border-t border-border flex items-center justify-between px-6 shrink-0 bg-background z-10">
        <Button variant="ghost" className="font-sans text-sm rounded-none hover:bg-muted transition-none">
          Open Daily Log
        </Button>
        <Button variant="ghost" className="font-sans text-sm text-status-danger hover:bg-status-danger/10 hover:text-status-danger rounded-none transition-none">
          End Session & Recalibrate
        </Button>
      </footer>

    </div>
  );
}
