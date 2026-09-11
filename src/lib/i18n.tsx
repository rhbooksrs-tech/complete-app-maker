import { createContext, useContext, useMemo, type ReactNode } from "react";
import { T as BASE, LANGS, LANG_LABEL, CURRENCIES, type Lang } from "./i18n-data";

export { LANGS, LANG_LABEL, CURRENCIES };
export type { Lang };

const EXTRA: Record<string, Record<string, string>> = {
  entrarComGoogle: {
    "pt-BR": "Entrar com Google",
    es: "Entrar con Google",
    en: "Continue with Google",
    de: "Mit Google anmelden",
    fr: "Continuer avec Google",
    it: "Accedi con Google",
  },
  emailEnviado: {
    "pt-BR": "Enviamos um link de redefinição para o seu e-mail.",
    es: "Enviamos un enlace de restablecimiento a su correo.",
    en: "We sent a reset link to your email.",
    de: "Wir haben einen Link zum Zurücksetzen gesendet.",
    fr: "Nous avons envoyé un lien de réinitialisation.",
    it: "Abbiamo inviato un link di reimpostazione.",
  },
  contaCriada: {
    "pt-BR": "Conta criada! Você já pode usar o app.",
    es: "¡Cuenta creada! Ya puede usar la app.",
    en: "Account created! You can start using the app.",
    de: "Konto erstellt! Sie können loslegen.",
    fr: "Compte créé ! Vous pouvez commencer.",
    it: "Account creato! Puoi iniziare.",
  },
  salvoComSucesso: {
    "pt-BR": "Salvo com sucesso",
    es: "Guardado con éxito",
    en: "Saved successfully",
    de: "Erfolgreich gespeichert",
    fr: "Enregistré avec succès",
    it: "Salvato con successo",
  },
  carregando: {
    "pt-BR": "Carregando...",
    es: "Cargando...",
    en: "Loading...",
    de: "Laden...",
    fr: "Chargement...",
    it: "Caricamento...",
  },
  senhaAtual: {
    "pt-BR": "Senha atual",
    es: "Contraseña actual",
    en: "Current password",
    de: "Aktuelles Passwort",
    fr: "Mot de passe actuel",
    it: "Password attuale",
  },
  senhaAtualIncorreta: {
    "pt-BR": "Senha atual incorreta.",
    es: "Contraseña actual incorrecta.",
    en: "Current password is incorrect.",
    de: "Aktuelles Passwort ist falsch.",
    fr: "Mot de passe actuel incorrect.",
    it: "Password attuale errata.",
  },
  senhaMin6: {
    "pt-BR": "A nova senha deve ter pelo menos 6 caracteres.",
    es: "La nueva contraseña debe tener al menos 6 caracteres.",
    en: "The new password must have at least 6 characters.",
    de: "Das neue Passwort muss mindestens 6 Zeichen haben.",
    fr: "Le nouveau mot de passe doit contenir au moins 6 caractères.",
    it: "La nuova password deve avere almeno 6 caratteri.",
  },
  categoriaDuplicada: {
    "pt-BR": "Já existe uma categoria com esse nome para este tipo.",
    es: "Ya existe una categoría con ese nombre para este tipo.",
    en: "A category with this name already exists for this type.",
    de: "Es gibt bereits eine Kategorie mit diesem Namen für diesen Typ.",
    fr: "Une catégorie portant ce nom existe déjà pour ce type.",
    it: "Esiste già una categoria con questo nome per questo tipo.",
  },
  dicasTexto4: {
    "pt-BR": "Olhe se o seu e-mail cadastrado está correto, pois é pra ele que vamos encaminhar mensagens de recuperação de senha e outras informações quando for necessário.",
    es: "Verifique si su correo registrado es correcto, ya que es a él donde enviaremos mensajes de recuperación de contraseña y otra información cuando sea necesario.",
    en: "Check that your registered email is correct, as that's where we'll send password recovery messages and other information when needed.",
    de: "Prüfen Sie, ob Ihre registrierte E-Mail korrekt ist, denn dorthin senden wir Nachrichten zum Zurücksetzen des Passworts und andere Informationen.",
    fr: "Vérifiez que votre e-mail enregistré est correct, car c'est là que nous enverrons les messages de récupération de mot de passe et d'autres informations.",
    it: "Controlla che la tua e-mail registrata sia corretta, perché è lì che invieremo i messaggi di recupero password e altre informazioni quando necessario.",
  },
  emailConfirmacaoEnviada: {
    "pt-BR": "Enviamos um link de confirmação para o novo e-mail. Confirme para concluir a troca.",
    es: "Enviamos un enlace de confirmación al nuevo correo. Confírmelo para completar el cambio.",
    en: "We sent a confirmation link to the new email. Confirm it to complete the change.",
    de: "Wir haben einen Bestätigungslink an die neue E-Mail gesendet. Bestätigen Sie ihn, um die Änderung abzuschließen.",
    fr: "Nous avons envoyé un lien de confirmation au nouvel e-mail. Confirmez-le pour finaliser le changement.",
    it: "Abbiamo inviato un link di conferma alla nuova e-mail. Confermalo per completare il cambio.",
  },
  emailInvalido: {
    "pt-BR": "Informe um e-mail válido.",
    es: "Ingrese un correo válido.",
    en: "Enter a valid email address.",
    de: "Geben Sie eine gültige E-Mail-Adresse ein.",
    fr: "Saisissez une adresse e-mail valide.",
    it: "Inserisci un indirizzo e-mail valido.",
  },
  periodoPersonalizado: {
    "pt-BR": "Previsão por período",
    es: "Previsión por período",
    en: "Forecast by period",
    de: "Prognose nach Zeitraum",
    fr: "Prévision par période",
    it: "Previsione per periodo",
  },
  dataInicial: {
    "pt-BR": "De",
    es: "Desde",
    en: "From",
    de: "Von",
    fr: "Du",
    it: "Dal",
  },
  dataFinal: {
    "pt-BR": "Até",
    es: "Hasta",
    en: "To",
    de: "Bis",
    fr: "Au",
    it: "Al",
  },
  mesSelecionado: {
    "pt-BR": "Mês",
    es: "Mes",
    en: "Month",
    de: "Monat",
    fr: "Mois",
    it: "Mese",
  },
  resumo: {
    "pt-BR": "Resumo",
    es: "Resumen",
    en: "Overview",
    de: "Übersicht",
    fr: "Résumé",
    it: "Riepilogo",
  },
  listar: {
    "pt-BR": "Listar",
    es: "Listar",
    en: "List",
    de: "Auflisten",
    fr: "Lister",
    it: "Elenca",
  },
  escolherPeriodo: {
    "pt-BR": "Escolher período",
    es: "Elegir período",
    en: "Choose period",
    de: "Zeitraum wählen",
    fr: "Choisir la période",
    it: "Scegli periodo",
  },
  escolherMes: {
    "pt-BR": "Escolher mês",
    es: "Elegir mes",
    en: "Choose month",
    de: "Monat wählen",
    fr: "Choisir le mois",
    it: "Scegli mese",
  },
};

const DICT: Record<string, Record<string, string>> = { ...BASE, ...EXTRA };

export function translate(key: string, lang: string) {
  const entry = DICT[key];
  if (!entry) return key;
  return entry[lang] || entry["en"] || key;
}

export function fmtMoney(v: number, currency: string, lang: string) {
  try {
    return new Intl.NumberFormat(lang, { style: "currency", currency: currency || "BRL" }).format(
      v || 0,
    );
  } catch {
    return `${(v || 0).toFixed(2)} ${currency}`;
  }
}

export function fmtDate(iso: string, lang: string) {
  try {
    return new Intl.DateTimeFormat(lang).format(new Date(`${iso}T00:00:00`));
  } catch {
    return iso;
  }
}

type I18nValue = {
  lang: string;
  currency: string;
  t: (key: string) => string;
  money: (v: number) => string;
  date: (iso: string) => string;
};

const I18nContext = createContext<I18nValue>({
  lang: "pt-BR",
  currency: "BRL",
  t: (k) => translate(k, "pt-BR"),
  money: (v) => fmtMoney(v, "BRL", "pt-BR"),
  date: (d) => fmtDate(d, "pt-BR"),
});

export function I18nProvider({
  lang,
  currency,
  children,
}: {
  lang: string;
  currency: string;
  children: ReactNode;
}) {
  const value = useMemo<I18nValue>(
    () => ({
      lang,
      currency,
      t: (key: string) => translate(key, lang),
      money: (v: number) => fmtMoney(v, currency, lang),
      date: (iso: string) => fmtDate(iso, lang),
    }),
    [lang, currency],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
