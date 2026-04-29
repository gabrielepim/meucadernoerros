import { useEffect, useMemo, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarDays } from "lucide-react";

interface DayRow {
  day: string; // ISO date
  duration_seconds: number;
}

function fmtDuration(sec: number) {
  if (sec === 0) return "0min";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function intensity(sec: number): string {
  if (sec === 0) return "bg-muted";
  const h = sec / 3600;
  if (h < 1) return "bg-[color:var(--danger)]/40";
  if (h < 2) return "bg-[color:var(--warning)]/60";
  return "bg-[color:var(--success)]/70";
}

function startOfWeek(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x;
}

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

const WEEKS_BACK = 12;

export function StudyCalendar() {
  const { user } = useAuth();
  const [rows, setRows] = useState<DayRow[]>([]);

  useEffect(() => {
    if (!user) return;
    import("@/integrations/api/client").then(({ api }) => {
      api.dashboard.kpis().then(kpi => {
        setRows(kpi.calendar);
      }).catch(() => {});
    });
  }, [user?.id]);

  const map = useMemo(() => {
    const m = new Map<string, number>();
    rows.forEach((r) => m.set(r.day, r.duration_seconds));
    return m;
  }, [rows]);

  const weeks = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(today);
    start.setDate(start.getDate() - (WEEKS_BACK - 1) * 7);
    const result: Date[][] = [];
    for (let w = 0; w < WEEKS_BACK; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(start);
        date.setDate(start.getDate() + w * 7 + d);
        week.push(date);
      }
      result.push(week);
    }
    return result;
  }, []);

  const total = useMemo(() => rows.reduce((acc, r) => acc + r.duration_seconds, 0), [rows]);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Calendário de Estudos</h3>
        </div>
        <span className="text-xs text-muted-foreground">Total 12 sem.: {fmtDuration(total)}</span>
      </div>
      <TooltipProvider delayDuration={150}>
        <div className="flex gap-1 overflow-x-auto">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((d) => {
                const key = isoDay(d);
                const sec = map.get(key) ?? 0;
                const future = d > new Date();
                return (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <div
                        className={`h-3.5 w-3.5 rounded-sm ${future ? "bg-muted/40" : intensity(sec)} ring-1 ring-border`}
                        aria-label={`${key}: ${fmtDuration(sec)}`}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <div className="font-medium">{d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}</div>
                      <div className="text-muted-foreground">{fmtDuration(sec)}</div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </TooltipProvider>
      <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
        <span>Menos</span>
        <span className="h-2.5 w-2.5 rounded-sm bg-muted ring-1 ring-border" />
        <span className="h-2.5 w-2.5 rounded-sm bg-[color:var(--danger)]/40" />
        <span className="h-2.5 w-2.5 rounded-sm bg-[color:var(--warning)]/60" />
        <span className="h-2.5 w-2.5 rounded-sm bg-[color:var(--success)]/70" />
        <span>Mais</span>
      </div>
    </div>
  );
}