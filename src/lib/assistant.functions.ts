import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  question: z.string().min(1).max(2000),
  langName: z.string().max(60),
  context: z.string().max(20000),
});

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { reply: null as string | null, error: "missing_key" };

    const systemPrompt = `Você é o assistente financeiro dentro do aplicativo "Meu Dinheiro", um app de organização financeira pessoal (livro caixa).
Responda SEMPRE no idioma: ${data.langName}.
Responda SOMENTE com base nos dados financeiros do usuário fornecidos abaixo em JSON, e em orientações de como usar o aplicativo (Contas a Pagar/Receber, Formas de Pagamento, Categorias, Transferências, Previsão de Fluxo de Caixa, Gráficos, Configurações).
Nunca invente valores que não estejam no JSON. Se não houver dado suficiente, diga isso claramente.
Seja direto e breve (poucas frases ou uma lista curta).
FORMATO DE VALORES (obrigatório): escreva todo valor monetário exatamente no mesmo padrão do campo "exemploFormatoMoeda" do JSON (símbolo da moeda, separador de milhar e duas casas decimais, ex.: R$ 5.000,00). Nunca escreva o código da moeda como "BRL 5.000" nem omita os centavos.
Você pode usar Markdown simples (negrito com ** e listas com -).

Dados financeiros atuais do usuário (JSON):
${data.context}`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: data.question },
          ],
        }),
      });
      if (!res.ok) {
        return { reply: null as string | null, error: `status_${res.status}` };
      }
      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const reply = json.choices?.[0]?.message?.content?.trim() ?? null;
      return { reply, error: reply ? null : "empty" };
    } catch {
      return { reply: null as string | null, error: "network" };
    }
  });
