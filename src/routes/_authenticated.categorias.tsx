import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFinanceData, useFinanceMutations } from "@/hooks/useFinance";
import { useI18n } from "@/lib/i18n";
import { PALETTE } from "@/lib/finance";
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

export const Route = createFileRoute("/_authenticated/categorias")({
  head: () => ({
    meta: [
      { title: "Categorias — Meu Dinheiro" },
      {
        name: "description",
        content: "Organize receitas e despesas por categorias coloridas e personalizadas.",
      },
      { property: "og:title", content: "Categorias — Meu Dinheiro" },
      { property: "og:description", content: "Categorias personalizadas de receita e despesa." },
    ],
  }),
  component: CategoriasPage,
});

type Draft = { id?: string; nome: string; cor: string; tipo: "receita" | "despesa" };

function CategoriasPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { data } = useFinanceData(user?.id);
  const { upsert, remove } = useFinanceMutations(user?.id);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");

  async function save() {
    if (!draft?.nome.trim()) return;
    const nome = draft.nome.trim();
    const duplicada = (data?.categorias ?? []).some(
      (c) =>
        c.id !== draft.id &&
        c.tipo === draft.tipo &&
        c.nome.trim().toLocaleLowerCase() === nome.toLocaleLowerCase(),
    );
    if (duplicada) {
      setError(t("categoriaDuplicada"));
      return;
    }
    setError("");
    await upsert.mutateAsync({
      table: "categorias",
      id: draft.id,
      values: { nome, cor: draft.cor, tipo: draft.tipo },
    });
    setDraft(null);
  }

  const groups: Array<{ tipo: "receita" | "despesa"; label: string }> = [
    { tipo: "receita", label: t("receita") },
    { tipo: "despesa", label: t("despesa") },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setError("");
            setDraft({ nome: "", cor: PALETTE[0] as string, tipo: "despesa" });
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          {t("adicionar")}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((g) => (
          <div key={g.tipo} className="glass p-5">
            <h2 className="mb-4 font-display text-base font-bold">{g.label}</h2>
            <div className="flex flex-col gap-2">
              {(data?.categorias ?? []).filter((c) => c.tipo === g.tipo).length === 0 && (
                <p className="text-sm text-muted-foreground">{t("nenhumLancamento")}</p>
              )}
              {(data?.categorias ?? [])
                .filter((c) => c.tipo === g.tipo)
                .map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-xl bg-secondary/40 px-3 py-2.5"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.cor }} />
                      {c.nome}
                    </span>
                    <div className="flex">
                      <button
                        className="p-1 text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          setDraft({ id: c.id, nome: c.nome, cor: c.cor, tipo: c.tipo })
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 text-muted-foreground hover:text-destructive"
                        onClick={() => remove.mutate({ table: "categorias", id: c.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("categoria")}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="flex flex-col gap-3">
              <div className="grid gap-1.5">
                <Label>{t("nome")}</Label>
                <Input value={draft.nome} onChange={(e) => setDraft({ ...draft, nome: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>{t("tipo")}</Label>
                <select
                  value={draft.tipo}
                  onChange={(e) =>
                    setDraft({ ...draft, tipo: e.target.value as "receita" | "despesa" })
                  }
                  className="h-10 rounded-lg border border-input bg-popover px-3 text-sm"
                >
                  <option value="despesa">{t("despesa")}</option>
                  <option value="receita">{t("receita")}</option>
                </select>
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
