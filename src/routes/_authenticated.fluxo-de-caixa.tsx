import { useMemo, useState } from "react";
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
        content: "Acompanhe entradas, saídas e a previsão de saldo por período.",
      },
      { property: "og:title", content: "Fluxo de Caixa — Meu Dinheiro" },
      { property: "og:description", content: "Entradas, saídas e previsão de saldo do seu caixa." },
    ],
  }),
  component: FluxoPage,
});

const iso = (d: Date) => d.toISOString().slice(0, 10);

function FluxoPage() {
  const { t, money } = useI18n();
  const { user } = useAuth();
  const { data } = useFinanceData(user?.id);

  const hoje = new Date();
  const [inicio, setInicio] = useState(() => iso(hoje));
  const [fim, setFim] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return iso(d);
  });
  const [mes, setMes] = useState(() => iso(hoje).slice(0, 7));

  const meses = useMemo(() => (data ? monthlyFlow(data) : []), [data]);

  const periodo = useMemo(() => {
    if (!data) return { receitas: 0, despesas: 0, saldoProjetado: 0 };
    const { total } = computeBalances(data);
    const pend = data.lancamentos.filter(
      (l) => l.status === "pendente" && l.data >= inicio && l.data <= fim,
    );
    const receitas = pend
      .filter((l) => l.tipo === "receber")
      .reduce((a, l) => a + Number(l.valor), 0);
    const despesas = pend.filter((l) => l.tipo === "pagar").reduce((a, l) => a + Number(l.valor), 0);
    return { receitas, despesas, saldoProjetado: total + receitas - despesas };
  }, [data, inicio, fim]);

  if (!data) return <p className="text-muted-foreground">{t("carregando")}</p>;

  const { total } = computeBalances(data);
  const f30 = buildForecast(data, 30);
  const linha = meses.find((m) => m.mes === mes) ?? { mes, receitas: 0, despesas: 0 };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card label={t("saldoTotal")} value={money(total)} tone="text-gold" />
        <Card label={t("previsaoProximos30")} value={money(f30.saldoProjetado)} tone="text-info" />
        <div className="glass glass-hover p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("periodoPersonalizado")}
          </p>
          <p className="mt-2 font-display text-2xl font-extrabold text-success">
            {money(periodo.saldoProjetado)}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
              {t("dataInicial")}
              <input
                type="date"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
                className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
              />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
              {t("dataFinal")}
              <input
                type="date"
                value={fim}
                onChange={(e) => setFim(e.target.value)}
                className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="glass overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <p className="font-display text-sm font-bold">{t("fluxoMensal")}</p>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            {t("mesSelecionado")}
            <input
              type="month"
              value={mes}
              onChange={(e) => setMes(e.target.value || iso(new Date()).slice(0, 7))}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
            />
          </label>
        </div>
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="p-4 font-semibold">{t("mesSelecionado")}</th>
              <th className="p-4 text-right font-semibold">{t("receita")}</th>
              <th className="p-4 text-right font-semibold">{t("despesa")}</th>
              <th className="p-4 text-right font-semibold">{t("saldoTotal")}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50">
              <td className="p-4 font-semibold">{linha.mes}</td>
              <td className="p-4 text-right text-success">{money(linha.receitas)}</td>
              <td className="p-4 text-right text-destructive">{money(linha.despesas)}</td>
              <td
                className={cn(
                  "p-4 text-right font-bold",
                  linha.receitas - linha.despesas >= 0 ? "text-success" : "text-destructive",
                )}
              >
                {money(linha.receitas - linha.despesas)}
              </td>
            </tr>
            {linha.receitas === 0 && linha.despesas === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  {t("nenhumLancamento")}
                </td>
              </tr>
            )}
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
