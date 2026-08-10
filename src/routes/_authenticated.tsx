import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useFinanceData, useProfile } from "@/hooks/useFinance";
import { I18nProvider } from "@/lib/i18n";
import { AppShell } from "@/components/AppShell";
import { AiChat } from "@/components/AiChat";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user } = useAuth();
  const { data: profile, error: profileError } = useProfile(user?.id);
  const { data: finance } = useFinanceData(user?.id);

  if (profileError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar seu perfil. Tente novamente.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Recarregar
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }


  return (
    <I18nProvider lang={profile.idioma} currency={profile.moeda}>
      <AppShell username={profile.username}>
        <Outlet />
      </AppShell>
      {finance && <AiChat data={finance} />}
    </I18nProvider>
  );
}
