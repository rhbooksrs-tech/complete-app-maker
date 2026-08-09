import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Send, X } from "lucide-react";
import { askAssistant } from "@/lib/assistant.functions";
import { buildFinanceContext, type FinanceData } from "@/lib/finance";
import { useI18n, LANG_LABEL } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; text: string };

export function AiChat({ data }: { data: FinanceData }) {
  const { t, lang, currency } = useI18n();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const ask = useServerFn(askAssistant);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setValue("");
    setLoading(true);
    try {
      const res = await ask({
        data: {
          question: text,
          langName: LANG_LABEL[lang] ?? "Português (BR)",
          context: JSON.stringify(buildFinanceContext(data, currency)),
        },
      });
      setMessages((m) => [...m, { role: "assistant", text: res.reply ?? t("chatErro") }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: t("chatErro") }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t("assistenteIA")}
        className="gradient-brand fixed bottom-6 right-6 z-60 flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold/50 text-primary-foreground shadow-glow transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      {open && (
        <div className="glass fixed bottom-24 right-6 z-60 flex h-[min(520px,70vh)] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden shadow-panel">
          <div className="gradient-brand flex items-center gap-2 border-b border-border px-4 py-3">
            <Bot className="h-5 w-5 text-primary-foreground" />
            <span className="flex-1 text-sm font-bold text-primary-foreground">
              {t("assistenteIA")}
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-3.5">
            {messages.length === 0 && (
              <div className="max-w-[85%] self-start rounded-2xl rounded-bl-sm border border-gold/30 bg-gold/10 px-3 py-2.5 text-[13.5px] leading-relaxed text-foreground">
                {t("chatBoasVindas")}
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2.5 text-[13.5px] leading-relaxed",
                  m.role === "user"
                    ? "gradient-brand self-end rounded-br-sm text-primary-foreground"
                    : "self-start rounded-bl-sm border border-gold/30 bg-gold/10 text-foreground",
                )}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="self-start px-3 py-2.5 text-xs text-muted-foreground">
                {t("chatPensando")}
              </div>
            )}
          </div>

          {messages.length === 0 && (
            <div className="flex flex-wrap gap-1.5 px-3.5 pb-2.5">
              {["chatSugestao1", "chatSugestao2", "chatSugestao3"].map((k) => (
                <button
                  key={k}
                  onClick={() => send(t(k))}
                  className="rounded-full border border-border bg-secondary/60 px-2.5 py-1.5 text-[11.5px] text-muted-foreground hover:text-foreground"
                >
                  {t(k)}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(value);
            }}
            className="flex gap-2 border-t border-border p-3"
          >
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t("chatPlaceholder")}
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={loading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
