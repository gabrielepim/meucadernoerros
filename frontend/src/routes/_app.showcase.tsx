import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const Route = createFileRoute("/_app/showcase")({
  component: ShowcasePage,
});

function ShowcasePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Component Showcase</h1>
        <p className="text-sm text-muted-foreground">Paleta, tipografia Poppins e componentes do design system.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Paleta</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {[
            { v: "background", l: "background" },
            { v: "card", l: "card" },
            { v: "primary", l: "primary (coral)" },
            { v: "accent", l: "accent" },
            { v: "muted", l: "muted" },
            { v: "border", l: "border" },
            { v: "success", l: "success" },
            { v: "warning", l: "warning" },
            { v: "danger", l: "danger" },
          ].map((c) => (
            <div key={c.v} className="rounded-md border border-border overflow-hidden">
              <div className="h-12 w-full" style={{ background: `var(--${c.v})` }} />
              <div className="px-2 py-1 text-[11px] text-muted-foreground">{c.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tipografia (Poppins)</h2>
        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <h1 className="text-4xl font-bold">Heading 1 — bold</h1>
          <h2 className="text-2xl font-semibold">Heading 2 — semibold</h2>
          <h3 className="text-xl font-medium">Heading 3 — medium</h3>
          <p className="text-base">Parágrafo regular: o quê, o porquê e o como dos seus estudos.</p>
          <p className="text-sm text-muted-foreground">Texto pequeno em muted-foreground.</p>
          <p className="text-xs font-light">Light 300 — para legendas.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Botões</h2>
        <div className="flex flex-wrap gap-2">
          <Button>Default (coral)</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Form</h2>
        <div className="rounded-xl border border-border bg-card p-5 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Input</Label><Input placeholder="Digite..." /></div>
          <div className="space-y-1.5"><Label>Textarea</Label><Textarea rows={2} placeholder="Algo aqui" /></div>
          <div className="flex items-center gap-2"><Switch id="sw" /><Label htmlFor="sw">Switch</Label></div>
          <div className="space-y-1.5"><Label>Progress</Label><Progress value={66} /></div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Feedback</h2>
        <Alert>
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription>Componentes seguem o token do tema (dark/light).</AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tabs</h2>
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">Aba A</TabsTrigger>
            <TabsTrigger value="b">Aba B</TabsTrigger>
          </TabsList>
          <TabsContent value="a" className="rounded-md border border-border bg-card p-4 text-sm mt-2">Conteúdo A</TabsContent>
          <TabsContent value="b" className="rounded-md border border-border bg-card p-4 text-sm mt-2">Conteúdo B</TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
