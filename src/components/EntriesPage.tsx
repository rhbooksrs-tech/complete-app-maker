import { useMemo, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFinanceData, useFinanceMutations } from "@/hooks/useFinance";
import { useI18n } from "@/lib/i18n";
import { todayISO, type Lancamento } from "@/lib/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Draft = {
  id?: string;
  nome: string;
  numero_documento: string;
  valor: string;
  data: string;
  categoria_id: string;
  forma_pagamento_id: string;
  status: "pendente" | "pago";
};

const emptyDraft = (): Draft => ({
  nome: "",
  numero_documento: "",
  valor: "",
  data: todayISO(),
  categoria_id: "",
  forma_pagamento_id: "",
  status: "pendente",
});

export function EntriesPage({ tipo }: { tipo: "pagar" | "receber" }) {
  const { t, money, date } = useI18n();
  const { user } = useAuth();
  const { data } = useFinanceData(user?.id);
  const { upsert, remove } = useFinanceMutations(user?.id);
  const [filter, setFilter] = useState("all");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");

  const cats = useMemo(
    () => (data?.categorias ?? []).filter((c) => c.tipo === (tipo === "receber" ? "receita" : "despesa")),
    [data, tipo],
  );
  const formas = data?.formas ?? [];
  const list = (data?.lancamentos ?? []).filter(
    (l) => l.tipo === tipo && (filter === "all" || l.categoria_id === filter),
  );

  const disabled = formas.length === 0 || cats.length === 0;

  function openEdit(l: Lancamento) {
    setDraft({
      id: l.id,
      nome: l.nome,
      numero_documento: l.numero_documento ?? "",
      valor: String(l.valor),
      data: l.data,
      categoria_id: l.categoria_id ?? "",
      forma_pagamento_id: l.forma_pagamento_id ?? "",
      status: l.status,
    });
    setError("");
  }

  function openNew() {
    setDraft({
      ...emptyDraft(),
      categoria_id: cats[0]?.id ?? "",
      forma_pagamento_id: formas[0]?.id ?? "",
    });
    setError("");
  }

  async function save() {
    if (!draft) return;
    const valor = parseFloat(draft.valor);
    if (!draft.nome || !valor || !draft.categoria_id || !draft.forma_pagamento_id) {
      setError(t("camposObrigatorios"));
      return;
    }
    await upsert.mutateAsync({
      table: "lancamentos",
      id: draft.id,
      values: {
        nome: draft.nome,
        numero_documento: draft.numero_documento || null,
        valor,
        data: draft.data,
        tipo,
        status: draft.status,
        categoria_id: draft.categoria_id,
        forma_pagamento_id: draft.forma_pagamento_id,
      },
    });
    setDraft(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-10 rounded-lg border border-input bg-popover px-3 text-sm text-foreground"
        >
          <option value="all">
            {t("todas")} — {t("categoria")}
          </option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        <Button onClick={openNew} disabled={disabled}>
          <Plus className="mr-1 h-4 w-4" />
          {t("novoLancamento")}
        </Button>
      </div>

      {disabled && (
        <div className="glass p-4 text-sm text-warning">{t("dicasTexto1")}</div>
      )}

      <div className="glass overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="p-4 font-semibold">{t("nome")}</th>
              <th className="p-4 font-semibold">{t("numeroDocumento")}</th>
              <th className="p-4 font-semibold">{t("categoria")}</th>
              <th className="p-4 font-semibold">{t("formaPagamento")}</th>
              <th className="p-4 font-semibold">{t("data")}</th>
              <th className="p-4 text-right font-semibold">{t("valor")}</th>
              <th className="p-4 font-semibold">{t("status")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                  {t("nenhumLancamento")}
                </td>
              </tr>
            )}
            {list.map((l) => {
              const cat = data?.categorias.find((c) => c.id === l.categoria_id);
              const forma = data?.formas.find((f) => f.id === l.forma_pagamento_id);
              return (
                <tr key={l.id} className="border-b border-border/50">
                  <td className="p-4 font-semibold">{l.nome}</td>
                  <td className="p-4 text-muted-foreground">{l.numero_documento || "—"}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: cat?.cor ?? "#666" }}
                      />
                      {cat?.nome ?? ""}
                    </span>
                  </td>
                  <td className="p-4">{forma?.nome ?? ""}</td>
                  <td className="p-4 text-muted-foreground">{date(l.data)}</td>
                  <td
                    className={cn(
                      "p-4 text-right font-bold",
                      tipo === "receber" ? "text-success" : "text-destructive",
                    )}
                  >
                    {money(Number(l.valor))}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() =>
                        upsert.mutate({
                          table: "lancamentos",
                          id: l.id,
                          values: { status: l.status === "pago" ? "pendente" : "pago" },
                        })
                      }
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-xs font-bold",
                        l.status === "pago"
                          ? "bg-success/15 text-success"
                          : "bg-warning/15 text-warning",
                      )}
                    >
                      {l.status === "pago"
                        ? t(tipo === "receber" ? "recebido" : "pago")
                        : t("pendente")}
                    </button>
                  </td>
                  <td className="whitespace-nowrap p-4 text-right">
                    <button onClick={() => openEdit(l)} className="p-1.5 text-muted-foreground hover:text-foreground">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove.mutate({ table: "lancamentos", id: l.id })}
                      className="p-1.5 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("novoLancamento")}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="flex flex-col gap-3">
              <div className="grid gap-1.5">
                <Label>{t("nome")}</Label>
                <Input
                  value={draft.nome}
                  onChange={(e) => setDraft({ ...draft, nome: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>{t("numeroDocumento")}</Label>
                <Input
                  value={draft.numero_documento}
                  onChange={(e) => setDraft({ ...draft, numero_documento: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>{t("valor")}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={draft.valor}
                    onChange={(e) => setDraft({ ...draft, valor: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>{t("data")}</Label>
                  <Input
                    type="date"
                    value={draft.data}
                    onChange={(e) => setDraft({ ...draft, data: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>{t("categoria")}</Label>
                <select
                  value={draft.categoria_id}
                  onChange={(e) => setDraft({ ...draft, categoria_id: e.target.value })}
                  className="h-10 rounded-lg border border-input bg-popover px-3 text-sm"
                >
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1.5">
                <Label>{t("formaPagamento")}</Label>
                <select
                  value={draft.forma_pagamento_id}
                  onChange={(e) => setDraft({ ...draft, forma_pagamento_id: e.target.value })}
                  className="h-10 rounded-lg border border-input bg-popover px-3 text-sm"
                >
                  {formas.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1.5">
                <Label>{t("status")}</Label>
                <select
                  value={draft.status}
                  onChange={(e) =>
                    setDraft({ ...draft, status: e.target.value as "pendente" | "pago" })
                  }
                  className="h-10 rounded-lg border border-input bg-popover px-3 text-sm"
                >
                  <option value="pendente">{t("pendente")}</option>
                  <option value="pago">{t(tipo === "receber" ? "recebido" : "pago")}</option>
                </select>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDraft(null)}>
              {t("cancelar")}
            </Button>
            <Button onClick={save}>{t("salvar")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
