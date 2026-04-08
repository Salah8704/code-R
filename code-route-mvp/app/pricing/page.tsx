export default function PricingPage() {
  const plans = [
    { name: "Pack 21 jours", price: "19€", desc: "Programme intensif pour premiers testeurs" },
    { name: "Mensuel", price: "12€/mois", desc: "Accès continu à l'entraînement" }
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold">Tarifs</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <div key={plan.name} className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold">{plan.name}</h2>
            <p className="mt-2 text-3xl font-bold">{plan.price}</p>
            <p className="mt-3 text-slate-600">{plan.desc}</p>
            <button className="mt-6 rounded-xl bg-brand px-4 py-3 text-white">Payer avec Stripe</button>
          </div>
        ))}
      </div>
    </main>
  );
}
