import { useEffect, useState } from "react";
import { Brain, Check, RotateCw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, type SmartReviewQuestion } from "@/integrations/api/client";
import { toast } from "sonner";

export function SmartReview() {
  const [questions, setQuestions] = useState<SmartReviewQuestion[]>([]);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const all = await api.smartReview.list();
      const shuffled = [...all].sort(() => Math.random() - 0.5).slice(0, 3);
      setQuestions(shuffled);
      setRevealed({});
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markReviewed = async (id: string) => {
    await api.smartReview.markReviewed(id);
    toast.success("Revisão registrada.");
    setQuestions(qs => qs.filter(q => q.id !== id));
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 card-glow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
            <Brain className="h-3.5 w-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Smart Review</h3>
          <span className="text-xs text-muted-foreground">3 pendentes</span>
        </div>
        <Button size="sm" variant="ghost" onClick={load} className="h-7 gap-1 text-xs">
          <RotateCw className="h-3 w-3" /> Sortear
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {!loading && questions.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhuma questão pendente de revisão.</p>
      )}

      <ul className="space-y-3">
        {questions.map((q) => (
          <li key={q.id} className="rounded-xl border border-border bg-background/50 p-3.5">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">{q.subject}</div>
            <p className="text-sm">{q.question}</p>
            {revealed[q.id] ? (
              <>
                <div className="mt-2.5 rounded-lg bg-muted/60 p-3 text-sm">
                  <span className="font-semibold">Resposta:</span> {q.answer}
                </div>
                <Button size="sm" className="mt-2.5 gap-1.5 h-8 text-xs" onClick={() => markReviewed(q.id)}>
                  <Check className="h-3.5 w-3.5" /> Marcar revisada
                </Button>
              </>
            ) : (
              <Button size="sm" variant="secondary" className="mt-2.5 gap-1.5 h-8 text-xs"
                onClick={() => setRevealed(r => ({ ...r, [q.id]: true }))}>
                <ChevronDown className="h-3.5 w-3.5" /> Revelar resposta
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
