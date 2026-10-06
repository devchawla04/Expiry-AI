import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

const features = [
  { title: "Read the label", text: "Photograph a pack or scan a barcode. You confirm the expiry before it is saved." },
  { title: "Use it up", text: "When food is close to the date, ShelfSense suggests a meal from what you already have." },
  { title: "Know the money", text: "See what you used in time, what got tossed, and what is still at risk." },
];

export function Landing() {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-dvh place-items-center text-muted">Opening ShelfSense…</div>;
  if (user) return <Navigate to="/app" replace />;

  return (
    <div className="mx-auto max-w-6xl px-5 py-6">
      <header className="flex items-center justify-between">
        <p className="font-display text-2xl">ShelfSense</p>
        <div className="flex gap-2">
          <Link to="/login" className="rounded-full px-4 py-2 text-sm font-medium">
            Sign in
          </Link>
          <Link to="/signup" className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-white">
            Start free
          </Link>
        </div>
      </header>
      <section className="grid items-center gap-10 py-12 md:grid-cols-[1.1fr_0.9fr] md:py-20">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-forest">Your pantry, with a memory</p>
          <h1 className="mt-3 font-display text-5xl leading-[1.05] text-ink md:text-7xl">Stop losing food to the back of the fridge.</h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            ShelfSense tracks what you bought, reads the label, and tells you what to cook before it expires.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup" className="rounded-full bg-forest px-5 py-3 text-sm font-medium text-white">
              Build my pantry
            </Link>
            <Link to="/login" className="rounded-full border border-line bg-card px-5 py-3 text-sm font-medium">
              Try the demo kitchen
            </Link>
          </div>
        </div>
        <div className="rounded-[2rem] border border-line bg-card p-5 shadow-card">
          <p className="text-sm text-muted">Good morning</p>
          <h2 className="font-display text-3xl">5 foods need a plan</h2>
          <div className="mt-4 grid gap-2">
            {[
              ["Spinach", "Expires today"],
              ["Chicken breast", "Expires tomorrow"],
              ["Taaza milk", "2 days left"],
            ].map(([name, when]) => (
              <div key={name} className="flex items-center justify-between rounded-2xl bg-paper px-3 py-3">
                <span className="font-medium">{name}</span>
                <span className="text-sm text-clay">{when}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl bg-forest px-4 py-4 text-white">
            <p className="text-sm text-white/80">Tonight</p>
            <p className="font-display text-2xl">Creamy chicken & spinach pasta</p>
            <p className="mt-1 text-sm text-white/80">Uses 4 foods that are running out of time.</p>
          </div>
        </div>
      </section>
      <section className="grid gap-4 pb-16 md:grid-cols-3">
        {features.map((feature) => (
          <article key={feature.title} className="rounded-3xl border border-line bg-card p-5">
            <h2 className="font-display text-2xl">{feature.title}</h2>
            <p className="mt-2 text-sm text-muted">{feature.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
