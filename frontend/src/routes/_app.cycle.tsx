import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, X, Clock, CheckSquare, AlertCircle, Zap } from "lucide-react";
import { TimerDisplay } from "@/components/TimerDisplay";
import { BrainDumpInput } from "@/components/BrainDumpInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTimerPersistence, formatHMS, statusFromElapsed } from "@/hooks/useTimerPersistence";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { api, type DashboardKPIs } from "@/integrations/api/client";

export const Route = createFileRoute("/_app/cycle")({ component: CyclePage });

function kpiColor(hours: number) {
  if (hours >= 2) return { bg: "kpi-green border", text: "text-[color:var(--success)]" };
  if (hours >= 1) return { bg: "kpi-yellow border", text: "text-[color:var(--warning)]" };
  return { bg: "kpi-red border", text: "text-[color:var(--danger)]" };
}

function CyclePage() {
  const timer = useTimerPersistence();
  const [sessionName, setSessionName] = useState(timer.sessionName);
  const [newSubject, setNewSubject] = useState("");
  const [kpis, setKpis] = useState<DashboardKPIs["subjects"]>([]);

  useEffect(() => { timer.setSessionMeta(sessionName || "Sessão de Estudo", timer.subject); }, [sessionName]);
  useEffect(() => {
    api.dashboard.kpis().then(d => setKpis(d.subjects)).catch(() => {});
  }, []);

  useKeyboardShortcuts({ onSpace: timer.togglePlayPause, onCtrlEnter: timer.stop });

  const addSubject = () => {
    if (!newSubject.trim()) return;
    timer.addSubject(newSubject.trim());
    setNewSubject("");
  };

  const allSubjects = Array.from(new Set([
    ...timer.subjects.map(s => s.subject),
    ...kpis.map(k => k.subject),
  ]));

  return (
    <div className="space-y-7">
      <div className="fade-up">
        <h1 className="text-2xl font-bold">Ciclo de Estudo</h1>
        <p className="text-sm text-muted-foreground mt-1">Cronômetro persistente com rastreio por matéria.</p>
      </div>

      {/* Session config */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 fade-up fade-up-1 card-glow">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Configurar sessão</span>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome da sessão</Label>
          <Input value={sessionName} onChange={(e) => setSessionName(e.target.value)} placeholder="Sessão de Estudo" className="bg-background h-10" />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Matérias da sessão</Label>
          <div className="flex gap-2">
            <Input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSubject()}
              placeholder="Ex: Direito Constitucional"
              className="bg-background h-10"
            />
            <Button size="sm" onClick={addSubject} className="h-10 px-4 shrink-0 gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Adicionar
            </Button>
          </div>

          {timer.subjects.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {timer.subjects.map((s, i) => (
                <button
                  key={i}
                  onClick={() => timer.setActiveSubject(timer.activeSubjectIndex === i ? null : i)}
                  className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                    timer.activeSubjectIndex === i
                      ? "border-primary bg-primary/15 text-primary shadow-sm shadow-primary/20"
                      : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {timer.activeSubjectIndex === i && <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                  <span>{s.subject}</span>
                  {s.elapsed > 0 && <span className="font-mono text-[11px] opacity-70">{formatHMS(s.elapsed)}</span>}
                  <span onClick={(e) => { e.stopPropagation(); timer.removeSubject(i); }} className="opacity-40 hover:opacity-100 transition-opacity">
                    <X className="h-3 w-3" />
                  </span>
                </button>
              ))}
            </div>
          )}

          {timer.subjects.length > 0 && timer.activeSubjectIndex === null && timer.isRunning && (
            <p className="text-xs text-[color:var(--warning)] flex items-center gap-1.5 mt-1">
              <AlertCircle className="h-3.5 w-3.5" />
              Selecione uma matéria para registrar o tempo automaticamente.
            </p>
          )}
        </div>
      </div>

      {/* Timer */}
      <div className="fade-up fade-up-2">
        <TimerDisplay
          elapsed={timer.elapsed}
          isRunning={timer.isRunning}
          status={timer.status}
          statusInfo={timer.statusInfo}
          onToggle={timer.togglePlayPause}
          onStop={timer.stop}
          onReset={timer.reset}
        />
      </div>

      {/* KPIs por matéria */}
      {allSubjects.length > 0 && (
        <div className="space-y-3 fade-up fade-up-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">KPIs por matéria</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allSubjects.map((name) => {
              const kpi = kpis.find(k => k.subject === name);
              const live = timer.subjects.find(s => s.subject === name);
              const hours = (kpi?.hours ?? 0) + (live ? live.elapsed / 3600 : 0);
              const c = kpiColor(hours);
              const answered = kpi?.questions_answered ?? 0;
              const wrong = kpi?.questions_wrong ?? 0;
              const isActive = live && timer.activeSubjectIndex !== null && timer.subjects[timer.activeSubjectIndex]?.subject === name;

              return (
                <div key={name} className={`rounded-xl border p-4 transition-all ${c.bg} ${isActive ? "ring-1 ring-primary/40" : ""}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium truncate">{name}</span>
                    {isActive && <span className="text-[10px] font-bold text-primary animate-pulse">● AO VIVO</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center">
                    <div>
                      <Clock className={`h-3 w-3 mx-auto mb-0.5 ${c.text}`} />
                      <div className={`font-mono text-sm font-bold ${c.text}`}>{hours.toFixed(1)}h</div>
                      <div className="text-[10px] text-muted-foreground">horas</div>
                    </div>
                    <div>
                      <CheckSquare className="h-3 w-3 mx-auto mb-0.5 text-blue-400" />
                      <div className="font-mono text-sm font-bold text-blue-400">{answered}</div>
                      <div className="text-[10px] text-muted-foreground">questões</div>
                    </div>
                    <div>
                      <AlertCircle className="h-3 w-3 mx-auto mb-0.5 text-[color:var(--danger)]" />
                      <div className="font-mono text-sm font-bold text-[color:var(--danger)]">{wrong}</div>
                      <div className="text-[10px] text-muted-foreground">erros</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="fade-up fade-up-4">
        <BrainDumpInput />
      </div>
    </div>
  );
}
