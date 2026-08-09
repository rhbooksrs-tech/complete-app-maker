import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useFinanceData } from "@/hooks/useFinance";
import { useI18n } from "@/lib/i18n";
import { buildForecast, computeBalances, monthlyFlow } from "@/lib/finance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/fluxo-de-caixa")({
  head: () => ({
    meta: [
      { title: "Fluxo de Caixa — Meu Dinheiro" },
      {
        name: "description",
        content: "Acompanhe entradas, saídas e a previsão de saldo para 30 e 90 dias.",
      },
      { property: "og:title", content: "Fluxo de Caixa — Meu Dinheiro" },
      { property: "og:description", content: "Entradas, saídas e previsão de saldo do seu caixa." },
    ],
  }),
  component: FluxoPage,
});

function FluxoPage() {
  const { t, money } = useI18n();
  const { user } = useAuth();
  const { data } = useFinanceData(user?.id);
  if (!data) return <p className="text-muted-foreground">{t("carregando")}</p>;

  const { total } = computeBalances(data);
  const f30 = buildForecast(data, 30);
  const f90 = buildForecast(data, 90);
  const meses = monthlyFlow(data);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card label={t("saldoTotal")} value={money(total)} tone="text-gold" />
        <Card label={t("previsaoProximos30")} value={money(f30.saldoProjetado)} tone="text-info" />
        <Card label={t("previsaoProximos90")} value={money(f90.saldoProjetado)} tone="text-success" />
      </div>

      <div className="glass overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="p-4 font-semibold">{t("fluxoMensal")}</th>
              <th className="p-4 text-right font-semibold">{t("receita")}</th>
              <th className="p-4 text-right font-semibold">{t("despesa")}</th>
              <th className="p-4 text-right font-semibold">{t("saldoTotal")}</th>
            </tr>
          </thead>
          <tbody>
            {meses.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  {t("nenhumLancamento")}
                </td>
              </tr>
            )}
            {meses.map((m) => (
              <tr key={m.mes} className="border-b border-border/50">
                <td className="p-4 font-semibold">{m.mes}</td>
                <td className="p-4 text-right text-success">{money(m.receitas)}</td>
                <td className="p-4 text-right text-destructive">{money(m.despesas)}</td>
                <td
                  className={cn(
                    "p-4 text-right font-bold",
                    m.receitas - m.despesas >= 0 ? "text-success" : "text-destructive",
                  )}
                >
                  {money(m.receitas - m.despesas)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="glass glass-hover p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-2 font-display text-2xl font-extrabold", tone)}>{value}</p>
    </div>
  );
}
