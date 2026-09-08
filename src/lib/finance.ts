export type Categoria = {
  id: string;
  nome: string;
  cor: string;
  tipo: "receita" | "despesa";
};

export type Forma = {
  id: string;
  nome: string;
  cor: string;
  saldo_inicial: number;
};

export type Lancamento = {
  id: string;
  nome: string;
  numero_documento: string | null;
  valor: number;
  data: string;
  tipo: "pagar" | "receber";
  status: "pendente" | "pago";
  categoria_id: string | null;
  forma_pagamento_id: string | null;
};

export type Transferencia = {
  id: string;
  origem_id: string | null;
  destino_id: string | null;
  valor: number;
  data: string;
};

export type FinanceData = {
  categorias: Categoria[];
  formas: Forma[];
  lancamentos: Lancamento[];
  transferencias: Transferencia[];
};

export const PALETTE = [
  "#3b82f6",
  "#a855f7",
  "#22d3ee",
  "#34d399",
  "#f59e0b",
  "#fb7185",
  "#f472b6",
  "#818cf8",
  "#14b8a6",
  "#eab308",
  "#ef4444",
  "#94a3b8",
];

export const todayISO = () => new Date().toISOString().slice(0, 10);

export function computeBalances(data: FinanceData) {
  const perForma: Record<string, number> = {};
  data.formas.forEach((f) => {
    perForma[f.id] = Number(f.saldo_inicial) || 0;
  });
  data.lancamentos.forEach((l) => {
    if (l.status !== "pago" || !l.forma_pagamento_id) return;
    const sign = l.tipo === "receber" ? 1 : -1;
    perForma[l.forma_pagamento_id] = (perForma[l.forma_pagamento_id] ?? 0) + sign * Number(l.valor);
  });
  data.transferencias.forEach((tr) => {
    if (tr.origem_id) perForma[tr.origem_id] = (perForma[tr.origem_id] ?? 0) - Number(tr.valor);
    if (tr.destino_id) perForma[tr.destino_id] = (perForma[tr.destino_id] ?? 0) + Number(tr.valor);
  });
  const total = Object.values(perForma).reduce((a, b) => a + b, 0);
  const aReceberPendente = data.lancamentos
    .filter((l) => l.tipo === "receber" && l.status === "pendente")
    .reduce((a, l) => a + Number(l.valor), 0);
  const aPagarPendente = data.lancamentos
    .filter((l) => l.tipo === "pagar" && l.status === "pendente")
    .reduce((a, l) => a + Number(l.valor), 0);
  return { perForma, total, aReceberPendente, aPagarPendente };
}

export function buildForecast(data: FinanceData, days: number) {
  const { total } = computeBalances(data);
  const end = new Date();
  end.setDate(end.getDate() + days);
  const pend = data.lancamentos.filter(
    (l) => l.status === "pendente" && new Date(`${l.data}T00:00:00`) <= end,
  );
  const receitas = pend
    .filter((l) => l.tipo === "receber")
    .reduce((a, l) => a + Number(l.valor), 0);
  const despesas = pend.filter((l) => l.tipo === "pagar").reduce((a, l) => a + Number(l.valor), 0);
  return { receitas, despesas, saldoProjetado: total + receitas - despesas };
}

export function totalsByCategory(data: FinanceData, tipoCat: "receita" | "despesa") {
  return data.categorias
    .filter((c) => c.tipo === tipoCat)
    .map((c) => ({
      name: c.nome,
      color: c.cor,
      value: data.lancamentos
        .filter((l) => l.categoria_id === c.id && l.status === "pago")
        .reduce((a, l) => a + Number(l.valor), 0),
    }))
    .filter((x) => x.value > 0);
}

export function monthlyFlow(data: FinanceData) {
  const map: Record<string, { mes: string; receitas: number; despesas: number }> = {};
  data.lancamentos
    .filter((l) => l.status === "pago")
    .forEach((l) => {
      const m = l.data.slice(0, 7);
      if (!map[m]) map[m] = { mes: m, receitas: 0, despesas: 0 };
      if (l.tipo === "receber") map[m].receitas += Number(l.valor);
      else map[m].despesas += Number(l.valor);
    });
  return Object.values(map).sort((a, b) => a.mes.localeCompare(b.mes));
}

export function buildFinanceContext(data: FinanceData, currency: string, lang = "pt-BR") {
  const { perForma, total, aReceberPendente, aPagarPendente } = computeBalances(data);
  const em30 = new Date();
  em30.setDate(em30.getDate() + 30);
  const pendentesProximos30 = data.lancamentos
    .filter((l) => l.status === "pendente" && new Date(`${l.data}T00:00:00`) <= em30)
    .sort((a, b) => a.data.localeCompare(b.data))
    .map((l) => ({
      tipo: l.tipo,
      nome: l.nome,
      valor: Number(l.valor),
      categoria: data.categorias.find((c) => c.id === l.categoria_id)?.nome,
      data: l.data,
    }));
  const totaisPorCategoria: Record<string, number> = {};
  data.lancamentos
    .filter((l) => l.status === "pago")
    .forEach((l) => {
      const cat = data.categorias.find((c) => c.id === l.categoria_id)?.nome ?? "—";
      const key = `${l.tipo === "receber" ? "receita: " : "despesa: "}${cat}`;
      totaisPorCategoria[key] = (totaisPorCategoria[key] ?? 0) + Number(l.valor);
    });
  return {
    dataDeHoje: todayISO(),
    moeda: currency,
    saldoTotalAcumulado: Math.round(total * 100) / 100,
    saldoPorFormaDePagamento: data.formas.map((f) => ({
      nome: f.nome,
      saldo: Math.round((perForma[f.id] ?? 0) * 100) / 100,
    })),
    totalAReceberPendente: Math.round(aReceberPendente * 100) / 100,
    totalAPagarPendente: Math.round(aPagarPendente * 100) / 100,
    lancamentosPendentesProximos30Dias: pendentesProximos30,
    totaisPagosPorCategoria: totaisPorCategoria,
    categoriasCadastradas: data.categorias.map((c) => ({ nome: c.nome, tipo: c.tipo })),
    formasDePagamentoCadastradas: data.formas.map((f) => f.nome),
  };
}
