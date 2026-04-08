import questions from "@/data/questions.sample.json";

export default function QuizPage() {
  const q = questions.questions[0];

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">Question 1 / 20</p>
        <h1 className="mt-3 text-2xl font-semibold">{q.prompt}</h1>
        <div className="mt-6 space-y-3">
          {q.choices.map((choice) => (
            <label key={choice.id} className="block rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
              <input type="radio" name="choice" className="mr-3" />
              {choice.text}
            </label>
          ))}
        </div>
        <button className="mt-6 rounded-xl bg-brand px-4 py-3 text-white">Valider</button>
      </div>
    </main>
  );
}
