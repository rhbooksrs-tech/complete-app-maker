import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, BellRing, CalendarClock, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFinanceData, useFinanceMutations } from "@/hooks/useFinance";
import { useI18n } from "@/lib/i18n";
import { buildAlerts, buildForecast, type Alerta } from "@/lib/finance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notificacoes")({
  head: () => ({
    meta: [
      { title: "Notificações de Vencimento — Meu Dinheiro" },
      {
        name: "description",
        content:
          "Alertas das contas a pagar e a receber que estão vencendo, com data, valor e previsão do período.",
      },
      { property: "og:title", content: "Notificações de Vencimento — Meu Dinheiro" },
      {
        property: "og:description",
        content: "Veja o que vence hoje, o que está atrasado e o que chega nos próximos dias.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotificacoesPage,
});

const JANELAS = [3, 7, 15, 30];

function NotificacoesPage() {
  const { t, money, date } = useI18n();
  const { user } = useAuth();
  const { data } = useFinanceData(user?.id);
  const { upsert } = useFinanceMutations(user?.id);
  const [dias, setDias] = useState(7);

  if (!data) return <p className="text-muted-foreground">{t("carregando")}</p>;

  const alertas = buildAlerts(data, dias);
  const vencidos = alertas.filter((a) => a.nivel === "vencido");
  const hoje = alertas.filter((a) => a.nivel === "hoje");
  const proximos = alertas.filter((a) => a.nivel === "proximo");
  const f = buildForecast(data, dias);

  return (
    <div className="flex flex-col gap-6">
      <div className="glass flex flex-wrap items-center gap-3 p-5">
        <BellRing className="h-5 w-5 text-gold" />
        <h2 className="font-display text-base font-bold">{t("vencimentosProximos")}</h2>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{t("janelaAlerta")}</span>
          {JANELAS.map((d) => (
            <button
              key={d}
              onClick={() => setDias(d)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                dias === d
                  ? "gradient-brand text-primary-foreground"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground",
              )}
            >
              {d} {t("dias")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label={t("vencidas")} value={String(vencidos.length)} tone="text-destructive" />
        <Kpi label={t("venceHoje")} value={String(hoje.length)} tone="text-gold" />
        <Kpi label={t("aPagarPendente")} value={money(f.despesas)} tone="text-destructive" />
        <Kpi label={t("aReceberPendente")} value={money(f.receitas)} tone="text-success" />
      </div>

      <div className="glass p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-display text-base font-bold">
            <CalendarClock className="h-4 w-4 text-info" />
            {t("previsaoPeriodoAlerta")}
          </h3>
          <span className="font-display text-lg font-extrabold text-gold">
            {money(f.saldoProjetado)}
          </span>
        </div>
      </div>

      <div className="glass p-5">
        {alertas.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" />
            {t("semNotificacoes")}
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border/60">
            {[...vencidos, ...hoje, ...proximos].map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
                <AlertTriangle
                  className={cn(
                    "h-4 w-4 shrink-0",
                    a.nivel === "vencido"
                      ? "text-destructive"
                      : a.nivel === "hoje"
                        ? "text-gold"
                        : "text-info",
                  )}
                />
                <div className="min-w-40 flex-1">
                  <p className="text-sm font-semibold">{a.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {date(a.data)}
                    {a.categoria ? ` · ${a.categoria}` : ""} · {legenda(a, t)}
                  </p>
                </div>
                <span
                  className={cn(
                    "font-bold",
                    a.tipo === "pagar" ? "text-destructive" : "text-success",
                  )}
                >
                  {a.tipo === "pagar" ? "− " : "+ "}
                  {money(a.valor)}
                </span>
                <button
                  onClick={() =>
                    upsert.mutate({ table: "lancamentos", id: a.id, values: { status: "pago" } })
                  }
                  className="rounded-lg bg-secondary/60 px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
                >
                  {t("marcarPago")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function legenda(a: Alerta, t: (k: string) => string) {
  if (a.nivel === "hoje") return t("venceHoje");
  if (a.nivel === "vencido") return `${t("venceuHa")} ${Math.abs(a.dias)} ${t("dias")}`;
  return `${t("venceEm")} ${a.dias} ${t("dias")}`;
}

function Kpi({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="glass glass-hover p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-3 font-display text-2xl font-extrabold", tone)}>{value}</p>
    </div>
  );
}
