/* ============================================================
   NINNA · stato condiviso e utilita'
   Un solo oggetto S tiene tutto lo stato dell'interfaccia: le viste
   lo leggono, le azioni (app.js) lo scrivono. Nessuna variabile di
   stato sparsa nei moduli.
   ============================================================ */
import { I18N } from "./i18n.js";
import { loadStore, saveStore } from "./content-store.js";

const store = loadStore();

export const S = {
  store,
  lang: store.prefs.lang === "en" ? "en" : "it",
  theme: store.prefs.theme || "auto",
  logOnly: store.prefs.logOnly === true,

  tab: "oggi",            // oggi | stat | suoni | timer | bimbo
  layers: [],             // pile di pagine, fogli e modalita' notte: vedi router in app.js

  // stato locale delle viste (mai salvato)
  ui: {
    showWhy: false,
    showPressureInfo: false,
    showManual: false,
    showTimerCustom: false,
    openArticle: null,
    nightLastSound: null,
    docsUnlocked: false,
    docsCache: {},
    sleepTimerMin: 0,
    ackedDoses: {},       // { nome: orario_dovuto_gia_visto }
  },
};

export function persist() { return saveStore(S.store); }

/* ---------- i18n ---------- */
export const t = (k, params) => {
  let s = I18N[S.lang].ui[k] ?? k;
  if (params) for (const [key, v] of Object.entries(params)) s = s.replaceAll(`{${key}}`, v);
  return s;
};
export const LOCALE = () => (S.lang === "it" ? "it-IT" : "en-US");
export const typeLabel = (type) => t("type_" + type);

/* ---------- utilita' ---------- */
export const uid = () => Math.random().toString(36).slice(2, 10);
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
/* argomento sicuro per un gestore inline: JSON dentro un attributo con apici doppi */
export const arg = (v) => esc(JSON.stringify(v));

export const fmtHM = (ts) => new Date(ts).toLocaleTimeString(LOCALE(), { hour: "2-digit", minute: "2-digit" });
// Math.max(0, ...): un orologio spostato non deve produrre durate negative
export const fmtDur = (ms) => {
  const m = Math.max(0, Math.round(ms / 60000)), h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${String(m % 60).padStart(2, "0")}m` : `${m} min`;
};
export const fmtMS = (ms) => {
  const sec = Math.max(0, Math.ceil(ms / 1000));
  return String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0");
};
export const fmtDate = (iso, opts = {}) => new Date(iso + "T00:00:00").toLocaleDateString(LOCALE(), opts);
export const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
export const isoDay = (ts = Date.now()) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const hmOf = (ts) => {
  const d = new Date(ts);
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
};
// "sveglio da 0 min" sembrava un dato rotto: sotto il minuto, una parola
export const awakeLabel = (ms) => (ms < 60000 ? t("just_woke") : t("awake_for", { dur: fmtDur(ms) }));
export const elapsedLabel = (ms) => (ms < 45000 ? t("just_started") : t("playing_for", { dur: fmtDur(ms) }));

/* ---------- dominio ---------- */
export const SLEEP = ["nap", "night"];
export const INSTANT = ["breast", "bottle", "solid", "diaper", "nightwake", "pump"];
export const HEALTH = ["vitamins", "med"];
export const DOC_TYPES = ["vaccini", "tessera"];

export const activeSleep = () => S.store.events.find((e) => SLEEP.includes(e.type) && !e.end);

/* Promemoria dosi, agganciati al NOME e non all'evento: la registrazione
   piu' recente di un nome vince sempre, anche senza ripetizione. E' cosi'
   che "registra e interrompi" cancella davvero il promemoria. */
export function doseReminders() {
  const byName = new Map();
  for (const e of S.store.events) {
    if (!HEALTH.includes(e.type) || !e.note) continue;
    const prev = byName.get(e.note);
    if (!prev || e.at > prev.at) byName.set(e.note, e);
  }
  return [...byName.entries()]
    .filter(([, e]) => e.repeatH)
    .map(([name, e]) => ({ name, type: e.type, repeatH: e.repeatH, lastAt: e.at, due: e.at + e.repeatH * 3600000 }))
    .sort((a, b) => a.due - b.due);
}

export function growthSummary(g) {
  const parts = [];
  if (g.weight) parts.push(`${g.weight} kg`);
  if (g.height) parts.push(`${g.height} cm`);
  if (g.head) parts.push(`${t("growth_head_short")} ${g.head} cm`);
  return parts.join(" · ");
}

export function ageLabel(weeks) {
  if (weeks < 5) return `${Math.round(weeks * 7)} ${t("u_days")}`;
  const m = Math.floor(weeks / 4.345);
  return `${m} ${t(m === 1 ? "u_month" : "u_months")}`;
}
