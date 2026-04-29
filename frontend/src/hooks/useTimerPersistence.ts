import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/integrations/api/client";

export type TimerStatus = "red" | "yellow" | "green";

export interface SubjectTimer { subject: string; elapsed: number }

interface TimerState {
  elapsed: number;
  isRunning: boolean;
  startedAt: number;
  lastSavedTime: number;
  sessionName: string;
  subject: string | null;
  subjects: SubjectTimer[];
  activeSubjectIndex: number | null;
}

const KEY = "studygabi-timer-v3";

function defaultState(name: string, subject: string | null): TimerState {
  return { elapsed: 0, isRunning: false, startedAt: Date.now(), lastSavedTime: Date.now(), sessionName: name, subject, subjects: [], activeSubjectIndex: null };
}

export function statusFromElapsed(s: number): TimerStatus {
  const h = s / 3600;
  if (h < 1) return "red";
  if (h < 2) return "yellow";
  return "green";
}

export function getStatusLabel(status: TimerStatus) {
  if (status === "red") return { label: "Repetir", message: "Sessão curta — refaça amanhã.", color: "var(--danger)" };
  if (status === "yellow") return { label: "Bom", message: "Bom progresso — continue!", color: "var(--warning)" };
  return { label: "Excelente", message: "Meta atingida! 2h+ de foco.", color: "var(--success)" };
}

export function useTimerPersistence(initialName = "Sessão de Estudo", initialSubject: string | null = null) {
  const [state, setState] = useState<TimerState>(() => {
    if (typeof window === "undefined") return defaultState(initialName, initialSubject);
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState(initialName, initialSubject);
      const parsed = JSON.parse(raw) as TimerState;
      if (parsed.isRunning) {
        const drift = Math.max(0, Math.floor((Date.now() - parsed.lastSavedTime) / 1000));
        return { ...parsed, elapsed: parsed.elapsed + drift, lastSavedTime: Date.now() };
      }
      return { ...defaultState(initialName, initialSubject), ...parsed };
    } catch { return defaultState(initialName, initialSubject); }
  });

  const ref = useRef(state);
  ref.current = state;

  // Tick
  useEffect(() => {
    if (!state.isRunning) return;
    const id = window.setInterval(() => {
      setState(p => {
        const next = { ...p, elapsed: p.elapsed + 1 };
        if (p.activeSubjectIndex !== null && p.subjects[p.activeSubjectIndex]) {
          const subs = [...p.subjects];
          subs[p.activeSubjectIndex] = { ...subs[p.activeSubjectIndex], elapsed: subs[p.activeSubjectIndex].elapsed + 1 };
          next.subjects = subs;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [state.isRunning]);

  // Persist to localStorage
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(state)); }, [state]);

  useEffect(() => {
    const h = () => localStorage.setItem(KEY, JSON.stringify({ ...ref.current, lastSavedTime: Date.now() }));
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, []);

  const togglePlayPause = useCallback(() => {
    setState(p => ({ ...p, isRunning: !p.isRunning, startedAt: p.elapsed === 0 ? Date.now() : p.startedAt, lastSavedTime: Date.now() }));
  }, []);

  const setSessionMeta = useCallback((sessionName: string, subject: string | null) => {
    setState(p => ({ ...p, sessionName, subject }));
  }, []);

  const setActiveSubject = useCallback((index: number | null) => {
    setState(p => ({ ...p, activeSubjectIndex: index, subject: index !== null ? (p.subjects[index]?.subject ?? null) : null }));
  }, []);

  const addSubject = useCallback((subject: string) => {
    setState(p => {
      if (p.subjects.find(s => s.subject === subject)) return p;
      return { ...p, subjects: [...p.subjects, { subject, elapsed: 0 }] };
    });
  }, []);

  const removeSubject = useCallback((index: number) => {
    setState(p => {
      const subs = p.subjects.filter((_, i) => i !== index);
      const ai = p.activeSubjectIndex === index ? null : p.activeSubjectIndex !== null && p.activeSubjectIndex > index ? p.activeSubjectIndex - 1 : p.activeSubjectIndex;
      return { ...p, subjects: subs, activeSubjectIndex: ai };
    });
  }, []);

  const stop = useCallback(async () => {
    const cur = ref.current;
    if (cur.elapsed < 5) { toast.info("Sessão muito curta para registrar."); setState(p => ({ ...p, isRunning: false, elapsed: 0 })); localStorage.removeItem(KEY); return; }
    const status = statusFromElapsed(cur.elapsed);
    try {
      await api.productivity.create({
        session_name: cur.sessionName,
        subject: cur.subject,
        duration_seconds: cur.elapsed,
        status,
        focus: "Teoria",
        started_at: new Date(cur.startedAt).toISOString(),
        ended_at: new Date().toISOString(),
        subjects_json: cur.subjects.filter(s => s.elapsed > 0),
      });
      const lab = getStatusLabel(status);
      toast.success(`Sessão salva — ${lab.label}`, { description: lab.message });
    } catch {
      toast.error("Erro ao salvar sessão. Verifique o backend.");
    }
    setState(p => ({ ...p, isRunning: false, elapsed: 0, subjects: p.subjects.map(s => ({ ...s, elapsed: 0 })), activeSubjectIndex: null }));
    localStorage.removeItem(KEY);
  }, []);

  const reset = useCallback(() => {
    setState(p => ({ ...p, isRunning: false, elapsed: 0, subjects: p.subjects.map(s => ({ ...s, elapsed: 0 })), activeSubjectIndex: null }));
    localStorage.removeItem(KEY);
  }, []);

  const status = statusFromElapsed(state.elapsed);
  return { elapsed: state.elapsed, isRunning: state.isRunning, sessionName: state.sessionName, subject: state.subject, status, statusInfo: getStatusLabel(status), subjects: state.subjects, activeSubjectIndex: state.activeSubjectIndex, togglePlayPause, stop, reset, setSessionMeta, setActiveSubject, addSubject, removeSubject };
}

export function formatHMS(s: number) {
  const t = Math.max(0, Math.floor(s));
  const h = Math.floor(t / 3600).toString().padStart(2, "0");
  const m = Math.floor((t % 3600) / 60).toString().padStart(2, "0");
  const sec = (t % 60).toString().padStart(2, "0");
  return `${h}:${m}:${sec}`;
}
