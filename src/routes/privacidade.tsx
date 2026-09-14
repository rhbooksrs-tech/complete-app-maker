import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Meu Dinheiro" },
      {
        name: "description",
        content:
          "Como o Meu Dinheiro coleta, usa, protege e exclui os dados pessoais e financeiros do usuário, conforme a LGPD.",
      },
      { property: "og:title", content: "Política de Privacidade — Meu Dinheiro" },
      {
        property: "og:description",
        content: "Tratamento de dados pessoais e financeiros no Meu Dinheiro, conforme a LGPD.",
      },
      { property: "og:url", content: "https://complete-app-maker.lovable.app/privacidade" },
    ],
    links: [{ rel: "canonical", href: "https://complete-app-maker.lovable.app/privacidade" }],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-extrabold">Política de Privacidade</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última atualização: setembro de 2026.</p>

      <section className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <div>
          <h2 className="text-base font-bold text-foreground">1. Dados coletados</h2>
          <p>
            Coletamos o e-mail e o nome de usuário informados no cadastro, além dos lançamentos
            financeiros, categorias, formas de pagamento e preferências (idioma e moeda) que o
            usuário cria dentro do aplicativo.
          </p>
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">2. Finalidade</h2>
          <p>
            Os dados são usados exclusivamente para operar o serviço: autenticar o acesso, exibir
            painéis, gerar relatórios e enviar avisos de vencimento.
          </p>
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">3. Compartilhamento</h2>
          <p>
            Não vendemos dados pessoais. As informações ficam armazenadas em nossa infraestrutura de
            banco de dados e autenticação, com acesso restrito ao próprio usuário. Quando o
            assistente de inteligência artificial é utilizado, o resumo financeiro necessário à
            resposta é enviado ao provedor do modelo apenas para gerar aquela resposta.
          </p>
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">4. Segurança</h2>
          <p>
            O acesso aos dados é protegido por autenticação e por regras de segurança no banco de
            dados que isolam os registros de cada usuário.
          </p>
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">5. Seus direitos (LGPD)</h2>
          <p>
            O usuário pode acessar, corrigir, exportar e excluir seus dados a qualquer momento,
            diretamente no aplicativo ou solicitando pelo suporte. A exclusão da conta remove os
            dados financeiros associados.
          </p>
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">6. Contato</h2>
          <p>
            Pedidos relacionados a dados pessoais podem ser feitos pelo canal de suporte informado
            no aplicativo.
          </p>
        </div>
      </section>

      <div className="mt-10 flex gap-4 text-sm">
        <Link to="/auth" className="text-gold underline">
          Voltar ao login
        </Link>
        <Link to="/termos" className="text-muted-foreground underline">
          Termos de Uso
        </Link>
      </div>
    </div>
  );
}
