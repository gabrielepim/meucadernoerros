import { Play, Pause, Square, RotateCcw, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatHMS, type TimerStatus } from "@/hooks/useTimerPersistence";
import { cn } from "@/lib/utils";

interface Props {
  elapsed: number;
  isRunning: boolean;
  status: TimerStatus;
  statusInfo: { label: string; message: string; color: string };
  onToggle: () => void;
  onStop: () => void;
  onReset: () => void;
}

const STATUS_CONFIG: Record<TimerStatus, { ring: string; glow: string; bg: string }> = {
  red: {
    ring: "ring-[color:var(--danger)]/30",
    glow: "shadow-[0_0_60px_-15px_var(--danger)]",
    bg: "from-[color:var(--danger)]/5 to-transparent",
  },
  yellow: {
    ring: "ring-[color:var(--warning)]/30",
    glow: "shadow-[0_0_60px_-15px_var(--warning)]",
    bg: "from-[color:var(--warning)]/5 to-transparent",
  },
  green: {
    ring: "ring-[color:var(--success)]/30",
    glow: "shadow-[0_0_60px_-15px_var(--success)]",
    bg: "from-[color:var(--success)]/5 to-transparent",
  },
};

export function TimerDisplay({ elapsed, isRunning, status, statusInfo, onToggle, onStop, onReset }: Props) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border border-border bg-card p-8 text-center ring-2 transition-all duration-500",
      cfg.ring, cfg.glow
    )}>
      {/* Background gradient */}
      <div className={cn("absolute inset-0 bg-gradient-to-b pointer-events-none", cfg.bg)} />

      <div className="relative">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">Tempo de foco</p>

        {/* Time display */}
        <div
          className={cn(
            "font-mono text-7xl sm:text-8xl font-light tabular-nums leading-none transition-colors duration-500",
            isRunning ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {formatHMS(elapsed)}
        </div>

        {/* Status badge */}
        <div className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-border px-4 py-1.5 text-xs">
          <span
            className={cn("h-2 w-2 rounded-full", isRunning && "animate-pulse")}
            style={{ background: statusInfo.color }}
          />
          <span className="font-semibold">{statusInfo.label}</span>
          <span className="text-muted-foreground">— {statusInfo.message}</span>
        </div>

        {/* Controls */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={onToggle}
            size="lg"
            className={cn(
              "gap-2.5 min-w-36 h-12 text-base font-semibold transition-all",
              isRunning ? "bg-[color:var(--warning)]/15 text-[color:var(--warning)] border border-[color:var(--warning)]/30 hover:bg-[color:var(--warning)]/25" : ""
            )}
          >
            {isRunning ? <><Pause className="h-4.5 w-4.5" /> Pausar</> : <><Play className="h-4.5 w-4.5" /> Iniciar</>}
          </Button>
          <Button onClick={onStop} size="lg" variant="secondary" className="gap-2.5 h-12">
            <Square className="h-4 w-4" /> Finalizar e Salvar
          </Button>
          <Button onClick={onReset} size="lg" variant="ghost" className="gap-2 h-12 text-muted-foreground">
            <RotateCcw className="h-4 w-4" /> Zerar
          </Button>
        </div>

        {/* Keyboard shortcuts */}
        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-muted-foreground/60">
          <Keyboard className="h-3 w-3" />
          <span><kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">Espaço</kbd> Play/Pause</span>
          <span className="opacity-40">·</span>
          <span><kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">Ctrl+Enter</kbd> Salvar</span>
        </div>
      </div>
    </div>
  );
}
