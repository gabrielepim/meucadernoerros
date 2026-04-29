import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Send, RotateCw, PenLine, Star, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/integrations/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/discursivas")({
  component: DiscursivasPage,
});

interface Theme {
  id: string;
  theme: string;
  subject: string;
  context: string | null;
  difficulty: string;
  created_at: string;
}

interface Essay {
  id: string;
  theme_id: string;
  theme_text: string;
  content: string;
  ai_score: number | null;
  ai_feedback: string | null;
  created_at: string;
}

const SUBJECTS = ["Direito Constitucional", "Direito Administrativo", "Direito Penal", "Direito Civil", "Português/Redação", "Atualidades", "Administração Pública", "Outro"];
const DIFFICULTIES = [{ value: "easy", label: "Fácil" }, { value: "medium", label: "Médio" }, { value: "hard", label: "Difícil" }];

async function callClaude(prompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.map((b: any) => b.text || "").join("") ?? "";
}

function DiscursivasPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"themes" | "write" | "history">("themes");
  const [themes, setThemes] = useState<Theme[]>([]);
  const [essays, setEssays] = useState<Essay[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [essayContent, setEssayContent] = useState("");
  const [correcting, setCorrecting] = useState(false);
  const [expandedEssay, setExpandedEssay] = useState<string | null>(null);

  // Generate theme form
  const [genSubject, setGenSubject] = useState("Direito Constitucional");
  const [genDifficulty, setGenDifficulty] = useState("medium");
  const [generating, setGenerating] = useState(false);

  const loadThemes = () => api.discursivas.listThemes().then(setThemes).catch(() => {});
  const loadEssays = () => api.discursivas.listEssays().then(setEssays).catch(() => {});
  useEffect(() => { loadThemes(); loadEssays(); }, []);

  const generateTheme = async () => {
    setGenerating(true);
    try {
      const prompt = `Gere um tema de redação discursiva para concurso público de nível ${genDifficulty === "easy" ? "fácil" : genDifficulty === "medium" ? "médio" : "difícil"} na área de ${genSubject}. 
      
Responda APENAS em JSON com este formato exato:
{"theme": "Título do tema", "context": "Contexto ou citação motivadora de 2-3 frases que contextualiza o tema. Mencione leis, decisões ou dados relevantes.", "command": "Redija um texto dissertativo-argumentativo sobre o tema acima, apresentando proposta de intervenção."}

Sem explicações extras, apenas o JSON.`;

      const response = await callClaude(prompt);
      const clean = response.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      await api.discursivas.createTheme({
        theme: parsed.theme,
        subject: genSubject,
        context: parsed.context + "\n\n" + parsed.command,
        difficulty: genDifficulty,
      });
      loadThemes();
      toast.success("Tema gerado com sucesso!");
    } catch (e) {
      toast.error("Erro ao gerar tema. Tente novamente.");
    }
    setGenerating(false);
  };

  const startWrite = (theme: Theme) => {
    setSelectedTheme(theme);
    setEssayContent("");
    setTab("write");
  };

  const submitEssay = async () => {
    if (!selectedTheme || !essayContent.trim()) {
      toast.error("Escreva sua redação antes de enviar.");
      return;
    }
    if (essayContent.trim().split(/\s+/).length < 50) {
      toast.error("Redação muito curta (mínimo 50 palavras).");
      return;
    }
    setCorrecting(true);
    try {
      const prompt = `Você é um corretor especializado em concursos públicos brasileiros. Corrija a seguinte redação discursiva.

TEMA: ${selectedTheme.theme}
CONTEXTO: ${selectedTheme.context}

REDAÇÃO DO CANDIDATO:
${essayContent}

Avalie nos seguintes critérios (concursos públicos):
1. Adequação ao tema (0-25 pts)
2. Argumentação e coerência (0-25 pts)  
3. Proposta de intervenção (0-25 pts)
4. Linguagem e norma culta (0-25 pts)

Responda APENAS em JSON:
{
  "score": <nota de 0 a 100>,
  "feedback": "<feedback completo de 3-5 parágrafos com pontos positivos, pontos a melhorar, e dicas específicas>",
  "criteria": {
    "tema": <0-25>,
    "argumentacao": <0-25>,
    "proposta": <0-25>,
    "linguagem": <0-25>
  }
}`;

      const response = await callClaude(prompt);
      const clean = response.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      await api.discursivas.createEssay({
        theme_id: selectedTheme.id,
        theme_text: selectedTheme.theme,
        content: essayContent,
        ai_score: parsed.score,
        ai_feedback: parsed.feedback + (parsed.criteria ? `\n\n📊 Critérios: Tema ${parsed.criteria.tema}/25 | Argumentação ${parsed.criteria.argumentacao}/25 | Proposta ${parsed.criteria.proposta}/25 | Linguagem ${parsed.criteria.linguagem}/25` : ""),
      });
      loadEssays();
      toast.success(`Redação corrigida! Nota: ${parsed.score}/100`);
      setTab("history");
    } catch (e) {
      toast.error("Erro na correção. Verifique sua conexão.");
    }
    setCorrecting(false);
  };

  const scoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 70) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Discursivas & Redações</h1>
        <p className="text-sm text-muted-foreground">Gere temas, escreva redações e receba correção por IA em tempo real.</p>
      </div>

      {/* Tabs */}
      <div className="inline-flex rounded-md border border-border p-1 bg-card gap-1">
        {([["themes", "Temas"], ["write", "Escrever"], ["history", "Histórico"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`px-3 py-1.5 text-sm rounded transition-colors ${tab === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Themes Tab */}
      {tab === "themes" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold">Gerar novo tema</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Área / Matéria</Label>
                <Select value={genSubject} onValueChange={setGenSubject}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Dificuldade</Label>
                <Select value={genDifficulty} onValueChange={setGenDifficulty}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DIFFICULTIES.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={generateTheme} disabled={generating} className="gap-2">
              <RotateCw className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
              {generating ? "Gerando tema..." : "Gerar tema com IA"}
            </Button>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">{themes.length} temas disponíveis</h2>
            {themes.length === 0 && <p className="text-sm text-muted-foreground">Nenhum tema gerado ainda. Clique em "Gerar tema com IA".</p>}
            {themes.map((t) => (
              <div key={t.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-primary">{t.subject}</span>
                      <span className="text-xs text-muted-foreground">· {DIFFICULTIES.find(d => d.value === t.difficulty)?.label}</span>
                    </div>
                    <p className="text-sm font-medium">{t.theme}</p>
                    {t.context && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{t.context}</p>}
                  </div>
                  <Button size="sm" onClick={() => startWrite(t)} className="gap-1 shrink-0">
                    <PenLine className="h-3.5 w-3.5" /> Escrever
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write Tab */}
      {tab === "write" && (
        <div className="space-y-4">
          {!selectedTheme ? (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <PenLine className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">Selecione um tema na aba "Temas" para começar a escrever.</p>
              <Button size="sm" onClick={() => setTab("themes")}>Ver temas</Button>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <div className="text-xs font-medium text-primary mb-1">{selectedTheme.subject}</div>
                <p className="text-sm font-semibold">{selectedTheme.theme}</p>
                {selectedTheme.context && <p className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">{selectedTheme.context}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Sua redação</Label>
                  <span className="text-xs text-muted-foreground">{essayContent.trim().split(/\s+/).filter(Boolean).length} palavras</span>
                </div>
                <Textarea
                  value={essayContent}
                  onChange={(e) => setEssayContent(e.target.value)}
                  rows={16}
                  placeholder="Escreva sua redação discursiva aqui..."
                  className="font-serif text-sm leading-relaxed resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={submitEssay} disabled={correcting} className="gap-2">
                  <Send className={`h-4 w-4 ${correcting ? "animate-pulse" : ""}`} />
                  {correcting ? "Corrigindo com IA..." : "Enviar para correção"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedTheme(null)}>Mudar tema</Button>
              </div>

              {correcting && (
                <div className="rounded-xl border border-border bg-card p-4 text-center">
                  <div className="animate-pulse text-sm text-muted-foreground">🤖 A IA está analisando sua redação...</div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* History Tab */}
      {tab === "history" && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">{essays.length} redações enviadas</h2>
          {essays.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma redação enviada ainda.</p>}
          {essays.map((e) => (
            <div key={e.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{e.theme_text}</p>
                  <div className="text-xs text-muted-foreground mt-0.5">{new Date(e.created_at).toLocaleDateString("pt-BR")}</div>
                </div>
                <div className="flex items-center gap-2">
                  {e.ai_score !== null && (
                    <div className={`text-2xl font-bold tabular-nums ${scoreColor(e.ai_score)}`}>
                      {e.ai_score}<span className="text-sm">/100</span>
                    </div>
                  )}
                  <button onClick={() => setExpandedEssay(expandedEssay === e.id ? null : e.id)} className="text-muted-foreground hover:text-foreground">
                    {expandedEssay === e.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {expandedEssay === e.id && (
                <div className="mt-4 space-y-3 border-t border-border pt-3">
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-1">Sua redação</div>
                    <p className="text-sm whitespace-pre-wrap font-serif leading-relaxed">{e.content}</p>
                  </div>
                  {e.ai_feedback && (
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Star className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-semibold text-primary">Feedback da IA</span>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{e.ai_feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
