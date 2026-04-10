"use client";
import { useEffect, useState, FormEvent, useRef, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Upload, Search, Filter } from "lucide-react";

type Choice = { id: string; text: string; isCorrect: boolean; position: number };
type Question = { id: string; theme: string; subtheme: string; trapFamily: string; difficulty: number; prompt: string; choices: Choice[]; };
type Tab = "list" | "add" | "import";

const EMPTY_FORM = {
  theme: "", subtheme: "", trapFamily: "", difficulty: 1, prompt: "", explanationShort: "",
  choices: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: true }],
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filtered, setFiltered] = useState<Question[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState<Tab>("list");
  const [search, setSearch] = useState("");
  const [filterTheme, setFilterTheme] = useState("all");
  const [filterDiff, setFilterDiff] = useState("all");
  const [importResult, setImportResult] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") { router.push("/dashboard"); return; }
    fetchQ();
  }, [session, status, router]);

  useEffect(() => {
    let list = questions;
    if (search) list = list.filter((q) => q.prompt.toLowerCase().includes(search.toLowerCase()) || q.trapFamily.toLowerCase().includes(search.toLowerCase()));
    if (filterTheme !== "all") list = list.filter((q) => q.theme === filterTheme);
    if (filterDiff !== "all") list = list.filter((q) => q.difficulty === Number(filterDiff));
    setFiltered(list);
  }, [questions, search, filterTheme, filterDiff]);

  async function fetchQ() {
    const res = await fetch("/api/admin/questions");
    if (res.ok) { const d = await res.json(); setQuestions(d); setFiltered(d); }
    setLoading(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setSaving(true); setMsg("");
    const res = await fetch("/api/admin/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) { const q = await res.json(); setQuestions((p) => [q, ...p]); setForm(EMPTY_FORM); setMsg("Question ajoutee"); setTab("list"); }
    else setMsg("Erreur lors de l'ajout");
  }

  async function deleteQ(id: string) {
    if (!confirm("Supprimer cette question ?")) return;
    await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
    setQuestions((p) => p.filter((q) => q.id !== id));
  }

  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const text = await file.text(); let json;
    try { json = JSON.parse(text); } catch { setImportResult("JSON invalide"); return; }
    const res = await fetch("/api/admin/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(json) });
    const data = await res.json();
    setImportResult(`${data.imported} importees · ${data.skipped} ignorees`);
    fetchQ();
  }

  const themes = [...new Set(questions.map((q) => q.theme))].sort();
  if (loading) return <div className="p-8 text-slate-400">Chargement...</div>;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold text-brand">Code Route</Link>
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">Admin</span>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex gap-1 rounded-xl bg-white border border-slate-200 p-1 mb-6 w-fit">
          {([["list", "Questions"], ["add", "Ajouter"], ["import", "Importer JSON"]] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === t ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-50"}`}>{label}</button>
          ))}
        </div>
        {msg && <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{msg}</div>}

        {tab === "list" && (
          <>
            <div className="mb-4 flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="text-sm outline-none w-48" />
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <select value={filterTheme} onChange={(e) => setFilterTheme(e.target.value)} className="text-sm outline-none bg-transparent">
                  <option value="all">Tous themes</option>
                  {themes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <select value={filterDiff} onChange={(e) => setFilterDiff(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                <option value="all">Toutes difficultes</option>
                <option value="1">Facile</option><option value="2">Moyen</option><option value="3">Difficile</option>
              </select>
              <span className="ml-auto text-sm text-slate-400">{filtered.length}/{questions.length} questions</span>
            </div>
            <div className="space-y-2">
              {filtered.map((q) => (
                <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-4 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{q.prompt}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">{q.theme}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{q.trapFamily}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Diff. {q.difficulty}/3</span>
                    </div>
                  </div>
                  <button onClick={() => deleteQ(q.id)} className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "add" && (
          <form onSubmit={handleSubmit} className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2"><Plus className="h-4 w-4" />Nouvelle question</h2>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Question</label>
              <textarea rows={3} value={form.prompt} onChange={(e) => setForm((p) => ({ ...p, prompt: e.target.value }))} required className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand" placeholder="J'arrive a une intersection..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Theme</label><input value={form.theme} onChange={(e) => setForm((p) => ({ ...p, theme: e.target.value }))} required className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Sous-theme</label><input value={form.subtheme} onChange={(e) => setForm((p) => ({ ...p, subtheme: e.target.value }))} required className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Famille de piege</label><input value={form.trapFamily} onChange={(e) => setForm((p) => ({ ...p, trapFamily: e.target.value }))} required className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Difficulte</label>
                <select value={form.difficulty} onChange={(e) => setForm((p) => ({ ...p, difficulty: Number(e.target.value) }))} className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand">
                  <option value={1}>1 Facile</option><option value={2}>2 Moyen</option><option value={3}>3 Difficile</option>
                </select>
              </div>
            </div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Explication courte</label><input value={form.explanationShort} onChange={(e) => setForm((p) => ({ ...p, explanationShort: e.target.value }))} required className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand" /></div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Choix</label>
                <button type="button" onClick={() => setForm((p) => ({ ...p, choices: [...p.choices, { text: "", isCorrect: false }] }))} className="text-xs text-brand hover:underline">+ Ajouter</button>
              </div>
              {form.choices.map((c, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input type="checkbox" checked={c.isCorrect} onChange={(e) => setForm((p) => ({ ...p, choices: p.choices.map((x, j) => j === i ? { ...x, isCorrect: e.target.checked } : x) }))} className="h-4 w-4 accent-brand" />
                  <input value={c.text} onChange={(e) => setForm((p) => ({ ...p, choices: p.choices.map((x, j) => j === i ? { ...x, text: e.target.value } : x) }))} required className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand" placeholder={`Choix ${i + 1}`} />
                  {form.choices.length > 2 && <button type="button" onClick={() => setForm((p) => ({ ...p, choices: p.choices.filter((_, j) => j !== i) }))} className="text-slate-300 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>}
                </div>
              ))}
            </div>
            <button type="submit" disabled={saving} className="w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">{saving ? "Enregistrement..." : "Ajouter"}</button>
          </form>
        )}

        {tab === "import" && (
          <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <Upload className="mx-auto h-10 w-10 text-slate-300 mb-4" />
            <h2 className="font-semibold text-slate-900">Importer un fichier JSON</h2>
            <p className="mt-2 text-sm text-slate-500">Format : questions avec trap_family, explanation_short, choices.is_correct</p>
            <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="mt-6 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark">Choisir un fichier JSON</button>
            {importResult && <p className="mt-4 text-sm font-medium text-green-700">{importResult}</p>}
          </div>
        )}
      </div>
    </main>
  );
}
