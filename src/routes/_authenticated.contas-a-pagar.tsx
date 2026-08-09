import { createFileRoute } from "@tanstack/react-router";
import { EntriesPage } from "@/components/EntriesPage";

export const Route = createFileRoute("/_authenticated/contas-a-pagar")({
  head: () => ({
    meta: [
      { title: "Contas a Pagar — Meu Dinheiro" },
      {
        name: "description",
        content: "Cadastre e acompanhe suas despesas, vencimentos e pagamentos pendentes.",
      },
      { property: "og:title", content: "Contas a Pagar — Meu Dinheiro" },
      { property: "og:description", content: "Controle total das suas despesas e vencimentos." },
    ],
  }),
  component: () => <EntriesPage tipo="pagar" />,
});
