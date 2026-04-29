import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrainCircuit, BookOpen, Timer, TrendingUp, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: AuthPage });

const FEATURES = [
  { icon: Timer, label: "Cronômetro por matéria", desc: "Rastreie tempo com KPIs em cores" },
  { icon: BookOpen, label: "Caderno de erros inteligente", desc: "Revisão ativa com IA" },
  { icon: TrendingUp, label: "Edital mapeado", desc: "Status visual de cada tópico" },
];

function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  const submit = async () => {
    if (!email || password.length < 6) {
      toast.error("Informe um e-mail válido e senha com 6+ caracteres.");
      return;
    }
    setBusy(true);
    const res = mode === "in" ? await signIn(email, password) : await signUp(email, password);
    setBusy(false);
    if (res.error) toast.error(res.error);
    else {
      toast.success(mode === "in" ? "Bem-vinda de volta! 👋" : "Conta criada com sucesso!");
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-card border-r border-border overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-10%] h-[400px] w-[400px] rounded-full bg-primary/8 blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
              <BrainCircuit className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight">StudyGabi</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-4">
            Seu ciclo de estudos
            <span className="gradient-text block">inteligente.</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed mb-12">
            Planeje, execute e revise seus estudos com clareza. Cronômetro, edital, banco de questões e IA — tudo em um lugar.
          </p>

          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background/40">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{label}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-muted-foreground">
          Dados salvos localmente via backend Python. Privado e seguro.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm fade-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
              <BrainCircuit className="h-4 w-4 text-primary" />
            </div>
            <span className="font-bold">StudyGabi</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold">
              {mode === "in" ? "Bem-vinda de volta" : "Criar conta"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "in" ? "Entre na sua conta para continuar" : "Comece sua jornada de estudos"}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-lg border border-border p-1 bg-muted/30 mb-6">
            {(["in", "up"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 rounded-md py-2 text-sm font-medium transition-all duration-200",
                  mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m === "in" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
              <Input
                id="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="voce@exemplo.com"
                className="h-11 bg-card border-border focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="mínimo 6 caracteres"
                  className="h-11 pr-10 bg-card border-border focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              onClick={submit}
              disabled={busy}
              className="w-full h-11 font-semibold gap-2 mt-2"
            >
              {busy ? (
                <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              ) : null}
              {busy ? "Aguarde..." : mode === "in" ? "Entrar" : "Criar minha conta"}
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {mode === "in" ? "Não tem conta?" : "Já tem uma conta?"}{" "}
            <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="font-medium text-primary hover:underline">
              {mode === "in" ? "Criar agora" : "Entrar"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
