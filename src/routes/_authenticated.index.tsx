import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowDownCircle, ArrowUpCircle, PiggyBank, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFinanceData } from "@/hooks/useFinance";
import { useI18n } from "@/lib/i18n";
import { buildForecast, computeBalances } from "@/lib/finance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Painel — Meu Dinheiro" },
      {
        name: "description",
        content:
          "Veja saldo total, contas a pagar e receber e a previsão de caixa dos próximos 30 e 90 dias.",
      },
      { property: "og:title", content: "Painel — Meu Dinheiro" },
      {
        property: "og:description",
        content: "Saldo, pendências e previsão de caixa em uma única tela.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t, money, date } = useI18n();
  const { user } = useAuth();
  const { data } = useFinanceData(user?.id);

  if (!data) return <p className="text-muted-foreground">{t("carregando")}</p>;

  const { perForma, total, aReceberPendente, aPagarPendente } = computeBalances(data);
  const f30 = buildForecast(data, 30);
  const f90 = buildForecast(data, 90);
  const proximosPagar = [...data.lancamentos]
    .filter((l) => l.status === "pendente" && l.tipo === "pagar")
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 6);
  const proximosReceber = [...data.lancamentos]
    .filter((l) => l.status === "pendente" && l.tipo === "receber")
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 6);

  const cards = [
    { label: t("saldoTotal"), value: total, icon: PiggyBank, tone: "text-gold" },
    { label: t("aReceberPendente"), value: aReceberPendente, icon: ArrowDownCircle, tone: "text-success" },
    { label: t("aPagarPendente"), value: aPagarPendente, icon: ArrowUpCircle, tone: "text-destructive" },
    { label: t("saldoProjetado"), value: f30.saldoProjetado, icon: TrendingUp, tone: "text-info" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {alertas.length > 0 && (
        <Link
          to="/notificacoes"
          className="glass glass-hover flex flex-wrap items-center gap-3 border-l-4 border-l-gold p-4"
        >
          <BellRing className="h-5 w-5 text-gold" />
          <p className="text-sm font-semibold">
            {alertas.length} · {t("vencimentosProximos")}
          </p>
          <p className="text-xs text-muted-foreground">
            {alertas[0].nome} — {date(alertas[0].data)} · {money(Number(alertas[0].valor))}
          </p>
          <span className="ml-auto text-xs font-semibold text-gold underline">{t("verTodos")}</span>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="glass glass-hover p-5">
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
              <Icon className={cn("h-5 w-5", tone)} />
            </div>
            <p className={cn("mt-3 font-display text-2xl font-extrabold", tone)}>{money(value)}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass p-5">
          <h2 className="mb-4 font-display text-base font-bold">{t("saldoPorForma")}</h2>
          <div className="flex flex-col gap-3">
            {data.formas.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("dicasTexto1")}</p>
            )}
            {data.formas.map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: f.cor }} />
                  {f.nome}
                </span>
                <span className="font-bold">{money(perForma[f.id] ?? 0)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-5">
          <h2 className="mb-4 font-display text-base font-bold">{t("previsaoProximos30")}</h2>
          <div className="flex flex-col gap-3 text-sm">
            <Row label={t("receita")} value={money(f30.receitas)} tone="text-success" />
            <Row label={t("despesa")} value={money(f30.despesas)} tone="text-destructive" />
            <Row label={t("saldoProjetado")} value={money(f30.saldoProjetado)} tone="text-gold" />
            <div className="mt-2 border-t border-border pt-3">
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                {t("previsaoProximos90")}
              </p>
              <Row label={t("saldoProjetado")} value={money(f90.saldoProjetado)} tone="text-info" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold">{t("contasPagar")}</h2>
            <Link to="/contas-a-pagar" className="text-xs font-semibold text-gold underline">
              {t("verTodos")}
            </Link>
          </div>
          {proximosPagar.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("nenhumLancamento")}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border/60">
              {proximosPagar.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-semibold">{l.nome}</p>
                    <p className="text-xs text-muted-foreground">{date(l.data)}</p>
                  </div>
                  <span className="font-bold text-destructive">− {money(Number(l.valor))}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold">{t("contasReceber")}</h2>
            <Link to="/contas-a-receber" className="text-xs font-semibold text-gold underline">
              {t("verTodos")}
            </Link>
          </div>
          {proximosReceber.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("nenhumLancamento")}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border/60">
              {proximosReceber.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-semibold">{l.nome}</p>
                    <p className="text-xs text-muted-foreground">{date(l.data)}</p>
                  </div>
                  <span className="font-bold text-success">+ {money(Number(l.valor))}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-bold", tone)}>{value}</span>
    </div>
  );
}
