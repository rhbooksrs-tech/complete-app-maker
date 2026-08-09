import { createFileRoute } from "@tanstack/react-router";
import { EntriesPage } from "@/components/EntriesPage";

export const Route = createFileRoute("/_authenticated/contas-a-receber")({
  head: () => ({
    meta: [
      { title: "Contas a Receber — Meu Dinheiro" },
      {
        name: "description",
        content: "Registre receitas previstas, acompanhe recebimentos e o que ainda está pendente.",
      },
      { property: "og:title", content: "Contas a Receber — Meu Dinheiro" },
      { property: "og:description", content: "Acompanhe suas receitas e recebimentos pendentes." },
    ],
  }),
  component: () => <EntriesPage tipo="receber" />,
});
