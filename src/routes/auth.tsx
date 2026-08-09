import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { translate, LANGS, LANG_LABEL } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Meu Dinheiro" },
      {
        name: "description",
        content:
          "Acesse sua conta do Meu Dinheiro e controle receitas, despesas e fluxo de caixa em um só lugar.",
      },
      { property: "og:title", content: "Entrar — Meu Dinheiro" },
      {
        property: "og:description",
        content: "Acesse sua conta e saiba para onde vai e de onde vem o seu dinheiro.",
      },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "register" | "recover";

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [lang, setLang] = useState("pt-BR");
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const t = (k: string) => translate(k, lang);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [loading, user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMsg("");
    setBusy(true);
    try {
      if (mode === "recover") {
        if (!email) throw new Error(t("camposObrigatorios"));
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/configuracoes`,
        });
        if (err) throw err;
        setMsg(t("emailEnviado"));
      } else if (mode === "register") {
        if (!email || !password) throw new Error(t("camposObrigatorios"));
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { username: username || email.split("@")[0] },
          },
        });
        if (err) throw err;
        setMsg(t("contaCriada"));
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw new Error(t("usuarioOuSenhaInvalidos"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(String(result.error));
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="gradient-brand mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-glow">
            💰
          </div>
          <h1 className="font-display text-3xl font-extrabold text-gradient-brand">
            {t("appName")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("tagline")}</p>
        </div>

        <form onSubmit={submit} className="glass flex flex-col gap-3 p-6">
          <div className="grid gap-1.5">
            <Label>{t("email")}</Label>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {mode !== "recover" && (
            <div className="grid gap-1.5">
              <Label>{t("password")}</Label>
              <Input
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          {mode === "register" && (
            <div className="grid gap-1.5">
              <Label>{t("username")}</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-destructive/15 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {msg && (
            <p className="rounded-lg bg-success/15 px-3 py-2 text-sm text-success">{msg}</p>
          )}

          <Button type="submit" disabled={busy} className="w-full">
            {mode === "login" ? t("login") : mode === "register" ? t("register") : t("forgotPassword")}
          </Button>

          {mode !== "recover" && (
            <Button type="button" variant="secondary" className="w-full" onClick={google}>
              {t("entrarComGoogle")}
            </Button>
          )}

          <div className="flex items-center justify-between pt-1 text-xs">
            {mode === "login" ? (
              <button
                type="button"
                onClick={() => setMode("recover")}
                className="text-muted-foreground underline"
              >
                {t("forgotPassword")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-muted-foreground underline"
              >
                {t("login")}
              </button>
            )}
            <button
              type="button"
              onClick={() => setMode(mode === "register" ? "login" : "register")}
              className="font-semibold text-gold underline"
            >
              {mode === "register" ? t("haveAccount") : t("noAccount")}
            </button>
          </div>

          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="mt-2 h-9 rounded-lg border border-input bg-popover px-2 text-xs text-muted-foreground"
          >
            {LANGS.map((l) => (
              <option key={l} value={l}>
                {LANG_LABEL[l]}
              </option>
            ))}
          </select>
        </form>
      </div>
    </div>
  );
}
