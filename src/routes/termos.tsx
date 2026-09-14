import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Meu Dinheiro" },
      {
        name: "description",
        content:
          "Condições de uso do Meu Dinheiro: responsabilidades, conta de acesso, disponibilidade e contato.",
      },
      { property: "og:title", content: "Termos de Uso — Meu Dinheiro" },
      {
        property: "og:description",
        content: "Condições de uso do aplicativo de controle financeiro Meu Dinheiro.",
      },
      { property: "og:url", content: "https://complete-app-maker.lovable.app/termos" },
    ],
    links: [{ rel: "canonical", href: "https://complete-app-maker.lovable.app/termos" }],
  }),
  component: TermosPage,
});

function TermosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-extrabold">Termos de Uso</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última atualização: setembro de 2026.</p>

      <section className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <div>
          <h2 className="text-base font-bold text-foreground">1. Sobre o serviço</h2>
          <p>
            O Meu Dinheiro é um aplicativo de organização financeira pessoal. Ele registra e exibe
            informações lançadas pelo próprio usuário e não constitui aconselhamento financeiro,
            contábil ou de investimentos.
          </p>
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">2. Conta de acesso</h2>
          <p>
            O acesso exige e-mail válido e senha pessoal. O usuário é responsável por manter suas
            credenciais em sigilo e por toda atividade realizada em sua conta.
          </p>
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">3. Uso adequado</h2>
          <p>
            É proibido utilizar o serviço para fins ilícitos, tentar acessar dados de outros
            usuários ou interferir no funcionamento da plataforma.
          </p>
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">4. Disponibilidade</h2>
          <p>
            Buscamos manter o serviço disponível de forma contínua, mas podem ocorrer interrupções
            para manutenção ou por fatores externos. Recomendamos manter cópias próprias dos dados
            importantes.
          </p>
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">5. Encerramento</h2>
          <p>
            O usuário pode deixar de usar o serviço a qualquer momento e solicitar a exclusão da
            conta e dos dados. Podemos suspender contas que violem estes termos.
          </p>
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">6. Contato</h2>
          <p>
            Dúvidas sobre estes termos podem ser enviadas pelo canal de suporte informado no
            aplicativo.
          </p>
        </div>
      </section>

      <div className="mt-10 flex gap-4 text-sm">
        <Link to="/auth" className="text-gold underline">
          Voltar ao login
        </Link>
        <Link to="/privacidade" className="text-muted-foreground underline">
          Política de Privacidade
        </Link>
      </div>
    </div>
  );
}
