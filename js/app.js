/* ============================================================
   NINNA · app.js
   Regia: navigazione, azioni, ridisegno. Le viste stanno nei moduli
   views-*.js, lo stato in state.js, il timer in timer.js.

   NAVIGAZIONE
   Sopra le cinque schede si impilano dei "livelli": pagine a tutto
   schermo, fogli dal basso, modalita' notte. Ogni livello aperto
   aggiunge una voce alla cronologia del browser, cosi' il tasto
   indietro di Android chiude il livello in cima invece di uscire
   dall'app. Tutte le chiusure passano dalla cronologia (popstate):
   una sola strada, nessuno stato che possa andare fuori sincrono.
   ============================================================ */
import { forecast, ageWeeks } from "./engine.js";
import { SoundEngine } from "./sounds.js";
import { exportCSV, exportJSON, importJSON } from "./content-store.js";
import { saveDoc, loadDoc, deleteDoc, deleteAllDocs, compressImage } from "./docs-store.js";
import {
  S, persist, t, esc, uid, typeLabel, fmtDur, fmtMS, isoDay, ageLabel,
  INSTANT, HEALTH, DOC_TYPES, activeSleep, doseReminders,
} from "./state.js";
import { TAB_ICONS, TYPE_ICONS, ICON, STOP } from "./icons.js";
import { renderOggi, renderStat, renderSuoni, renderTimer, renderBimbo, renderOnboarding, TM_C } from "./views-tabs.js";
import { PAGES } from "./views-pages.js";
import { SHEETS } from "./views-sheets.js";
import { renderNight } from "./views-night.js";
import { T, startTimer, stopTimer, resumeTimer, timerVisible, timerHooks, timerLeft } from "./timer.js";

S.sound = new SoundEngine();

const $app = document.getElementById("app");
const $bottom = document.getElementById("bottom");
const $dock = document.getElementById("dock");
const $tabbar = document.getElementById("tabbar");
const $layers = document.getElementById("layers");
const $toast = document.getElementById("toast");

/* ============================ LIVELLI ============================ */

const top = () => S.layers[S.layers.length - 1] || null;
const hasNight = () => S.layers.some((l) => l.kind === "night");
const topPage = () => [...S.layers].reverse().find((l) => l.kind === "page") || null;

/* effetti collaterali di un livello che si chiude */
function onLeave(layer) {
  if (layer.kind === "page" && layer.id === "docs") { S.ui.docsUnlocked = false; S.ui.docsCache = {}; }
  if (layer.kind === "page" && layer.id === "profile") S.ui.pendingSex = undefined;
  if (layer.kind === "page" && layer.id === "guide") S.ui.openArticle = null;
  if (layer.kind === "night") S.ui.nightLastSound = null;
}

function push(layer) {
  if (navPending) { navQueue.push(() => push(layer)); return; }
  S.layers.push(layer);
  history.pushState({ d: S.layers.length }, "");
  renderAll();
  focusFirstField();
}

function replaceTop(layer) {
  if (!S.layers.length) return push(layer);
  onLeave(S.layers[S.layers.length - 1]);
  S.layers[S.layers.length - 1] = layer;
  history.replaceState({ d: S.layers.length }, "");
  renderAll();
}

function trimTo(depth) {
  while (S.layers.length > depth) onLeave(S.layers.pop());
}

/* Chiusura dall'interno dell'app (X, indietro, salvataggio): il livello
   si toglie subito, poi la cronologia viene riallineata. Il popstate che
   ne deriva e' atteso e viene ignorato. Un'apertura richiesta mentre la
   cronologia si sta ancora riallineando aspetta il suo turno, altrimenti
   le due operazioni si scavalcherebbero. */
let navPending = 0, navQueue = [], navGuard = null;
function goBack(n = 1) {
  n = Math.min(n, S.layers.length);
  if (n <= 0) return;
  trimTo(S.layers.length - n);
  renderAll();
  navPending++;
  history.go(-n);
  clearTimeout(navGuard);
  navGuard = setTimeout(() => { if (navPending) { navPending = 0; flushNav(); } }, 700);
}
function flushNav() { const q = navQueue; navQueue = []; q.forEach((fn) => fn()); }

window.addEventListener("popstate", (e) => {
  if (navPending > 0) { if (--navPending === 0) { clearTimeout(navGuard); flushNav(); } return; }
  // tasto indietro del telefono o del browser
  const d = e.state && typeof e.state.d === "number" ? e.state.d : 0;
  if (d < S.layers.length) { trimTo(d); renderAll(); }
  else if (d > S.layers.length) history.replaceState({ d: S.layers.length }, "");  // "avanti": ignorato
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && S.layers.length) goBack();
});

function focusFirstField() {
  const l = top();
  if (!l || l.kind !== "sheet") return;
  const el = $layers.querySelector(".sheet input:not([type=hidden]):not([type=date]):not([type=time]), .sheet .pin");
  if (el && !["edit", "growth"].includes(l.id)) el.focus();
}

/* ============================ AVVISI ============================ */

function toast(msg, undo) {
  $toast.innerHTML = `<span>${esc(msg)}</span>${undo ? `<button class="toast-undo" onclick="NINNA.undo()">${t("undo")}</button>` : ""}`;
  $toast.hidden = false;
  $toast.classList.toggle("night", hasNight());
  toast.undo = undo || null;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { $toast.hidden = true; toast.undo = null; }, undo ? 5000 : 2200);
}

/* ========================= NOTIFICHE ========================= */

let notifTimeouts = [];
const notifText = (id, extra) => id === "pre-nap"
  ? { title: t("n_nap_t", { name: S.store.baby ? S.store.baby.name : "" }), body: t("n_nap_b") }
  : id === "pre-bed" ? { title: t("n_bed_t"), body: t("n_bed_b") }
  : { title: t("n_dose_t", { name: extra }), body: t("n_dose_b") };

async function showNotif(title, body) {
  try {
    const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : null;
    if (reg) reg.showNotification(title, { body, icon: "icons/icon-192.png", badge: "icons/icon-192.png", tag: "ninna" });
    else if ("Notification" in window) new Notification(title, { body, icon: "icons/icon-192.png" });
  } catch (e) { console.warn("notifica fallita", e); }
}

function scheduleNotifications(plan) {
  notifTimeouts.forEach(clearTimeout); notifTimeouts = [];
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const now = Date.now();
  plan.filter((n) => n.at > now && n.at - now < 12 * 3600000).forEach((n) => {
    notifTimeouts.push(setTimeout(() => { const m = notifText(n.id, n.name); showNotif(m.title, m.body); }, n.at - now));
  });
}

/* ============================ TEMA ============================ */

function applyTheme() {
  const root = document.documentElement;
  root.classList.remove("theme-light", "theme-dark");
  if (S.theme === "light") root.classList.add("theme-light");
  else if (S.theme === "dark") root.classList.add("theme-dark");
  const meta = document.querySelector('meta[name="theme-color"]');
  const bg = getComputedStyle(root).getPropertyValue("--bg").trim();
  if (meta && bg) meta.setAttribute("content", bg);
}
if (window.matchMedia) {
  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => { if (S.theme === "auto") applyTheme(); });
}

/* ============================ RENDER ============================ */

let lastForecast = null;
const getForecast = () => (lastForecast = forecast({ birthISO: S.store.baby.birth, events: S.store.events }));

function headerHTML() {
  const b = S.store.baby;
  const titles = { stat: t("tab_stat"), suoni: t("sounds_title"), timer: t("tab_timer") };
  return `<header class="topbar">
      <div class="wordmark">Ninna<span class="wm-dot">.</span></div>
      <div class="topbar-actions">
        ${S.tab === "oggi" ? `<button class="nightbtn" onclick="NINNA.openNight()">${TYPE_ICONS.night}<span>${t("night_btn")}</span></button>` : ""}
        <button class="iconbtn" onclick="NINNA.openPage('settings')" aria-label="${t("settings")}">${ICON.settings}</button>
      </div>
    </header>
    ${S.tab === "oggi"
      ? `<button class="babyline" onclick="NINNA.openPage('profile')" aria-label="${t("profile_title")}">
          <span class="babyname">${esc(b.name)}</span><span class="agechip">${ageLabel(ageWeeks(b.birth))}</span><span class="babyedit">${ICON.edit}</span>
        </button>`
      : titles[S.tab] ? `<h1 class="tabtitle">${titles[S.tab]}</h1>` : ""}`;
}

function renderMain() {
  if (!S.store.baby) { $app.innerHTML = renderOnboarding(); return; }
  if (S.logOnly && S.tab === "stat") S.tab = "oggi";
  const f = getForecast();
  scheduleNotifications([
    ...f.notifications,
    ...doseReminders().map((d) => ({ id: "dose:" + d.name, at: d.due, name: d.name })),
  ]);
  const body = { oggi: renderOggi, stat: renderStat, suoni: renderSuoni, timer: renderTimer, bimbo: renderBimbo }[S.tab](f);
  $app.innerHTML = `<div class="tab-${S.tab}">${headerHTML()}${body}</div>`;
}

function tabsHTML() {
  const name = S.store.baby.name;
  const tabs = [["oggi", t("tab_oggi")], ...(S.logOnly ? [] : [["stat", t("tab_stat_short")]]),
    ["suoni", t("tab_suoni")], ["timer", t("tab_timer")], ["bimbo", esc(name)]];
  return tabs.map(([id, lbl]) => `<button class="tab ${S.tab === id ? "on" : ""}" onclick="NINNA.setTab('${id}')" aria-current="${S.tab === id ? "page" : "false"}">
      <span class="tab-ico">${TAB_ICONS[id]}</span><span class="tab-lbl">${lbl}</span>
    </button>`).join("");
}

const DOCK_R = 15, DOCK_C = 2 * Math.PI * DOCK_R;
function dockHTML() {
  const onPage = !!topPage();
  const parts = [];
  if (T.run && (S.tab !== "timer" || onPage)) {
    const left = timerLeft(), frac = T.done ? 1 : 1 - left / T.run.total;
    parts.push(`<button class="dock-item dock-timer ${T.done ? "done" : ""}" onclick="NINNA.dockTimer()" aria-label="${t("tab_timer")}">
      <svg class="dock-ring" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="${DOCK_R}" class="dr-track"/>
        <circle id="dock-ring" cx="18" cy="18" r="${DOCK_R}" class="dr-prog" style="stroke-dasharray:${DOCK_C.toFixed(2)};stroke-dashoffset:${(DOCK_C * (1 - frac)).toFixed(2)}"/></svg>
      <span class="dock-txt"><span class="dock-k">${T.done ? t("timer_done") : t("tab_timer")}</span><span class="dock-v" id="dock-tm">${T.done ? t("timer_ok_tap") : fmtMS(left)}</span></span>
    </button>`);
  }
  if (S.sound.playing && (S.tab !== "suoni" || onPage)) {
    parts.push(`<div class="dock-item dock-sound">
      <button class="dock-main" onclick="NINNA.dockSound()">
        <span class="dock-eq" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="dock-txt"><span class="dock-k">${t("now_playing")}</span><span class="dock-v">${t("sound_" + S.sound.playing)}</span></span>
      </button>
      <button class="dock-stop" onclick="NINNA.stopSound()" aria-label="${t("mp_stop")}">${STOP}</button>
    </div>`);
  }
  return parts.length ? `<div class="dock ${parts.length > 1 ? "two" : ""}">${parts.join("")}</div>` : "";
}

function renderBottom() {
  const off = !S.store.baby || hasNight();
  $bottom.hidden = off;
  if (!off) {
    $bottom.classList.toggle("over-page", !!topPage());
    const d = dockHTML();
    if ($dock.innerHTML !== d) $dock.innerHTML = d;
    const tb = tabsHTML();
    if ($tabbar.innerHTML !== tb) $tabbar.innerHTML = tb;
  }
  measureBottom();
}

/* Lo spazio occupato in basso viene misurato, non indovinato: tutte le
   schermate riservano esattamente quell'altezza, quindi nulla puo' finire
   coperto dalla barra o dal riquadro "in corso", a qualunque larghezza. */
function measureBottom() {
  const h = $bottom.hidden ? 0 : Math.max(0, Math.ceil(window.innerHeight - $bottom.getBoundingClientRect().top));
  document.documentElement.style.setProperty("--bottom-h", h + "px");
}
if ("ResizeObserver" in window) new ResizeObserver(measureBottom).observe($bottom);
window.addEventListener("resize", measureBottom);

function renderLayers() {
  if (!S.store.baby) { trimTo(0); $layers.innerHTML = ""; document.documentElement.classList.remove("locked"); return; }
  const l = top();
  let html = "";
  if (hasNight()) {
    const nightTop = [...S.layers].reverse().find((x) => x.kind === "night" || x.kind === "nightpicker");
    html = renderNight(lastForecast || getForecast(), nightTop.kind === "nightpicker");
    if (l && l.kind === "sheet") html += SHEETS[l.id](l.p || {});
  } else {
    const p = topPage();
    // la pagina in cima mantiene lo scorrimento quando si ridisegna
    const prev = p && $layers.querySelector(`.page[data-page="${p.id}"]`);
    const scroll = prev ? prev.scrollTop : 0;
    if (p) html += PAGES[p.id](p.p || {});
    if (l && l.kind === "sheet") html += SHEETS[l.id](l.p || {});
    $layers.innerHTML = html;
    if (prev) { const now = $layers.querySelector(`.page[data-page="${p.id}"]`); if (now) now.scrollTop = scroll; }
    document.documentElement.classList.toggle("locked", S.layers.length > 0);
    return;
  }
  $layers.innerHTML = html;
  document.documentElement.classList.toggle("locked", true);
}

function renderAll() {
  document.documentElement.lang = S.lang;
  renderMain();
  renderLayers();
  renderBottom();
}

/* il timer ridisegna solo i numeri ogni secondo, mai l'intera schermata */
timerHooks(
  () => {
    const left = timerLeft();
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set("tm-digits", fmtMS(left)); set("dock-tm", fmtMS(left)); set("night-tm", fmtMS(left));
    const ring = document.getElementById("tm-prog");
    if (ring && T.run) ring.style.strokeDashoffset = (TM_C * (1 - left / T.run.total)).toFixed(2);
    const dr = document.getElementById("dock-ring");
    if (dr && T.run) dr.style.strokeDashoffset = (DOCK_C * (left / T.run.total)).toFixed(2);
  },
  () => {
    if (S.tab === "timer" && !S.layers.length) renderMain();
    if (hasNight()) renderLayers();
    renderBottom();
  },
);

/* ============================ AZIONI ============================ */

function downloadBlob(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

async function loadDocsCache() {
  const c = {};
  for (const ty of DOC_TYPES) { try { c[ty] = await loadDoc(ty); } catch (e) { c[ty] = null; } }
  S.ui.docsCache = c;
}

function closeSheetThen(fn) {
  // chiude il foglio in cima (se c'e') e poi esegue: usato dopo un salvataggio
  if (top() && top().kind === "sheet") goBack();
  if (fn) fn();
}

window.NINNA = {
  /* ---- navigazione ---- */
  setTab(id) {
    if (S.tab === id && !S.layers.length) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    S.tab = id;
    if (S.layers.length) goBack(S.layers.length); else renderAll();
    window.scrollTo(0, 0);
  },
  openPage(id, p) { push({ kind: "page", id, p }); if (id === "docs" && S.ui.docsUnlocked) loadDocsCache().then(renderLayers); },
  openSheet(id, p) { push({ kind: "sheet", id, p }); },
  back() { goBack(1); },
  closeAll() { goBack(S.layers.filter((l) => l.kind === "page" || l.kind === "sheet").length); },
  undo() { if (toast.undo) { toast.undo(); toast.undo = null; $toast.hidden = true; } },

  /* ---- preferenze ---- */
  setLang(l) { S.lang = l === "en" ? "en" : "it"; S.store.prefs.lang = S.lang; persist(); renderAll(); },
  setTheme(v) { S.theme = v; S.store.prefs.theme = v; persist(); applyTheme(); renderLayers(); },
  toggleLogOnly() {
    S.logOnly = !S.logOnly; S.store.prefs.logOnly = S.logOnly; persist();
    toast(S.logOnly ? t("logonly_on") : t("logonly_off"));
    renderAll();
  },
  async enableNotifs() {
    if (!("Notification" in window)) return;
    let ok = Notification.permission === "granted";
    if (Notification.permission === "default") ok = (await Notification.requestPermission()) === "granted";
    toast(ok ? t("notif_on") : t("notif_denied"));
    renderAll();
  },

  /* ---- sonno ---- */
  startSleep(kind) {
    if (activeSleep()) return toast(typeLabel(activeSleep().type) + " · " + t("in_progress"));
    S.store.events.push({ id: uid(), type: kind, start: Date.now(), end: null });
    persist();
    // la prima "Inizia nanna" propone la modalita' notte, una volta sola
    const prompt = kind === "night" && !hasNight() && !S.store.prefs.nightPromptSeen;
    if (prompt) { S.store.prefs.nightPromptSeen = true; persist(); push({ kind: "sheet", id: "nightprompt" }); }
    else { toast(typeLabel(kind) + " · " + t("started")); renderAll(); }
  },
  endSleep(id) {
    const e = S.store.events.find((x) => x.id === id);
    if (e && !e.end) { e.end = Date.now(); persist(); toast(t("logged") + fmtDur(e.end - e.start)); }
    renderAll();
  },
  toggleWhy() { S.ui.showWhy = !S.ui.showWhy; renderMain(); },
  togglePressureInfo() { S.ui.showPressureInfo = !S.ui.showPressureInfo; renderMain(); },
  pickManualKind(btn, kind) {
    const segEl = document.getElementById("m-kind");
    segEl.dataset.v = kind;
    segEl.querySelectorAll(".seg-opt").forEach((b) => b.classList.toggle("on", b === btn));
  },
  addManual() {
    const kind = document.getElementById("m-kind").dataset.v === "night" ? "night" : "nap";
    const s = document.getElementById("m-start").value, e = document.getElementById("m-end").value;
    if (!s || !e) return toast(t("missing_times"));
    const iso = isoDay();
    let sMs = new Date(`${iso}T${s}:00`).getTime(), eMs = new Date(`${iso}T${e}:00`).getTime();
    if (isNaN(sMs) || isNaN(eMs)) return toast(t("invalid_times"));
    if (eMs <= sMs) eMs += 86400000;                                   // oltre la mezzanotte
    if (sMs > Date.now()) { sMs -= 86400000; eMs -= 86400000; }         // "ieri sera" inserito stamattina
    if (eMs > Date.now()) return toast(t("future_date"));
    S.store.events.push({ id: uid(), type: kind, start: sMs, end: eMs });
    persist(); toast(t("added"));
    closeSheetThen(renderMain);
  },

  /* ---- registrazioni ---- */
  logInstant(type) {
    if (HEALTH.includes(type)) return push({ kind: "sheet", id: "health", p: { type } });
    S.store.events.push({ id: uid(), type, at: Date.now() });
    persist(); toast(t("logged_type", { label: typeLabel(type) })); renderAll();
  },
  saveHealth(type, preset) {
    const el = document.getElementById("h-name"), rep = document.getElementById("h-repeat");
    const note = (preset !== undefined ? preset : el ? el.value : "").trim();
    const repeatH = rep && preset === undefined ? parseInt(rep.value, 10) || 0 : 0;
    const ev = { id: uid(), type, at: Date.now() };
    if (note) ev.note = note;
    if (note && repeatH) ev.repeatH = repeatH;
    // scorciatoia dei recenti: ripete l'intervallo dell'ultima volta per quel nome
    if (note && preset !== undefined) {
      const prev = S.store.events.filter((x) => x.type === type && x.note === note).sort((a, b) => b.at - a.at)[0];
      if (prev && prev.repeatH) ev.repeatH = prev.repeatH;
    }
    S.store.events.push(ev);
    persist(); toast(note || t("logged_type", { label: typeLabel(type) }));
    closeSheetThen(renderMain);
  },
  openEdit(id) { push({ kind: "sheet", id: "edit", p: { id } }); },
  saveEdit(id) {
    const e = S.store.events.find((x) => x.id === id);
    if (!e) return;
    const dateStr = (document.getElementById("e-date") || {}).value || null;
    if (dateStr) {
      const end = new Date(); end.setHours(23, 59, 59, 999);
      if (new Date(dateStr + "T00:00:00").getTime() > end.getTime()) return toast(t("future_date"));
    }
    const anchor = (ts, hm) => {
      const [h, m] = hm.split(":").map(Number);
      const d = dateStr ? new Date(dateStr + "T00:00:00") : new Date(ts);
      d.setHours(h, m, 0, 0); return d.getTime();
    };
    if (e.start != null) {
      const sv = document.getElementById("e-start");
      if (!sv || !sv.value) return toast(t("invalid_times"));
      const ns = anchor(e.start, sv.value);
      let ne = e.end;
      if (e.end) {
        const ev = document.getElementById("e-end");
        if (!ev || !ev.value) return toast(t("invalid_times"));
        ne = anchor(e.start, ev.value);
        if (ne <= ns) ne += 86400000;
      }
      if (ns > Date.now() || (ne && ne > Date.now())) return toast(t("future_date"));
      e.start = ns; e.end = ne;
    } else {
      const av = document.getElementById("e-at");
      if (!av || !av.value) return toast(t("invalid_times"));
      const nt = anchor(e.at, av.value);
      if (nt > Date.now()) return toast(t("future_date"));
      e.at = nt;
    }
    const nv = document.getElementById("e-note");
    if (nv) { const n = nv.value.trim(); if (n) e.note = n; else delete e.note; }
    const rv = document.getElementById("e-repeat");
    if (rv) { const h = parseInt(rv.value, 10) || 0; if (h && e.note) e.repeatH = h; else delete e.repeatH; }
    persist(); toast(t("edit_done"));
    closeSheetThen(renderMain);
  },
  deleteEvent(id) {
    const i = S.store.events.findIndex((x) => x.id === id);
    if (i < 0) return;
    const [removed] = S.store.events.splice(i, 1);
    persist();
    closeSheetThen(renderMain);
    toast(t("deleted_entry", { label: typeLabel(removed.type) }), () => {
      S.store.events.push(removed); persist(); renderAll();
    });
  },

  /* ---- dosi e farmacia ---- */
  openDose(name) {
    const d = doseReminders().find((x) => x.name === name);
    if (!d) return;
    S.ui.ackedDoses[name] = d.due;   // il tocco ferma il lampeggio
    push({ kind: "sheet", id: "dose", p: { name } });
  },
  logDoseAgain(name, keep) {
    const d = doseReminders().find((x) => x.name === name);
    if (!d) return;
    const ev = { id: uid(), type: d.type, at: Date.now(), note: name };
    if (keep) ev.repeatH = d.repeatH;
    S.store.events.push(ev);
    delete S.ui.ackedDoses[name];
    persist(); toast(t("logged_type", { label: name }));
    closeSheetThen(renderMain);
  },
  searchPharmacy() {
    const town = ((document.getElementById("pharm-town") || {}).value || "").trim();
    if (!town) return toast(t("pharmacy_need_town"));
    S.store.prefs.pharmacyTown = town; persist();
    window.open(`https://www.google.com/search?q=${encodeURIComponent("farmacia di turno oggi " + town)}`, "_blank", "noopener");
    closeSheetThen();
  },

  /* ---- suoni ---- */
  playSound(id) {
    S.sound.setVolume(S.store.prefs.volume ?? 0.4);
    S.sound.play(id);
    if (S.ui.sleepTimerMin && S.sound.playing) S.sound.sleepTimer(S.ui.sleepTimerMin);
    if (top() && top().kind === "nightpicker") goBack();
    renderAll();
  },
  stopSound() {
    S.sound.stop(); S.ui.nightLastSound = null;
    if (top() && top().kind === "nightpicker") goBack();
    renderAll();
  },
  dockSound() { if (S.layers.length) goBack(S.layers.length); S.tab = "suoni"; renderAll(); window.scrollTo(0, 0); },
  setVolume(v) {
    const f = parseFloat(v);
    S.sound.setVolume(f);
    // in memoria subito (ogni ridisegno ricostruisce lo slider da qui), su disco con calma
    S.store.prefs.volume = f;
    document.querySelectorAll(".sctl-val").forEach((el) => { el.textContent = Math.round(f * 100) + "%"; });
    clearTimeout(this._volT); this._volT = setTimeout(persist, 400);
  },
  setSleepTimer(min) {
    const n = parseInt(min, 10) || 0;
    S.ui.sleepTimerMin = n;
    S.sound.sleepTimer(n);
    toast(n > 0 ? t("timer_set", { n }) : t("timer_off"));
  },

  /* ---- timer ---- */
  startTimer(m) { if (!startTimer(m)) toast(t("timer_invalid")); S.ui.showTimerCustom = false; renderMain(); },
  startCustomTimer() { this.startTimer((document.getElementById("tm-custom") || {}).value); },
  toggleTimerCustom() {
    S.ui.showTimerCustom = !S.ui.showTimerCustom; renderMain();
    const el = document.getElementById("tm-custom"); if (el) el.focus();
  },
  stopTimer() { stopTimer(); },
  againTimer() { const m = T.run ? Math.round(T.run.total / 60000) : S.store.prefs.timerLast || 10; startTimer(m); },
  setTimerAlert(m) { S.store.prefs.timerAlert = m; persist(); renderMain(); },
  dockTimer() {
    if (T.done) return stopTimer();
    if (S.layers.length) goBack(S.layers.length);
    S.tab = "timer"; renderAll(); window.scrollTo(0, 0);
  },
  // in modalita' notte il tocco non porta fuori dal buio: spegne solo l'avviso
  nightTimerTap() { if (T.done) stopTimer(); },

  /* ---- modalita' notte ---- */
  openNight() { push({ kind: "night" }); },
  acceptNightPrompt() { replaceTop({ kind: "night" }); },
  toggleNightSoundList() { push({ kind: "nightpicker" }); },
  pauseNightSound() { S.sound.stop(); renderAll(); },
  resumeNightSound() { if (S.ui.nightLastSound) this.playSound(S.ui.nightLastSound); },

  /* ---- profilo ---- */
  setSex(k) {
    S.ui.pendingSex = k;
    document.querySelectorAll(".sexseg .seg-opt").forEach((b) => {
      const on = b.getAttribute("onclick").includes(`"${k}"`);
      b.classList.toggle("on", on); b.setAttribute("aria-checked", on);
    });
  },
  saveProfile() {
    const n = document.getElementById("p-name").value.trim();
    const d = document.getElementById("p-birth").value;
    if (!n) return toast(t("ob_need_name"));
    if (!d) return toast(t("ob_need_birth"));
    if (new Date(d + "T00:00:00").getTime() > Date.now()) return toast(t("profile_future"));
    S.store.baby.name = n; S.store.baby.birth = d;
    if (S.ui.pendingSex) S.store.baby.sex = S.ui.pendingSex;
    persist(); toast(t("profile_saved"));
    goBack();
  },

  /* ---- crescita ---- */
  saveGrowth(id) {
    const num = (k) => parseFloat(((document.getElementById(k) || {}).value || "").replace(",", "."));
    const w = num("g-weight"), h = num("g-height"), hc = num("g-head");
    const date = (document.getElementById("g-date") || {}).value || isoDay();
    if (!(w > 0) && !(h > 0) && !(hc > 0)) return toast(t("growth_empty_error"));
    if (date > isoDay()) return toast(t("future_date"));
    if (w > 40 || h > 150 || hc > 70) return toast(t("growth_implausible"));
    const rec = id ? S.store.growth.find((g) => g.id === id) : { id: uid() };
    if (!rec) return;
    rec.date = date;
    ["weight", "height", "head"].forEach((k) => delete rec[k]);
    if (w > 0) rec.weight = Math.round(w * 100) / 100;
    if (h > 0) rec.height = Math.round(h * 10) / 10;
    if (hc > 0) rec.head = Math.round(hc * 10) / 10;
    if (!id) S.store.growth.push(rec);
    S.store.growth.sort((a, b) => a.date.localeCompare(b.date));
    persist(); toast(id ? t("edit_done") : t("added"));
    closeSheetThen(renderMain);
  },
  deleteGrowth(id) {
    const i = S.store.growth.findIndex((g) => g.id === id);
    if (i < 0) return;
    const [removed] = S.store.growth.splice(i, 1);
    persist();
    closeSheetThen(renderMain);
    toast(t("growth_deleted"), () => { S.store.growth.push(removed); S.store.growth.sort((a, b) => a.date.localeCompare(b.date)); persist(); renderAll(); });
  },

  /* ---- documenti ----
     Il codice protegge da uno sguardo distratto, non e' crittografia, e
     la sezione lo dice apertamente. Si richiude a ogni uscita. */
  submitDocsPin() {
    const el = document.getElementById("doc-pin");
    const v = (el ? el.value : "").trim();
    if (!/^\d{4}$/.test(v)) return toast(t("docs_pin_short"));
    if (!S.store.prefs.docsPin) { S.store.prefs.docsPin = v; persist(); }
    else if (S.store.prefs.docsPin !== v) { el.value = ""; el.focus(); return toast(t("docs_pin_wrong")); }
    S.ui.docsUnlocked = true;
    loadDocsCache().then(renderLayers);
  },
  saveDocsPin() {
    const v = ((document.getElementById("new-pin") || {}).value || "").trim();
    if (!/^\d{4}$/.test(v)) return toast(t("docs_pin_short"));
    S.store.prefs.docsPin = v; persist(); toast(t("docs_pin_saved"));
    closeSheetThen();
  },
  pickDoc(type) {
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = "image/*"; inp.capture = "environment";
    inp.onchange = async () => {
      const f = inp.files && inp.files[0];
      if (!f) return;
      try {
        await saveDoc(type, await compressImage(f));
        await loadDocsCache(); renderLayers(); toast(t("docs_saved"));
      } catch (e) { toast(t("import_err")); }
    };
    inp.click();
  },
  askDeleteDoc(type) {
    push({ kind: "sheet", id: "confirm", p: { title: t("docs_confirm_del"), body: t("doc_" + type), action: `NINNA.doDeleteDoc('${type}')`, label: t("docs_delete_one"), danger: true } });
  },
  async doDeleteDoc(type) {
    await deleteDoc(type); await loadDocsCache();
    toast(t("docs_deleted"));
    closeSheetThen(renderLayers);
  },

  /* ---- guida ---- */
  toggleArticle(id) { S.ui.openArticle = S.ui.openArticle === id ? null : id; renderLayers(); },

  /* ---- dati ---- */
  exportCSVFile() {
    const labels = Object.fromEntries([...["nap", "night"], ...INSTANT, ...HEALTH].map((k) => [k, typeLabel(k)]));
    const header = [t("csv_type"), t("csv_start"), t("csv_end"), t("csv_dur"), t("csv_note")];
    downloadBlob(new Blob([exportCSV(S.store.events, labels, header)], { type: "text/csv" }), "ninna-dati.csv");
    toast(t("csv_done"));
  },
  exportJSONFile() {
    // il codice dei documenti resta sul telefono: i documenti non entrano nel backup, il codice nemmeno
    const { docsPin, timerRun, ...prefs } = S.store.prefs;
    downloadBlob(new Blob([exportJSON({ ...S.store, prefs })], { type: "application/json" }), "ninna-backup.json");
    toast(t("backup_done"));
  },
  importJSONFile(input) {
    const f = input.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = importJSON(r.result);
        const keep = { docsPin: S.store.prefs.docsPin };
        data.prefs = { ...data.prefs, ...(keep.docsPin ? keep : {}) };
        delete data.prefs.timerRun;
        S.store.version = data.version; S.store.baby = data.baby; S.store.events = data.events;
        S.store.growth = data.growth; S.store.prefs = data.prefs;
        S.lang = S.store.prefs.lang === "en" ? "en" : "it";
        S.logOnly = S.store.prefs.logOnly === true;
        S.theme = S.store.prefs.theme || "auto";
        applyTheme(); persist(); toast(t("import_done"));
        if (!S.store.baby) goBack(S.layers.length);
        renderAll();
      } catch { toast(t("import_bad")); }
    };
    r.readAsText(f);
    input.value = "";
  },
  askWipe() {
    push({ kind: "sheet", id: "confirm", p: { title: t("wipe"), body: t("wipe_confirm"), action: "NINNA.doWipe()", label: t("wipe_do"), danger: true } });
  },
  async doWipe() {
    try { await deleteAllDocs(); } catch (e) {}
    S.sound.stop(); stopTimer();
    const { lang, logOnly, theme } = S.store.prefs;
    S.store.version = 1; S.store.baby = null; S.store.events = []; S.store.growth = [];
    S.store.prefs = { volume: 0.4, lang, logOnly, theme };
    persist();
    S.tab = "oggi";
    goBack(S.layers.length);
    renderAll();
  },

  /* ---- primo avvio ---- */
  saveBaby() {
    const name = document.getElementById("ob-name").value.trim();
    const birth = document.getElementById("ob-birth").value;
    if (!name || !birth) return toast(t("ob_missing"));
    if (birth > isoDay()) return toast(t("profile_future"));
    S.store.baby = { name, birth }; persist(); renderAll();
  },
};

/* ========================== AVVIO ========================== */

/* scorciatoie dalla pressione lunga sull'icona */
function handleShortcut() {
  const azione = new URLSearchParams(location.search).get("azione");
  if (!azione) return;
  history.replaceState({ d: 0 }, "", location.pathname);   // un refresh non deve registrare un secondo sonno
  if (!S.store.baby) return;
  const active = activeSleep();
  if (active) return toast(typeLabel(active.type) + " · " + t("in_progress"));
  const kind = azione === "nanna" ? "night" : azione === "pisolino" ? "nap" : null;
  if (kind) NINNA.startSleep(kind);
}

history.replaceState({ d: 0 }, "");
resumeTimer();
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  timerVisible();
  refreshTimes();
});
applyTheme();
renderAll();
handleShortcut();

/* aggiornamento periodico dei tempi a schermo; mai mentre si scrive in un
   campo, e mai sotto un foglio aperto (perderebbe quanto digitato) */
function refreshTimes() {
  const tag = document.activeElement && document.activeElement.tagName;
  if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
  if (!S.store.baby) return;
  const l = top();
  // sotto un foglio o una pagina si aggiorna solo cio' che non ha campi da compilare
  renderMain(); renderBottom();
  if (l && (l.kind === "night" || l.kind === "nightpicker")) renderLayers();
}
setInterval(refreshTimes, 30000);
