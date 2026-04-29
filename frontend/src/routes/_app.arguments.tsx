import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Tag, Pencil, Check, X, MessageSquareQuote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, type Argument } from "@/integrations/api/client";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/arguments")({ component: ArgumentsPage });

function ArgumentsPage() {
  const [list, setList] = useState<Argument[]>([]);
  const [subject, setSubject] = useState(""); const [thesis, setThesis] = useState("");
  const [reasoning, setReasoning] = useState(""); const [example, setExample] = useState("");
  const [source, setSource] = useState(""); const [tags, setTags] = useState("");
  const [busy, setBusy] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTags, setEditTags] = useState(""); const [editContrib, setEditContrib] = useState("");

  const load = () => api.arguments.list().then(setList).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!subject.trim() || !thesis.trim()) { toast.error("Matéria e tese são obrigatórias."); return; }
    setBusy(true);
    try {
      await api.arguments.create({ subject, thesis, reasoning: reasoning || undefined, example: example || undefined, source: source || undefined, tags: tags.split(",").map(t => t.trim()).filter(Boolean) });
      toast.success("Argumento salvo.");
      setSubject(""); setThesis(""); setReasoning(""); setExample(""); setSource(""); setTags("");
      load();
    } catch (e: any) { toast.error(e.message); }
    setBusy(false);
  };
  useKeyboardShortcuts({ onCtrlEnter: save });

  const remove = async (id: string) => { await api.arguments.delete(id); load(); };

  const saveEdit = async (id: string) => {
    await api.arguments.update(id, { tags: editTags.split(",").map(t => t.trim()).filter(Boolean), contributions: editContrib });
    toast.success("Atualizado."); setEditId(null); load();
  };

  return (
    <div className="space-y-7">
      <div className="fade-up">
        <h1 className="text-2xl font-bold">Banco de Argumentos</h1>
        <p className="text-sm text-muted-foreground mt-1">Teses, raciocínios e exemplos para discursivas.</p>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4 fade-up fade-up-1 card-glow">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquareQuote className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Novo argumento</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">Matéria / Tema</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Direitos Fundamentais" className="bg-background" /></div>
          <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">Fonte (opcional)</Label><Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="STF, RE 123456" className="bg-background" /></div>
        </div>
        <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">Tese</Label><Textarea value={thesis} onChange={(e) => setThesis(e.target.value)} rows={2} className="bg-background resize-none" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">Raciocínio</Label><Textarea value={reasoning} onChange={(e) => setReasoning(e.target.value)} rows={3} className="bg-background resize-none" /></div>
          <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">Exemplo</Label><Textarea value={example} onChange={(e) => setExample(e.target.value)} rows={3} className="bg-background resize-none" /></div>
        </div>
        <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">Tags (separadas por vírgula)</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="constitucional, dignidade, principio" className="bg-background" /></div>
        <div className="flex justify-end"><Button onClick={save} disabled={busy} className="gap-2"><Plus className="h-4 w-4" />{busy ? "Salvando..." : "Salvar argumento"}</Button></div>
      </div>

      {/* List */}
      <div className="space-y-3 fade-up fade-up-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{list.length} argumentos</h2>
        {list.length === 0 && <p className="text-sm text-muted-foreground">Nenhum argumento cadastrado.</p>}
        {list.map((a) => (
          <div key={a.id} className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-border/80 card-glow">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1">{a.subject}</div>
                <p className="text-sm font-semibold leading-snug">{a.thesis}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => editId === a.id ? setEditId(null) : (setEditId(a.id), setEditTags(a.tags.join(", ")), setEditContrib(a.contributions ?? ""))}
                  className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-primary/10">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => remove(a.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {a.reasoning && <p className="mt-2.5 text-sm text-muted-foreground"><span className="font-medium text-foreground">Raciocínio:</span> {a.reasoning}</p>}
            {a.example && <p className="mt-1 text-sm text-muted-foreground"><span className="font-medium text-foreground">Exemplo:</span> {a.example}</p>}
            {a.source && <p className="mt-1 text-xs text-muted-foreground/70">Fonte: {a.source}</p>}

            {editId === a.id ? (
              <div className="mt-4 space-y-3 border-t border-border pt-4">
                <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">Editar Tags</Label><Input value={editTags} onChange={(e) => setEditTags(e.target.value)} className="h-9 text-sm bg-background" /></div>
                <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">Contribuições / Updates</Label><Textarea value={editContrib} onChange={(e) => setEditContrib(e.target.value)} rows={2} className="text-sm bg-background resize-none" /></div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => saveEdit(a.id)} className="gap-1.5 h-8"><Check className="h-3.5 w-3.5" /> Salvar</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditId(null)} className="gap-1.5 h-8"><X className="h-3.5 w-3.5" /> Cancelar</Button>
                </div>
              </div>
            ) : (
              <div className="mt-3">
                {a.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {a.tags.map(t => (
                      <span key={t} className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[11px] font-medium">
                        <Tag className="h-2.5 w-2.5" />{t}
                      </span>
                    ))}
                  </div>
                )}
                {a.contributions && <p className="mt-2 text-xs text-muted-foreground border-t border-border/50 pt-2"><span className="font-medium text-foreground">Contribuições:</span> {a.contributions}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
