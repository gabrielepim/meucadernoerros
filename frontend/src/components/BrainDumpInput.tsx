import { useEffect, useState } from "react";
import { Sparkles, Trash2, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api, type BrainDump } from "@/integrations/api/client";
import { toast } from "sonner";

export function BrainDumpInput() {
  const [content, setContent] = useState("");
  const [items, setItems] = useState<BrainDump[]>([]);
  const [saving, setSaving] = useState(false);

  const load = () => api.brainDumps.list().then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await api.brainDumps.create(trimmed);
      setContent("");
      toast.success("Anotação salva.");
      load();
    } catch { toast.error("Não foi possível salvar."); }
    setSaving(false);
  };

  const remove = async (id: string) => {
    await api.brainDumps.delete(id);
    load();
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 card-glow">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
        </div>
        <h3 className="text-sm font-semibold">Brain Dump</h3>
        <span className="text-xs text-muted-foreground">— capture pensamentos sem interromper</span>
      </div>

      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) save(); }}
          rows={2}
          placeholder="Algo cruzou sua mente? Anote aqui..."
          className="flex-1 resize-none bg-background text-sm"
        />
        <Button size="icon" onClick={save} disabled={saving || !content.trim()} className="h-auto w-10 self-stretch">
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {items.length > 0 && (
        <ul className="mt-4 space-y-2">
          {items.slice(0, 5).map((item) => (
            <li key={item.id} className="group flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2.5">
              <p className="flex-1 text-xs text-muted-foreground leading-relaxed">{item.content}</p>
              <button
                onClick={() => remove(item.id)}
                className="shrink-0 text-muted-foreground/40 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
