import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFinanceData, useFinanceMutations } from "@/hooks/useFinance";
import { useI18n } from "@/lib/i18n";
import { computeBalances, PALETTE } from "@/lib/finance";
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

export const Route = createFileRoute("/_authenticated/formas-de-pagamento")({
  head: () => ({
    meta: [
      { title: "Formas de Pagamento — Meu Dinheiro" },
      {
        name: "description",
        content: "Cadastre contas, carteiras e cartões com saldo inicial e acompanhe cada saldo.",
      },
      { property: "og:title", content: "Formas de Pagamento — Meu Dinheiro" },
      { property: "og:description", content: "Contas, carteiras e cartões com saldo atualizado." },
    ],
  }),
  component: FormasPage,
});

type Draft = { id?: string; nome: string; cor: string; saldo_inicial: string };

function FormasPage() {
  const { t, money } = useI18n();
  const { user } = useAuth();
  const { data } = useFinanceData(user?.id);
  const { upsert, remove } = useFinanceMutations(user?.id);
  const [draft, setDraft] = useState<Draft | null>(null);

  const balances = data ? computeBalances(data).perForma : {};

  async function save() {
    if (!draft?.nome) return;
    await upsert.mutateAsync({
      table: "formas_pagamento",
      id: draft.id,
      values: {
        nome: draft.nome,
        cor: draft.cor,
        saldo_inicial: parseFloat(draft.saldo_inicial) || 0,
      },
    });
    setDraft(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          onClick={() =>
            setDraft({ nome: "", cor: PALETTE[0] as string, saldo_inicial: "0" })
          }
        >
          <Plus className="mr-1 h-4 w-4" />
          {t("adicionar")}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(data?.formas ?? []).map((f) => (
          <div key={f.id} className="glass glass-hover p-5">
            <div className="flex items-start justify-between">
              <span className="flex items-center gap-2 font-semibold">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: f.cor }} />
                {f.nome}
              </span>
              <div className="flex">
                <button
                  className="p-1 text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    setDraft({
                      id: f.id,
                      nome: f.nome,
                      cor: f.cor,
                      saldo_inicial: String(f.saldo_inicial),
                    })
                  }
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  className="p-1 text-muted-foreground hover:text-destructive"
                  onClick={() => remove.mutate({ table: "formas_pagamento", id: f.id })}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{t("saldoTotal")}</p>
            <p className="font-display text-xl font-extrabold text-gold">
              {money(balances[f.id] ?? 0)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("saldoInicial")}: {money(Number(f.saldo_inicial))}
            </p>
          </div>
        ))}
      </div>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("formaPagamento")}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="flex flex-col gap-3">
              <div className="grid gap-1.5">
                <Label>{t("nome")}</Label>
                <Input value={draft.nome} onChange={(e) => setDraft({ ...draft, nome: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>{t("saldoInicial")}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={draft.saldo_inicial}
                  onChange={(e) => setDraft({ ...draft, saldo_inicial: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>{t("cor")}</Label>
                <div className="flex flex-wrap gap-2">
                  {PALETTE.map((c) => (
                    <button
                      key={c}
                      onClick={() => setDraft({ ...draft, cor: c })}
                      style={{ backgroundColor: c }}
                      className={
                        "h-7 w-7 rounded-full ring-offset-2 ring-offset-popover " +
                        (draft.cor === c ? "ring-2 ring-ring" : "")
                      }
                    />
                  ))}
                </div>
              </div>
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
