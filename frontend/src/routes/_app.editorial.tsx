import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, type EditorialTopic } from "@/integrations/api/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/editorial")({ component: EditorialPage });
type Freshness = "red" | "yellow" | "green";
const FRESH = { red: { label: "Frio", dot: "bg-[color:var(--danger)]", text: "text-[color:var(--danger)]" }, yellow: { label: "Morno", dot: "bg-[color:var(--warning)]", text: "text-[color:var(--warning)]" }, green: { label: "Quente", dot: "bg-[color:var(--success)]", text: "text-[color:var(--success)]" } };

function EditorialPage() {
  const [items, setItems] = useState<EditorialTopic[]>([]);
  const [subject, setSubject] = useState(""); const [topic, setTopic] = useState("");
  const [subtopic, setSubtopic] = useState(""); const [freshness, setFreshness] = useState<Freshness>("red");
  const [busy, setBusy] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<EditorialTopic>>({});

  const load = () => api.editorial.list().then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!subject.trim() || !topic.trim()) { toast.error("Matéria e tópico são obrigatórios."); return; }
    setBusy(true);
    try { await api.editorial.create({ subject, topic, subtopic: subtopic || undefined, freshness }); toast.success("Tópico adicionado."); setSubject(""); setTopic(""); setSubtopic(""); setFreshness("red"); load(); }
    catch (e: any) { toast.error(e.message); }
    setBusy(false);
  };

  const remove = async (id: string) => { await api.editorial.delete(id); load(); };

  const cycle = async (it: EditorialTopic) => {
    const next: Freshness = it.freshness === "red" ? "yellow" : it.freshness === "yellow" ? "green" : "red";
    await api.editorial.update(it.id, { freshness: next });
    load();
  };

  const startEdit = (it: EditorialTopic) => { setEditId(it.id); setEditData({ subject: it.subject, topic: it.topic, subtopic: it.subtopic ?? "", freshness: it.freshness, status_label: it.status_label ?? "", notes: it.notes ?? "", materials: it.materials ?? "" }); };
  const saveEdit = async () => {
    if (!editId) return;
    await api.editorial.update(editId, editData);
    toast.success("Atualizado."); setEditId(null); load();
  };

  const grouped: Record<string, EditorialTopic[]> = {};
  for (const it of items) { if (!grouped[it.subject]) grouped[it.subject] = []; grouped[it.subject].push(it); }

  // Summary stats
  const total = items.length;
  const byFresh = { red: items.filter(i => i.freshness === "red").length, yellow: items.filter(i => i.freshness === "yellow").length, green: items.filter(i => i.freshness === "green").length };

  return (
    <div className="space-y-7">
      <div className="fade-up">
        <h1 className="text-2xl font-bold">Edital</h1>
        <p className="text-sm text-muted-foreground mt-1">Mapeie tópicos e acompanhe o domínio de cada um.</p>
      </div>

      {/* Summary bar */}
      {total > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 fade-up fade-up-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{total} tópicos mapeados</span>
          </div>
          <div className="flex gap-2">
            {[["red", byFresh.red], ["yellow", byFresh.yellow], ["green", byFresh.green]].map(([f, n]) => {
              const c = FRESH[f as Freshness];
              return (
                <div key={f} className="flex-1 rounded-lg bg-muted/40 p-2 text-center">
                  <div className={`text-lg font-bold ${c.text}`}>{n}</div>
                  <div className="text-[10px] text-muted-foreground">{c.label}</div>
                </div>
              );
            })}
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 rounded-full overflow-hidden flex gap-0.5">
            {byFresh.red > 0 && <div className="bg-[color:var(--danger)]/70 h-full rounded-full" style={{ width: `${(byFresh.red/total)*100}%` }} />}
            {byFresh.yellow > 0 && <div className="bg-[color:var(--warning)]/70 h-full rounded-full" style={{ width: `${(byFresh.yellow/total)*100}%` }} />}
            {byFresh.green > 0 && <div className="bg-[color:var(--success)]/70 h-full rounded-full" style={{ width: `${(byFresh.green/total)*100}%` }} />}
          </div>
        </div>
      )}

      {/* Add form */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4 fade-up fade-up-2 card-glow">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">Matéria</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Direito Constitucional" className="bg-background" /></div>
          <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">Tópico</Label><Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Princípios fundamentais" className="bg-background" /></div>
          <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">Subtópico (opcional)</Label><Input value={subtopic} onChange={(e) => setSubtopic(e.target.value)} placeholder="—" className="bg-background" /></div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Status inicial</Label>
            <Select value={freshness} onValueChange={(v) => setFreshness(v as Freshness)}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="red">🔴 Frio</SelectItem><SelectItem value="yellow">🟡 Morno</SelectItem><SelectItem value="green">🟢 Quente</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={save} disabled={busy} className="gap-2"><Plus className="h-4 w-4" />{busy ? "Salvando..." : "Adicionar tópico"}</Button>
        </div>
      </div>

      {/* Topic list */}
      <div className="space-y-5 fade-up fade-up-3">
        {items.length === 0 && <p className="text-sm text-muted-foreground">Nenhum tópico cadastrado.</p>}
        {Object.entries(grouped).map(([subj, topics]) => (
          <div key={subj}>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">{subj}</h3>
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-muted-foreground">{topics.length}</span>
            </div>
            <ul className="space-y-1.5">
              {topics.map(it => (
                <li key={it.id} className="rounded-xl border border-border bg-card/80 overflow-hidden">
                  {editId === it.id ? (
                    <div className="p-4 space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div><Label className="text-[10px] text-muted-foreground">Tópico</Label><Input value={editData.topic ?? ""} onChange={(e) => setEditData(d => ({ ...d, topic: e.target.value }))} className="h-8 text-sm bg-background mt-1" /></div>
                        <div><Label className="text-[10px] text-muted-foreground">Subtópico</Label><Input value={editData.subtopic ?? ""} onChange={(e) => setEditData(d => ({ ...d, subtopic: e.target.value }))} className="h-8 text-sm bg-background mt-1" /></div>
                        <div><Label className="text-[10px] text-muted-foreground">Status</Label>
                          <Select value={editData.freshness} onValueChange={(v) => setEditData(d => ({ ...d, freshness: v }))}>
                            <SelectTrigger className="h-8 text-sm bg-background mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="red">🔴 Frio</SelectItem><SelectItem value="yellow">🟡 Morno</SelectItem><SelectItem value="green">🟢 Quente</SelectItem></SelectContent>
                          </Select>
                        </div>
                        <div><Label className="text-[10px] text-muted-foreground">Rótulo</Label><Input value={editData.status_label ?? ""} onChange={(e) => setEditData(d => ({ ...d, status_label: e.target.value }))} placeholder="ex: Revisado 2x" className="h-8 text-sm bg-background mt-1" /></div>
                      </div>
                      <div><Label className="text-[10px] text-muted-foreground">Notas / Updates</Label><Textarea value={editData.notes ?? ""} onChange={(e) => setEditData(d => ({ ...d, notes: e.target.value }))} rows={2} className="text-sm bg-background resize-none mt-1" /></div>
                      <div><Label className="text-[10px] text-muted-foreground">Materiais</Label><Textarea value={editData.materials ?? ""} onChange={(e) => setEditData(d => ({ ...d, materials: e.target.value }))} rows={2} className="text-sm bg-background resize-none mt-1" placeholder="Livro X, pág. 42..." /></div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit} className="gap-1.5 h-8"><Check className="h-3.5 w-3.5" /> Salvar</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditId(null)} className="gap-1.5 h-8"><X className="h-3.5 w-3.5" /> Cancelar</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-2.5 group">
                      <button onClick={() => cycle(it)} title="Alterar status" className={`h-3 w-3 shrink-0 rounded-full ring-2 ring-border transition-transform hover:scale-125 ${FRESH[it.freshness as Freshness].dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm">{it.topic}{it.subtopic && <span className="text-muted-foreground"> · {it.subtopic}</span>}</div>
                        {it.status_label && <div className="text-[10px] text-muted-foreground">{it.status_label}</div>}
                        {it.notes && <div className="text-[10px] text-muted-foreground/70 truncate">📝 {it.notes}</div>}
                      </div>
                      <span className={`text-[10px] font-semibold shrink-0 ${FRESH[it.freshness as Freshness].text}`}>{FRESH[it.freshness as Freshness].label}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(it)} className="text-muted-foreground hover:text-primary p-1 rounded"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => remove(it.id)} className="text-muted-foreground hover:text-destructive p-1 rounded"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
