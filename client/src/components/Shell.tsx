import { BarChart3, ChefHat, House, Refrigerator, ScanLine, ShoppingBasket, UserRound } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";

const links = [
  { to: "/app", label: "Home", icon: House, end: true },
  { to: "/app/pantry", label: "Pantry", icon: Refrigerator },
  { to: "/app/scan", label: "Scan", icon: ScanLine },
  { to: "/app/recipes", label: "Cook", icon: ChefHat },
  { to: "/app/shopping", label: "Shop", icon: ShoppingBasket },
  { to: "/app/insights", label: "Insights", icon: BarChart3 },
  { to: "/app/profile", label: "Profile", icon: UserRound },
];

function sideClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium ${
    isActive ? "bg-forest text-white" : "text-ink/80 hover:bg-forest-soft"
  }`;
}

export function Shell() {
  const { user } = useAuth();
  const initial = user?.name?.slice(0, 1).toUpperCase() ?? "S";

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-card/80 px-4 py-6 md:flex">
        <NavLink to="/app" className="px-2 font-display text-3xl">
          ShelfSense
        </NavLink>
        <p className="mt-1 px-2 text-sm text-muted">Use it before it's gone.</p>
        <nav className="mt-8 grid gap-1">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={sideClass}>
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 pt-4 md:hidden">
          <NavLink to="/app" className="font-display text-2xl">
            ShelfSense
          </NavLink>
          <NavLink to="/app/profile" className="grid h-10 w-10 place-items-center rounded-full bg-forest text-sm text-white">
            {initial}
          </NavLink>
        </div>
        <main className="mx-auto max-w-5xl px-4 pb-36 pt-5 md:px-8 md:pb-12 md:pt-8">
          <Outlet />
        </main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-5 px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-2">
          <Tab to="/app" label="Home" icon={House} end />
          <Tab to="/app/pantry" label="Pantry" icon={Refrigerator} />
          <NavLink to="/app/scan" className="flex flex-col items-center text-xs">
            <span className="-mt-6 grid h-14 w-14 place-items-center rounded-full bg-forest text-white shadow-card">
              <ScanLine size={22} />
            </span>
            Scan
          </NavLink>
          <Tab to="/app/insights" label="Insights" icon={BarChart3} />
          <Tab to="/app/profile" label="You" icon={UserRound} />
        </div>
      </nav>
    </div>
  );
}

function Tab({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string;
  label: string;
  icon: typeof House;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `flex flex-col items-center gap-1 py-1 text-[11px] ${isActive ? "text-forest" : "text-muted"}`}
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}
