import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFinanceData, useFinanceMutations } from "@/hooks/useFinance";
import { useI18n } from "@/lib/i18n";
import { todayISO } from "@/lib/finance";
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

export const Route = createFileRoute("/_authenticated/transferencias")({
  head: () => ({
    meta: [
      { title: "Transferências — Meu Dinheiro" },
      {
        name: "description",
        content: "Movimente valores entre suas contas e carteiras mantendo os saldos corretos.",
      },
      { property: "og:title", content: "Transferências — Meu Dinheiro" },
      { property: "og:description", content: "Transfira valores entre contas e carteiras." },
    ],
  }),
  component: TransferenciasPage,
});

type Draft = { origem_id: string; destino_id: string; valor: string; data: string };

function TransferenciasPage() {
  const { t, money, date } = useI18n();
  const { user } = useAuth();
  const { data } = useFinanceData(user?.id);
  const { upsert, remove } = useFinanceMutations(user?.id);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");

  const formas = data?.formas ?? [];

  async function save() {
    if (!draft) return;
    const valor = parseFloat(draft.valor);
    if (!valor || !draft.origem_id || !draft.destino_id || draft.origem_id === draft.destino_id) {
      setError(t("camposObrigatorios"));
      return;
    }
    await upsert.mutateAsync({
      table: "transferencias",
      values: {
        origem_id: draft.origem_id,
        destino_id: draft.destino_id,
        valor,
        data: draft.data,
      },
    });
    setDraft(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          disabled={formas.length < 2}
          onClick={() => {
            setError("");
            setDraft({
              origem_id: formas[0]?.id ?? "",
              destino_id: formas[1]?.id ?? "",
              valor: "",
              data: todayISO(),
            });
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          {t("novaTransferencia")}
        </Button>
      </div>

      <div className="glass overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="p-4 font-semibold">{t("data")}</th>
              <th className="p-4 font-semibold">{t("origem")}</th>
              <th className="p-4 font-semibold">{t("destino")}</th>
              <th className="p-4 text-right font-semibold">{t("valor")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(data?.transferencias ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  {t("nenhumLancamento")}
                </td>
              </tr>
            )}
            {(data?.transferencias ?? []).map((tr) => (
              <tr key={tr.id} className="border-b border-border/50">
                <td className="p-4 text-muted-foreground">{date(tr.data)}</td>
                <td className="p-4">{formas.find((f) => f.id === tr.origem_id)?.nome ?? "—"}</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-2">
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    {formas.find((f) => f.id === tr.destino_id)?.nome ?? "—"}
                  </span>
                </td>
                <td className="p-4 text-right font-bold text-info">{money(Number(tr.valor))}</td>
                <td className="p-4 text-right">
                  <button
                    className="p-1 text-muted-foreground hover:text-destructive"
                    onClick={() => remove.mutate({ table: "transferencias", id: tr.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("novaTransferencia")}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="flex flex-col gap-3">
              <div className="grid gap-1.5">
                <Label>{t("origem")}</Label>
                <select
                  value={draft.origem_id}
                  onChange={(e) => setDraft({ ...draft, origem_id: e.target.value })}
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
                <Label>{t("destino")}</Label>
                <select
                  value={draft.destino_id}
                  onChange={(e) => setDraft({ ...draft, destino_id: e.target.value })}
                  className="h-10 rounded-lg border border-input bg-popover px-3 text-sm"
                >
                  {formas.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome}
                    </option>
                  ))}
                </select>
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
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDraft(null)}>
              {t("cancelar")}
            </Button>
            <Button onClick={save}>{t("transferir")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
