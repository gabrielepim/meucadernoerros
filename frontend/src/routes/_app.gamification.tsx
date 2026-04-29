import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, Flame, Star, Award, Zap } from "lucide-react";
import { api } from "@/integrations/api/client";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_app/gamification")({ component: GamificationPage });

interface Stats { xp: number; level: number; current_streak: number; longest_streak: number; badges: string[]; last_activity_date: string | null }
const XP_PER_LEVEL = 500;
const ALL_BADGES = [
  { key: "first_session", label: "Primeira sessão", icon: Star, desc: "Completou seu primeiro estudo" },
  { key: "streak_3", label: "Trio de fogo", icon: Flame, desc: "3 dias seguidos de estudo" },
  { key: "streak_7", label: "Semana de fogo", icon: Flame, desc: "7 dias seguidos de estudo" },
  { key: "level_5", label: "Nível 5", icon: Trophy, desc: "Alcançou o nível 5" },
  { key: "xp_1000", label: "1.000 XP", icon: Award, desc: "Acumulou 1.000 XP" },
];

function GamificationPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.productivity.list().then(records => {
      const totalSec = records.reduce((acc, r) => acc + r.duration_seconds, 0);
      const xp = Math.floor(totalSec / 60);
      const level = Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
      const days = [...new Set(records.map(r => r.started_at?.slice(0, 10)).filter(Boolean))].sort() as string[];
      let streak = 0, longest = 0, temp = 0;
      const today = new Date().toISOString().slice(0, 10);
      const yest = new Date(); yest.setDate(yest.getDate() - 1);
      const yStr = yest.toISOString().slice(0, 10);
      for (let i = 0; i < days.length; i++) {
        if (i === 0) { temp = 1; continue; }
        const diff = (new Date(days[i]).getTime() - new Date(days[i-1]).getTime()) / 86400000;
        temp = diff === 1 ? temp + 1 : 1;
        longest = Math.max(longest, temp);
      }
      const last = days[days.length - 1];
      streak = (last === today || last === yStr) ? temp : 0;
      setStats({ xp, level, current_streak: streak, longest_streak: Math.max(longest, streak), badges: [], last_activity_date: last ?? null });
    }).catch(() => setStats({ xp: 0, level: 1, current_streak: 0, longest_streak: 0, badges: [], last_activity_date: null }));
  }, []);

  if (!stats) return <div className="h-40 rounded-2xl bg-muted animate-pulse" />;

  const xpInLevel = stats.xp % XP_PER_LEVEL;
  const pct = (xpInLevel / XP_PER_LEVEL) * 100;
  const earnedBadges = ALL_BADGES.filter(b => {
    if (b.key === "first_session") return stats.xp > 0;
    if (b.key === "streak_3") return stats.longest_streak >= 3;
    if (b.key === "streak_7") return stats.longest_streak >= 7;
    if (b.key === "level_5") return stats.level >= 5;
    if (b.key === "xp_1000") return stats.xp >= 1000;
    return false;
  });

  return (
    <div className="space-y-7">
      <div className="fade-up">
        <h1 className="text-2xl font-bold">XP & Streak</h1>
        <p className="text-sm text-muted-foreground mt-1">Seu progresso e conquistas de estudo.</p>
      </div>

      {/* Level card */}
      <div className="rounded-2xl border border-primary/20 bg-card p-6 card-glow-primary fade-up fade-up-1">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Nível atual</div>
            <div className="text-5xl font-bold gradient-text">{stats.level}</div>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{xpInLevel} XP</span><span>{XP_PER_LEVEL} XP para o próximo nível</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>
        <div className="mt-4 flex gap-4 text-sm">
          <div><span className="text-muted-foreground">Total: </span><span className="font-bold text-primary">{stats.xp} XP</span></div>
          <div><span className="text-muted-foreground">1 XP = </span><span className="font-medium">1 minuto de estudo</span></div>
        </div>
      </div>

      {/* Streak cards */}
      <div className="grid gap-4 sm:grid-cols-2 fade-up fade-up-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Sequência atual</div>
              <div className="text-2xl font-bold">{stats.current_streak} dias</div>
            </div>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className={`flex-1 h-2 rounded-full ${i < stats.current_streak % 7 ? "bg-orange-500" : "bg-muted"}`} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-500/10">
              <Zap className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Maior sequência</div>
              <div className="text-2xl font-bold">{stats.longest_streak} dias</div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="space-y-3 fade-up fade-up-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conquistas</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_BADGES.map(badge => {
            const Icon = badge.icon;
            const earned = earnedBadges.some(b => b.key === badge.key);
            return (
              <div key={badge.key} className={`rounded-xl border p-4 transition-all ${earned ? "border-primary/30 bg-primary/5" : "border-border bg-card opacity-40"}`}>
                <Icon className={`h-6 w-6 mb-2 ${earned ? "text-primary" : "text-muted-foreground"}`} />
                <div className="text-sm font-semibold">{badge.label}</div>
                <div className="text-[11px] text-muted-foreground">{badge.desc}</div>
                {earned && <div className="mt-2 text-[10px] font-bold text-primary uppercase tracking-wider">✓ Conquistado</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
