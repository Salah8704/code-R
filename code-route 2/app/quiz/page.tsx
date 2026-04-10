"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, ChevronRight, Clock, ArrowLeft } from "lucide-react";

type Choice = {
  id: string;
  position: number;
  text: string;
};

type Question = {
  id: string;
  prompt: string;
  difficulty: number;
  theme: string;
  trapFamily: string;
  choices: Choice[];
};

type AnswerResult = {
  isCorrect: boolean;
  correctChoiceIds: string[];
  explanationShort: string;
  explanationLong?: string | null;
};

type QuizState = "loading" | "question" | "correction" | "complete" | "error" | "paused";

export default function QuizPage() {
  const router = useRouter();
  const [state, setState] = useState<QuizState>("loading");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [seriesId, setSeriesId] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [score, setScore] = useState(0);
  const [pauseUntil, setPauseUntil] = useState<string | null>(null);
  const [error, setError] = useState("");

  const startSeries = useCallback(async () => {
    setState("loading");
    const res = await fetch("/api/quiz/start", { method: "POST" });

    if (res.status === 423) {
      const data = await res.json();
      setPauseUntil(data.pauseUntil);
      setState("paused");
      return;
    }

    if (!res.ok) {
      setError("Impossible de démarrer la série. Réessaie.");
      setState("error");
      return;
    }

    const data = await res.json();
    setSeriesId(data.seriesId);
    setQuestions(data.questions);
    setCurrent(0);
    setScore(0);
    setSelected([]);
    setResult(null);
    setStartTime(Date.now());
    setState("question");
  }, []);

  useEffect(() => {
    startSeries();
  }, [startSeries]);

  async function submitAnswer() {
    if (!selected.length) return;
    const responseTimeMs = Date.now() - startTime;
    const q = questions[current];

    const res = await fetch("/api/quiz/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seriesId,
        questionId: q.id,
        chosenChoiceIds: selected,
        responseTimeMs,
      }),
    });

    const data: AnswerResult = await res.json();
    setResult(data);
    if (data.isCorrect) setScore((s) => s + 1);
    setState("correction");
  }

  async function next() {
    const isLast = current >= questions.length - 1;

    if (isLast) {
      // Complete series
      const res = await fetch("/api/quiz/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seriesId }),
      });
      const data = await res.json();

      if (data.blockComplete && data.pauseUntil) {
        setPauseUntil(data.pauseUntil);
        setState("paused");
      } else {
        setState("complete");
      }
      return;
    }

    setCurrent((c) => c + 1);
    setSelected([]);
    setResult(null);
    setStartTime(Date.now());
    setState("question");
  }

  function toggleChoice(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const q = questions[current];
  const progress = questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0;

  // ── LOADING ──
  if (state === "loading") {
    return (
      <Screen>
        <div className="text-center text-slate-400">
          <Clock className="mx-auto h-8 w-8 animate-pulse" />
          <p className="mt-2">Préparation de la série…</p>
        </div>
      </Screen>
    );
  }

  // ── ERROR ──
  if (state === "error") {
    return (
      <Screen>
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button onClick={startSeries} className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm text-white">
            Réessayer
          </button>
        </div>
      </Screen>
    );
  }

  // ── PAUSE ──
  if (state === "paused" && pauseUntil) {
    return <PauseScreen pauseUntil={pauseUntil} />;
  }

  // ── COMPLETE ──
  if (state === "complete") {
    const pct = Math.round((score / questions.length) * 40);
    return (
      <Screen>
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
            <CheckCircle className="h-8 w-8 text-brand" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Série terminée !</h2>
          <p className="mt-2 text-4xl font-extrabold text-brand">
            {score}/{questions.length}
          </p>
          <p className="text-slate-500">soit ~{pct}/40 à l&apos;examen</p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={startSeries}
              className="rounded-xl bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark transition-colors"
            >
              Faire la deuxième série
            </button>
            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Voir le dashboard
            </Link>
          </div>
        </div>
      </Screen>
    );
  }

  // ── QUESTION / CORRECTION ──
  if (!q) return null;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <span className="text-sm font-medium text-slate-600">
            {current + 1}/{questions.length}
          </span>
          <span className="text-sm font-medium text-brand">
            {score} correct{score > 1 ? "s" : ""}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-brand transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Difficulty badge */}
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
            {q.theme.replace(/_/g, " ")}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
            Difficulté {q.difficulty}/3
          </span>
        </div>

        {/* Question */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-lg font-semibold leading-snug text-slate-900">{q.prompt}</p>

          <div className="mt-6 space-y-3">
            {q.choices.map((choice) => {
              const isSelected = selected.includes(choice.id);
              const showResult = state === "correction";
              const isCorrect = result?.correctChoiceIds.includes(choice.id);
              const isWrong = showResult && isSelected && !isCorrect;

              let cls =
                "w-full rounded-xl border p-4 text-left text-sm font-medium transition-all ";

              if (showResult) {
                if (isCorrect) cls += "border-green-400 bg-green-50 text-green-800";
                else if (isWrong) cls += "border-red-400 bg-red-50 text-red-800";
                else cls += "border-slate-200 bg-slate-50 text-slate-400";
              } else {
                cls += isSelected
                  ? "border-brand bg-brand/5 text-brand"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700";
              }

              return (
                <button
                  key={choice.id}
                  className={cls}
                  onClick={() => state === "question" && toggleChoice(choice.id)}
                  disabled={state === "correction"}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs">
                      {String.fromCharCode(65 + choice.position)}
                    </span>
                    <span>{choice.text}</span>
                    {showResult && isCorrect && (
                      <CheckCircle className="ml-auto h-4 w-4 flex-shrink-0 text-green-500" />
                    )}
                    {showResult && isWrong && (
                      <XCircle className="ml-auto h-4 w-4 flex-shrink-0 text-red-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Correction panel */}
          {state === "correction" && result && (
            <div
              className={`mt-6 rounded-xl p-4 ${
                result.isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
              }`}
            >
              <p className={`font-semibold ${result.isCorrect ? "text-green-800" : "text-red-800"}`}>
                {result.isCorrect ? "✓ Bonne réponse !" : "✗ Mauvaise réponse"}
              </p>
              <p className="mt-1 text-sm text-slate-700">{result.explanationShort}</p>
              {result.explanationLong && result.explanationLong !== result.explanationShort && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-700">
                    Voir l&apos;explication complète
                  </summary>
                  <p className="mt-2 text-sm text-slate-600">{result.explanationLong}</p>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="mt-6">
          {state === "question" && (
            <button
              onClick={submitAnswer}
              disabled={!selected.length}
              className="w-full rounded-xl bg-brand py-3.5 font-semibold text-white hover:bg-brand-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Valider ma réponse
            </button>
          )}
          {state === "correction" && (
            <button
              onClick={next}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 font-semibold text-white hover:bg-brand-dark transition-colors"
            >
              {current >= questions.length - 1 ? "Terminer la série" : "Question suivante"}
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      {children}
    </div>
  );
}

function PauseScreen({ pauseUntil }: { pauseUntil: string }) {
  const [remaining, setRemaining] = useState("");
  const router = useRouter();

  useEffect(() => {
    const tick = () => {
      const diff = new Date(pauseUntil).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining("Terminée !");
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${m}:${s.toString().padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [pauseUntil]);

  const resumeTime = new Date(pauseUntil).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Screen>
      <div className="w-full max-w-md rounded-2xl border border-orange-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
          <Clock className="h-8 w-8 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Pause obligatoire</h2>
        <p className="mt-2 text-sm text-slate-500">
          Tu as terminé ton bloc de 2 séries. Ton cerveau a besoin de consolider.
        </p>

        <div className="my-8">
          <p className="text-sm text-slate-400">Temps restant</p>
          <p className="mt-1 font-mono text-5xl font-extrabold text-brand">{remaining}</p>
          <p className="mt-2 text-sm text-slate-500">Reprise à {resumeTime}</p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4 text-left">
          <p className="text-sm font-medium text-slate-700">💡 Pourquoi cette pause ?</p>
          <p className="mt-1 text-sm text-slate-500">
            La consolidation mémorielle se produit pendant le repos. Les études montrent que les pauses
            entre les sessions d&apos;apprentissage augmentent la rétention de 30 à 40%.
          </p>
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Voir mon dashboard
        </button>
      </div>
    </Screen>
  );
}
