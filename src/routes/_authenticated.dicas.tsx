import { createFileRoute } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/dicas")({
  head: () => ({
    meta: [
      { title: "Dicas de Uso — Meu Dinheiro" },
      {
        name: "description",
        content: "Passo a passo para começar bem: cadastre contas, categorias e lançamentos.",
      },
      { property: "og:title", content: "Dicas de Uso — Meu Dinheiro" },
      { property: "og:description", content: "Como aproveitar melhor o Meu Dinheiro." },
    ],
  }),
  component: DicasPage,
});

function DicasPage() {
  const { t } = useI18n();
  const dicas = [t("dicasTexto1"), t("dicasTexto2"), t("dicasTexto3"), t("dicasTexto4")];

  return (
    <div className="glass max-w-2xl p-6">
      <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-bold">
        <Lightbulb className="h-5 w-5 text-gold" />
        {t("dicasTitulo")}
      </h2>
      <ol className="flex flex-col gap-4">
        {dicas.map((d, i) => (
          <li key={i} className="flex gap-3">
            <span className="gradient-brand flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground">
              {i + 1}
            </span>
            <p className="text-sm leading-relaxed text-muted-foreground">{d}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
