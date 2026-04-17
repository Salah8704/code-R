"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Question = {
  id: string;
  text: string;
  theme: string;
  subtheme: string;
  difficulty: number;
  trapFamily: string;
  explanationShort: string;
  explanationLong: string;
  choices: { id: string; text: string; isCorrect: boolean }[];
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      router.push("/dashboard");
      return;
    }

    fetch("/api/admin/questions")
      .then((r) => r.json())
      .then((data: { questions?: Question[] }) => {
        setQuestions(data.questions ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur de chargement");
        setLoading(false);
      });
  }, [session, status, router]);

  const deleteQuestion = async (id: string) => {
    if (!confirm("Supprimer cette question ?")) return;
    const r = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
    if (r.ok) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            Admin — Questions ({questions.length})
          </h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            Retour
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-slate-400 shadow-sm">
            Aucune question trouvée.
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => (
              <div
                key={q.id}
                className="rounded-xl bg-white p-4 shadow-sm border border-slate-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{q.text}</p>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="rounded bg-slate-100 px-2 py-0.5">{q.theme}</span>
                      <span className="rounded bg-slate-100 px-2 py-0.5">{q.subtheme}</span>
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-700">
                        Diff. {q.difficulty}
                      </span>
                      <span className="rounded bg-orange-100 px-2 py-0.5 text-orange-700">
                        {q.trapFamily}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteQuestion(q.id)}
                    className="shrink-0 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
