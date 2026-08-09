import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useFinanceData } from "@/hooks/useFinance";
import { useI18n } from "@/lib/i18n";
import { computeBalances, monthlyFlow, totalsByCategory } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/graficos")({
  head: () => ({
    meta: [
      { title: "Gráficos — Meu Dinheiro" },
      {
        name: "description",
        content: "Visualize despesas e receitas por categoria, saldo por conta e o fluxo mensal.",
      },
      { property: "og:title", content: "Gráficos — Meu Dinheiro" },
      { property: "og:description", content: "Suas finanças em gráficos claros e objetivos." },
    ],
  }),
  component: GraficosPage,
});

function GraficosPage() {
  const { t, money } = useI18n();
  const { user } = useAuth();
  const { data } = useFinanceData(user?.id);
  if (!data) return <p className="text-muted-foreground">{t("carregando")}</p>;

  const despesas = totalsByCategory(data, "despesa");
  const receitas = totalsByCategory(data, "receita");
  const { perForma } = computeBalances(data);
  const saldos = data.formas.map((f) => ({
    name: f.nome,
    color: f.cor,
    value: Math.round((perForma[f.id] ?? 0) * 100) / 100,
  }));
  const meses = monthlyFlow(data);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ChartCard title={t("despesasPorCategoria")} empty={despesas.length === 0} emptyText={t("nenhumLancamento")}>
        <PieChart>
          <Pie data={despesas} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
            {despesas.map((d) => (
              <Cell key={d.name} fill={d.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => money(v)} contentStyle={tooltipStyle} />
          <Legend />
        </PieChart>
      </ChartCard>

      <ChartCard title={t("receitasPorCategoria")} empty={receitas.length === 0} emptyText={t("nenhumLancamento")}>
        <PieChart>
          <Pie data={receitas} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
            {receitas.map((d) => (
              <Cell key={d.name} fill={d.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => money(v)} contentStyle={tooltipStyle} />
          <Legend />
        </PieChart>
      </ChartCard>

      <ChartCard title={t("saldoPorFormaGrafico")} empty={saldos.length === 0} emptyText={t("nenhumLancamento")}>
        <BarChart data={saldos}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "currentColor" }} />
          <YAxis tick={{ fontSize: 12, fill: "currentColor" }} width={70} />
          <Tooltip formatter={(v: number) => money(v)} contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {saldos.map((s) => (
              <Cell key={s.name} fill={s.color} />
            ))}
          </Bar>
        </BarChart>
      </ChartCard>

      <ChartCard title={t("fluxoMensal")} empty={meses.length === 0} emptyText={t("nenhumLancamento")}>
        <BarChart data={meses}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "currentColor" }} />
          <YAxis tick={{ fontSize: 12, fill: "currentColor" }} width={70} />
          <Tooltip formatter={(v: number) => money(v)} contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Legend />
          <Bar dataKey="receitas" name={t("receita")} fill="#34d399" radius={[8, 8, 0, 0]} />
          <Bar dataKey="despesas" name={t("despesa")} fill="#fb7185" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ChartCard>
    </div>
  );
}

const tooltipStyle = {
  background: "rgba(30,10,40,0.95)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  color: "#fff",
} as const;

function ChartCard({
  title,
  empty,
  emptyText,
  children,
}: {
  title: string;
  empty: boolean;
  emptyText: string;
  children: React.ReactElement;
}) {
  return (
    <div className="glass p-5">
      <h2 className="mb-4 font-display text-base font-bold">{title}</h2>
      {empty ? (
        <p className="py-16 text-center text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="h-72 text-muted-foreground">
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
