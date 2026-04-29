import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, FileJson, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/integrations/api/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/export")({ component: ExportPage });

function ExportPage() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const exportAll = async () => {
    setBusy(true);
    try {
      const data = await api.export.all();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `studygabi-backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup exportado com sucesso!");
      setDone(true); setTimeout(() => setDone(false), 3000);
    } catch { toast.error("Erro ao exportar. Backend conectado?"); }
    setBusy(false);
  };

  const tables = ["Sessões de Estudo", "Caderno de Erros", "Edital", "Argumentos", "Questões de Prova", "Brain Dumps", "Temas de Discursiva", "Redações"];

  return (
    <div className="space-y-7">
      <div className="fade-up">
        <h1 className="text-2xl font-bold">Exportar Dados</h1>
        <p className="text-sm text-muted-foreground mt-1">Baixe um backup completo de todos os seus dados.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 text-center fade-up fade-up-1 card-glow">
        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl mx-auto mb-5 transition-all ${done ? "bg-[color:var(--success)]/10" : "bg-primary/10"}`}>
          {done ? <CheckCircle className="h-8 w-8 text-[color:var(--success)]" /> : <FileJson className="h-8 w-8 text-primary" />}
        </div>
        <h2 className="text-lg font-semibold mb-2">Backup Completo</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          Exporta todos os seus dados em formato JSON. Use para backup ou migração.
        </p>
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {tables.map(t => (
            <span key={t} className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">{t}</span>
          ))}
        </div>
        <Button onClick={exportAll} disabled={busy} size="lg" className="gap-2.5 h-12 px-8 font-semibold">
          {busy ? <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Download className="h-4.5 w-4.5" />}
          {busy ? "Exportando..." : "Exportar JSON"}
        </Button>
      </div>
    </div>
  );
}
