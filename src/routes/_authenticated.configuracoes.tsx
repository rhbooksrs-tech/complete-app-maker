import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useFinance";
import { useI18n, LANGS, LANG_LABEL, CURRENCIES } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Meu Dinheiro" },
      {
        name: "description",
        content: "Ajuste seu nome de usuário, idioma, moeda e senha de acesso.",
      },
      { property: "og:title", content: "Configurações — Meu Dinheiro" },
      { property: "og:description", content: "Preferências de idioma, moeda e conta." },
    ],
  }),
  component: ConfigPage,
});

function ConfigPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: profile } = useProfile(user?.id);
  const [username, setUsername] = useState(profile?.username ?? "");
  const [idioma, setIdioma] = useState(profile?.idioma ?? "pt-BR");
  const [moeda, setMoeda] = useState(profile?.moeda ?? "BRL");
  const [novaSenha, setNovaSenha] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function salvar() {
    setMsg("");
    setError("");
    const { error: err } = await supabase
      .from("profiles")
      .update({ username, idioma, moeda })
      .eq("id", user!.id);
    if (err) {
      setError(err.message);
      return;
    }
    await qc.invalidateQueries({ queryKey: ["profile", user?.id] });
    setMsg(t("salvoComSucesso"));
  }

  async function trocarSenha() {
    setMsg("");
    setError("");
    if (novaSenha.length < 6) {
      setError(t("camposObrigatorios"));
      return;
    }
    const { error: err } = await supabase.auth.updateUser({ password: novaSenha });
    if (err) {
      setError(err.message);
      return;
    }
    setNovaSenha("");
    setMsg(t("salvoComSucesso"));
  }

  return (
    <div className="grid max-w-3xl gap-4 lg:grid-cols-2">
      <div className="glass flex flex-col gap-3 p-5">
        <h2 className="font-display text-base font-bold">{t("configuracoes")}</h2>
        <div className="grid gap-1.5">
          <Label>{t("username")}</Label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label>{t("idioma")}</Label>
          <select
            value={idioma}
            onChange={(e) => setIdioma(e.target.value)}
            className="h-10 rounded-lg border border-input bg-popover px-3 text-sm"
          >
            {LANGS.map((l) => (
              <option key={l} value={l}>
                {LANG_LABEL[l]}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label>{t("moeda")}</Label>
          <select
            value={moeda}
            onChange={(e) => setMoeda(e.target.value)}
            className="h-10 rounded-lg border border-input bg-popover px-3 text-sm"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={salvar}>{t("salvarConfiguracoes")}</Button>
      </div>

      <div className="glass flex flex-col gap-3 p-5">
        <h2 className="font-display text-base font-bold">{t("alterarSenha")}</h2>
        <div className="grid gap-1.5">
          <Label>{t("novaSenha")}</Label>
          <Input
            type="password"
            autoComplete="new-password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />
        </div>
        <Button variant="secondary" onClick={trocarSenha}>
          {t("salvar")}
        </Button>
        <p className="text-xs text-muted-foreground">{t("senhaRecuperadaAviso")}</p>
      </div>

      {(msg || error) && (
        <p className={error ? "text-sm text-destructive" : "text-sm text-success"}>
          {error || msg}
        </p>
      )}
    </div>
  );
}
