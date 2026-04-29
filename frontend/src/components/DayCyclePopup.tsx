import { useEffect, useState } from "react";
import { X, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { statusFromElapsed, getStatusLabel } from "@/hooks/useTimerPersistence";

const DAYS_PT = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const POPUP_KEY = "day_cycle_popup_shown";

function getLastSessionStatus() { return null; } // loaded via API in useEffect

function getCycleRecommendation(dayIndex: number, lastStatus: "red" | "yellow" | "green" | null) {
  const baseRecs: Record<number, string> = {
    0: "Domingo — bom dia para revisão leve e descanso.",
    1: "Segunda-feira — inicie a semana com matérias mais difíceis.",
    2: "Terça-feira — aprofunde teoria e resolva questões.",
    3: "Quarta-feira — metade da semana, foco em revisão ativa.",
    4: "Quinta-feira — questões e simulados.",
    5: "Sexta-feira — revisite os pontos fracos da semana.",
    6: "Sábado — simulado completo ou revisão geral.",
  };

  let extra = "";
  if (lastStatus === "red") extra = " ⚠ Sua última sessão foi curta — considere prolongar o estudo hoje.";
  else if (lastStatus === "yellow") extra = " ✓ Boa sessão anterior — mantenha o ritmo!";
  else if (lastStatus === "green") extra = " 🌟 Excelente sessão anterior — você está em ótimo ritmo!";

  return (baseRecs[dayIndex] ?? "") + extra;
}

export function DayCyclePopup() {
  const [show, setShow] = useState(false);
  const [dayLabel, setDayLabel] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [lastStatusInfo, setLastStatusInfo] = useState<{ label: string; color: string } | null>(null);

  useEffect(() => {
    const today = new Date().toDateString();
    const shown = localStorage.getItem(POPUP_KEY);
    if (shown === today) return;

    const dayIndex = new Date().getDay();
    setDayLabel(DAYS_PT[dayIndex]);

    import("@/integrations/api/client").then(({ api }) => {
      api.productivity.list().then(records => {
        if (records.length) {
          const sorted = [...records].sort((a, b) => new Date(b.ended_at || "").getTime() - new Date(a.ended_at || "").getTime());
          const last = sorted[0];
          const status = last.status as "red" | "yellow" | "green";
          setRecommendation(getCycleRecommendation(dayIndex, status));
          const info = getStatusLabel(status);
          setLastStatusInfo({ label: info.label, color: info.color });
        } else {
          setRecommendation(getCycleRecommendation(dayIndex, null));
        }
      }).catch(() => setRecommendation(getCycleRecommendation(dayIndex, null)));
    });

    setTimeout(() => setShow(true), 800);
  }, []);

  const dismiss = () => {
    localStorage.setItem(POPUP_KEY, new Date().toDateString());
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="relative mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95">
        <button onClick={dismiss} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full bg-primary/10 p-2.5">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Hoje é</div>
            <h2 className="text-lg font-semibold">{dayLabel}</h2>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{recommendation}</p>

        {lastStatusInfo && (
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 mb-4">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm">
              Última sessão: <span className="font-medium" style={{ color: lastStatusInfo.color }}>{lastStatusInfo.label}</span>
            </span>
          </div>
        )}

        <Button onClick={dismiss} className="w-full">Começar a estudar</Button>
      </div>
    </div>
  );
}
