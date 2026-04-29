import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/integrations/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/errors")({
  component: ErrorNotebook,
});

type QType = "Múltipla Escolha" | "Verdadeiro/Falso" | "Discursiva";

interface Entry {
  id: string;
  subject: string;
  question_type: QType;
  enunciation: string;
  created_at: string;
}

function ErrorNotebook() {
  const { user } = useAuth();
  const [list, setList] = useState<Entry[]>([]);
  const [subject, setSubject] = useState("");
  const [questionType, setQuestionType] = useState<QType>("Múltipla Escolha");
  const [enunciation, setEnunciation] = useState("");
  const [a, setA] = useState(""), [b, setB] = useState(""), [c, setC] = useState(""), [d, setD] = useState(""), [e, setE] = useState("");
  const [correct, setCorrect] = useState("");
  const [mirror, setMirror] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const data = await api.errors.list();
    setList((data ?? []).map((r: any) => ({ id: r.id, subject: r.subject, question_type: r.question_type, enunciation: r.enunciation, created_at: r.created_at })));
  };
  useEffect(() => { if (user) load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user?.id]);

  const reset = () => { setSubject(""); setEnunciation(""); setA(""); setB(""); setC(""); setD(""); setE(""); setCorrect(""); setMirror(""); };

  const save = async () => {
    if (!user) return;
    if (!subject.trim() || !enunciation.trim()) { toast.error("Preencha matéria e enunciado."); return; }
    setBusy(true);
    const base = { user_id: user.id, subject, question_type: questionType, enunciation };
    const extras =
      questionType === "Múltipla Escolha"
        ? { alt_a: a, alt_b: b, alt_c: c, alt_d: d, alt_e: e, correct_answer: correct || null }
        : questionType === "Verdadeiro/Falso"
        ? { alt_a: a, alt_b: b, correct_answer: correct || null }
        : { answer_mirror: mirror };
    let insertError = null;
    try { await api.errors.create({ ...base, ...extras }); } catch(e: any) { insertError = e.message; }
    const error = insertError ? { message: insertError } : null;
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Erro registrado."); reset(); load(); }
  };

  useKeyboardShortcuts({ onCtrlEnter: save });

  const showMC = questionType === "Múltipla Escolha";
  const showVF = questionType === "Verdadeiro/Falso";
  const showDiss = questionType === "Discursiva";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Caderno de Erros</h1>
        <p className="text-sm text-muted-foreground">Form reativo conforme tipo da questão. <kbd className="rounded bg-muted px-1.5 py-0.5">Ctrl</kbd> + <kbd className="rounded bg-muted px-1.5 py-0.5">Enter</kbd> salva.</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Matéria</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Direito Constitucional" /></div>
          <div className="space-y-1.5">
            <Label>Tipo de questão</Label>
            <Select value={questionType} onValueChange={(v) => setQuestionType(v as QType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Múltipla Escolha">Múltipla Escolha</SelectItem>
                <SelectItem value="Verdadeiro/Falso">Verdadeiro/Falso</SelectItem>
                <SelectItem value="Discursiva">Discursiva</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5"><Label>Enunciado</Label><Textarea value={enunciation} onChange={(ev) => setEnunciation(ev.target.value)} rows={3} /></div>
        {showMC && (
          <div className="grid gap-3 sm:grid-cols-2">
            {([["A", a, setA], ["B", b, setB], ["C", c, setC], ["D", d, setD], ["E", e, setE]] as const).map(([lbl, val, set]) => (
              <div key={lbl} className="space-y-1.5"><Label>Alternativa {lbl}</Label><Input value={val} onChange={(ev) => set(ev.target.value)} /></div>
            ))}
            <div className="space-y-1.5">
              <Label>Gabarito</Label>
              <Select value={correct} onValueChange={setCorrect}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{["a","b","c","d","e"].map(x => <SelectItem key={x} value={x}>{x.toUpperCase()}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        )}
        {showVF && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Item Verdadeiro</Label><Input value={a} onChange={(ev) => setA(ev.target.value)} /></div>
            <div className="space-y-1.5"><Label>Item Falso</Label><Input value={b} onChange={(ev) => setB(ev.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Gabarito</Label>
              <Select value={correct} onValueChange={setCorrect}>
                <SelectTrigger><SelectValue placeholder="V ou F" /></SelectTrigger>
                <SelectContent><SelectItem value="a">Verdadeiro</SelectItem><SelectItem value="b">Falso</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
        )}
        {showDiss && (
          <div className="space-y-1.5"><Label>Espelho de resposta</Label><Textarea value={mirror} onChange={(ev) => setMirror(ev.target.value)} rows={5} placeholder="Padrão de resposta esperado..." /></div>
        )}
        <div className="flex justify-end"><Button onClick={save} disabled={busy} className="gap-2"><Plus className="h-4 w-4" /> {busy ? "Salvando..." : "Adicionar erro"}</Button></div>
      </div>
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Últimos registros</h2>
        {list.length === 0 && <p className="text-sm text-muted-foreground">Nenhum erro registrado ainda.</p>}
        <ul className="space-y-2">
          {list.map((it) => (
            <li key={it.id} className="rounded-md border border-border bg-card p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground"><span className="font-medium text-primary">{it.subject}</span><span>{it.question_type}</span></div>
              <p className="mt-1 text-sm line-clamp-2">{it.enunciation}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}