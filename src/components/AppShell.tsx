import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  Tags,
  Repeat,
  TrendingUp,
  PieChart,
  Lightbulb,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const NAV = [
  { to: "/", key: "dashboard", icon: LayoutDashboard },
  { to: "/contas-a-pagar", key: "contasPagar", icon: ArrowUpCircle },
  { to: "/contas-a-receber", key: "contasReceber", icon: ArrowDownCircle },
  { to: "/formas-de-pagamento", key: "formasPagamento", icon: Wallet },
  { to: "/categorias", key: "categorias", icon: Tags },
  { to: "/transferencias", key: "transferencias", icon: Repeat },
  { to: "/fluxo-de-caixa", key: "fluxoCaixa", icon: TrendingUp },
  { to: "/graficos", key: "graficos", icon: PieChart },
  { to: "/dicas", key: "dicas", icon: Lightbulb },
  { to: "/configuracoes", key: "configuracoes", icon: Settings },
] as const;

export function AppShell({ username, children }: { username: string; children: ReactNode }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = NAV.find((n) => n.to === pathname) ?? NAV[0];

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto border-r border-sidebar-border bg-sidebar/95 p-4 backdrop-blur-xl transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-3 flex items-center gap-2 px-2 py-3">
          <div className="gradient-brand flex h-9 w-9 items-center justify-center rounded-xl text-lg">
            💰
          </div>
          <span className="font-display text-base font-extrabold text-sidebar-foreground">
            {t("appName")}
          </span>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, key, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: to === "/" }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{
                className:
                  "gradient-brand !text-sidebar-primary-foreground shadow-glow hover:!text-sidebar-primary-foreground",
              }}
            >
              <Icon className="h-4 w-4" />
              <span>{t(key)}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-3 border-t border-sidebar-border pt-3">
          <p className="px-3 pb-2 text-xs text-muted-foreground">
            {t("bemVindo")},{" "}
            <span className="font-bold text-sidebar-foreground">{username}</span>
          </p>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            <span>{t("sair")}</span>
          </button>
        </div>
      </aside>

      {open && (
        <button
          aria-label="close"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-background/70 md:hidden"
        />
      )}

      <div className="md:ml-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/60 px-4 py-3.5 backdrop-blur-lg md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen((o) => !o)}
              className="rounded-lg bg-secondary/60 p-2 md:hidden"
              aria-label="menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <h1 className="font-display text-lg font-bold md:text-xl">{t(current.key)}</h1>
          </div>
          <span className="flex items-center gap-2 text-xs text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            {t("autoSalvo")}
          </span>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
