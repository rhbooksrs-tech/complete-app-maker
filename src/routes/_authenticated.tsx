import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFinanceData, useProfile } from "@/hooks/useFinance";
import { I18nProvider } from "@/lib/i18n";
import { AppShell } from "@/components/AppShell";
import { AiChat } from "@/components/AiChat";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: profile } = useProfile(user?.id);
  const { data: finance } = useFinanceData(user?.id);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user || !profile) {
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
