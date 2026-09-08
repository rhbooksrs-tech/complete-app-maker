import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Categoria, FinanceData, Forma, Lancamento, Transferencia } from "@/lib/finance";

export type Profile = {
  id: string;
  username: string;
  idioma: string;
  moeda: string;
};

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, idioma, moeda")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      if (data) return data as Profile;
      const { data: created, error: insErr } = await supabase
        .from("profiles")
        .insert({ id: userId! })
        .select("id, username, idioma, moeda")
        .single();
      if (insErr) throw insErr;
      return created as Profile;
    },
  });
}

export function useFinanceData(userId: string | undefined) {
  return useQuery({
    queryKey: ["finance", userId],
    enabled: !!userId,
    staleTime: 0,
    refetchOnMount: "always",
    queryFn: async (): Promise<FinanceData> => {
      const [cat, formas, lanc, transf] = await Promise.all([
        supabase.from("categorias").select("*").order("created_at"),
        supabase.from("formas_pagamento").select("*").order("created_at"),
        supabase.from("lancamentos").select("*").order("data", { ascending: false }),
        supabase.from("transferencias").select("*").order("data", { ascending: false }),
      ]);
      const err = cat.error || formas.error || lanc.error || transf.error;
      if (err) throw err;
      return {
        categorias: (cat.data ?? []) as Categoria[],
        formas: (formas.data ?? []) as Forma[],
        lancamentos: (lanc.data ?? []) as Lancamento[],
        transferencias: (transf.data ?? []) as Transferencia[],
      };
    },
  });
}

type TableName = "categorias" | "formas_pagamento" | "lancamentos" | "transferencias";

export function useFinanceMutations(userId: string | undefined) {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["finance", userId], refetchType: "all" });

  const upsert = useMutation({
    mutationFn: async ({
      table,
      values,
      id,
    }: {
      table: TableName;
      values: Record<string, unknown>;
      id?: string | undefined;
    }) => {
      const client = supabase.from(table) as unknown as {
        update: (v: Record<string, unknown>) => {
          eq: (c: string, v: string) => Promise<{ error: unknown }>;
        };
        insert: (v: Record<string, unknown>) => Promise<{ error: unknown }>;
      };
      if (id) {
        const { error } = await client.update(values).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await client.insert({ ...values, user_id: userId ?? "" });
        if (error) throw error;
      }

    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async ({ table, id }: { table: TableName; id: string }) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { upsert, remove };
}
