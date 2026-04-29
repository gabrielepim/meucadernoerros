import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Check, X, RotateCw, BookOpen, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/integrations/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/exam-questions")({
  component: ExamQuestionsPage,
});

interface Q {
  id: string;
  subject: string;
  exam_name: string | null;
  year: number | null;
  enunciation: string;
  alternatives: string[];
  correct_answer: string | null;
  explanation: string | null;
  difficulty: string;
  times_answered: number;
  times_correct: number;
}

interface ErrorEntry {
  id: string;
  subject: string;
  enunciation: string;
  correct_answer: string | null;
  explanation: string | null;
}

const LETTERS = ["a", "b", "c", "d", "e"];
type MainTab = "simulado" | "erros" | "add";

function PracticePanel({ pool, filterLabel }: { pool: Q[]; filterLabel: string }) {
  const [current, setCurrent] = useState<Q | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (pool.length > 0 && !current) drawRandom();
  }, [pool.length]);

  const drawRandom = () => {
    if (pool.length === 0) return;
    setCurrent(pool[Math.floor(Math.random() * pool.length)]);
    setChosen(null); setRevealed(false);
  };

  const answer = async (letter: string) => {
    if (!current) return;
    setChosen(letter); setRevealed(true);
    const isCorrect = current.correct_answer === letter;
    await api.questions.answer(current.id, letter === current.correct_answer);
  };

  if (pool.length === 0) return <p className="text-sm text-muted-foreground">Nenhuma questão {filterLabel}. Cadastre em "Adicionar".</p>;
  if (!current) return <Button size="sm" onClick={drawRandom} className="gap-1"><RotateCw className="h-3.5 w-3.5" /> Sortear questão</Button>;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium text-primary">{current.subject}</span>
        <span>{current.exam_name ?? "—"} {current.year ? `· ${current.year}` : ""}</span>
      </div>
      <p className="text-sm whitespace-pre-wrap">{current.enunciation}</p>
      <ul className="mt-4 space-y-2">
        {current.alternatives.map((alt, i) => {
          const letter = LETTERS[i];
          const isChosen = chosen === letter;
          const isCorrect = current.correct_answer === letter;
          let cls = "border-border bg-background/40";
          if (revealed) {
            if (isCorrect) cls = "border-[color:var(--success)] bg-[color:var(--success)]/10";
            else if (isChosen) cls = "border-[color:var(--danger)] bg-[color:var(--danger)]/10";
          }
          return (
            <li key={i}>
              <button
                disabled={revealed}
                onClick={() => answer(letter)}
                className={`w-full text-left rounded-md border p-3 text-sm transition ${cls} ${revealed ? "cursor-default" : "hover:border-primary"}`}
              >
                <span className="font-medium mr-2">{letter.toUpperCase()})</span>{alt}
                {revealed && isCorrect && <Check className="inline h-4 w-4 ml-2 text-[color:var(--success)]" />}
                {revealed && isChosen && !isCorrect && <X className="inline h-4 w-4 ml-2 text-[color:var(--danger)]" />}
              </button>
            </li>
          );
        })}
      </ul>
      {revealed && current.explanation && (
        <div className="mt-3 rounded-md bg-muted p-3 text-sm">
          <span className="font-medium">Explicação:</span> {current.explanation}
        </div>
      )}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Aproveitamento: {current.times_answered > 0 ? Math.round((current.times_correct / current.times_answered) * 100) : 0}%
          ({current.times_correct}/{current.times_answered})
        </span>
        <Button size="sm" variant="secondary" onClick={drawRandom} className="gap-1"><RotateCw className="h-3.5 w-3.5" /> Próxima</Button>
      </div>
    </div>
  );
}

function ExamQuestionsPage() {
  const { user } = useAuth();
  const [mainTab, setMainTab] = useState<MainTab>("simulado");
  const [list, setList] = useState<Q[]>([]);
  const [errorPool, setErrorPool] = useState<ErrorEntry[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  // Form
  const [subject, setSubject] = useState("");
  const [examName, setExamName] = useState("");
  const [year, setYear] = useState<string>("");
  const [enun, setEnun] = useState("");
  const [alts, setAlts] = useState<string[]>(["", "", "", "", ""]);
  const [correct, setCorrect] = useState("");
  const [expl, setExpl] = useState("");
  const [diff, setDiff] = useState("medium");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const data = await api.questions.list();
    const mapped: Q[] = (data ?? []).map((r: any) => ({
      ...r, alternatives: Array.isArray(r.alternatives) ? r.alternatives : [],
    }));
    setList(mapped);
  };

  const loadErrors = async () => {
    const data = await api.errors.list();
    setErrorPool((data ?? []).map((r: any) => ({ id: r.id, subject: r.subject, enunciation: r.enunciation, correct_answer: r.correct_answer, explanation: r.explanation })));
  };

  useEffect(() => { if (user) { load(); loadErrors(); } }, [user?.id]);

  const save = async () => {
    if (!user) return;
    if (!subject.trim() || !enun.trim()) { toast.error("Matéria e enunciado são obrigatórios."); return; }
    setBusy(true);
    const altsClean = alts.map((a) => a.trim()).filter(Boolean);
    let error = null; try { await api.questions.create({
      user_id: user.id,
      subject: subject.trim(), exam_name: examName.trim() || null, year: year ? Number(year) : null,
      enunciation: enun.trim(), alternatives: altsClean, correct_answer: correct || null,
      explanation: expl.trim() || null, difficulty: diff,
    }); } catch(e: any) { error = { message: e.message }; }
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Questão adicionada.");
    setSubject(""); setExamName(""); setYear(""); setEnun(""); setAlts(["","","","",""]); setCorrect(""); setExpl("");
    load();
  };

  useKeyboardShortcuts({ onCtrlEnter: () => { if (mainTab === "add") save(); } });

  const subjects = Array.from(new Set([...list.map(q => q.subject), ...errorPool.map(e => e.subject)])).sort();
  const filteredList = subjectFilter === "all" ? list : list.filter(q => q.subject === subjectFilter);
  const filteredErrors = subjectFilter === "all" ? errorPool : errorPool.filter(e => e.subject === subjectFilter);

  const TAB_ITEMS: { key: MainTab; label: string; icon: React.ElementType }[] = [
    { key: "simulado", label: "Simulado", icon: BookOpen },
    { key: "erros", label: "Caderno de Erros", icon: Brain },
    { key: "add", label: "Cadastrar", icon: Plus },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Banco de Questões</h1>
          <p className="text-sm text-muted-foreground">Simulados por matéria e reforço do caderno de erros.</p>
        </div>
        <div className="inline-flex rounded-md border border-border p-1 bg-card gap-1">
          {TAB_ITEMS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setMainTab(key)} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors ${mainTab === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <Icon className="h-3.5 w-3.5" />{label}
            </button>
          ))}
        </div>
      </div>

      {/* Subject filter (for simulado and erros) */}
      {mainTab !== "add" && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtrar:</span>
          <button onClick={() => setSubjectFilter("all")} className={`rounded-full border px-3 py-1 text-xs transition-colors ${subjectFilter === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>
            Todas as matérias
          </button>
          {subjects.map(s => (
            <button key={s} onClick={() => setSubjectFilter(s)} className={`rounded-full border px-3 py-1 text-xs transition-colors ${subjectFilter === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Simulado */}
      {mainTab === "simulado" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {filteredList.length} questões cadastradas {subjectFilter !== "all" ? `em ${subjectFilter}` : ""}.
          </p>
          <PracticePanel pool={filteredList} filterLabel={subjectFilter !== "all" ? `de ${subjectFilter}` : ""} />
        </div>
      )}

      {/* Caderno de Erros */}
      {mainTab === "erros" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {filteredErrors.length} questões no caderno de erros {subjectFilter !== "all" ? `em ${subjectFilter}` : ""}.
          </p>
          {filteredErrors.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <Brain className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhuma questão no caderno de erros. Adicione questões em "Caderno de Erros" para praticar o reforço.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredErrors.map((e) => (
                <div key={e.id} className="rounded-xl border border-[color:var(--danger)]/30 bg-[color:var(--danger)]/5 p-4">
                  <div className="text-xs font-medium text-primary mb-1">{e.subject}</div>
                  <p className="text-sm">{e.enunciation}</p>
                  {e.explanation && (
                    <div className="mt-2 rounded bg-muted p-2 text-xs">
                      <span className="font-medium">Gabarito/Explicação:</span> {e.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add form */}
      {mainTab === "add" && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5"><Label>Matéria</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Banca/Prova</Label><Input value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="CESPE / FCC..." /></div>
            <div className="space-y-1.5"><Label>Ano</Label><Input type="number" value={year} onChange={(e) => setYear(e.target.value)} /></div>
          </div>
          <div className="space-y-1.5"><Label>Enunciado</Label><Textarea value={enun} onChange={(e) => setEnun(e.target.value)} rows={3} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {alts.map((a, i) => (
              <div key={i} className="space-y-1.5">
                <Label>Alternativa {LETTERS[i].toUpperCase()}</Label>
                <Input value={a} onChange={(e) => setAlts((prev) => prev.map((p, idx) => idx === i ? e.target.value : p))} />
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Gabarito</Label>
              <Select value={correct} onValueChange={setCorrect}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{LETTERS.map((l) => <SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Dificuldade</Label>
              <Select value={diff} onValueChange={setDiff}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5"><Label>Explicação (opcional)</Label><Textarea value={expl} onChange={(e) => setExpl(e.target.value)} rows={3} /></div>
          <div className="flex justify-end"><Button onClick={save} disabled={busy} className="gap-2"><Plus className="h-4 w-4" />{busy ? "Salvando..." : "Salvar questão"}</Button></div>
        </div>
      )}
    </div>
  );
}
