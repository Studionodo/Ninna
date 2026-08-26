/* ============================================================
   NINNA — app.js v3 (UI vanilla + i18n IT/EN)
   Il motore parla per codici; l'i18n traduce; la UI compone.
   ============================================================ */
import { forecast, dailyStats, profileFor, ageWeeks } from "./engine.js";
import { SoundEngine, SOUNDS } from "./sounds.js";
import { I18N } from "./i18n.js";
import { loadStore, saveStore, exportCSV, exportJSON, importJSON } from "./content-store.js";

const TYPE_ICONS = { nap:"☁️", night:"🌙", breast:"🤱", bottle:"🍼", solid:"🥣", diaper:"🧷", nightwake:"🌩", pump:"⚗️" };
const INSTANT = ["breast", "bottle", "solid", "diaper", "nightwake", "pump"];
const KOFI = "https://ko-fi.com/istantelabs/tip";
const APP_VERSION = "1.1.6";
const CUP = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4.5 9h11v5.5a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4V9z"/><path d="M15.5 10h1.6a2.4 2.4 0 0 1 0 4.8h-1.6"/><path d="M8 4.5c0 .9.9 1.1.9 2M11.5 4c0 .9.9 1.1.9 2"/></svg>`;

/* ---------- stato ---------- */
let store = loadStore();
let lang = store.prefs.lang === "en" ? "en" : "it";
let logOnly = store.prefs.logOnly === true;
let view = "oggi";
let showWhy = false, showManual = false;
let sound = new SoundEngine();
let timerMin = 0;
let notifTimeouts = [];

const $app = document.getElementById("app");
const $tabbar = document.getElementById("tabbar");
const $toast = document.getElementById("toast");
const $modal = document.getElementById("modal-root");

/* ---------- i18n ---------- */
const t = (k, params) => {
  let s = (I18N[lang].ui[k] ?? k);
  if (params) for (const [key, v] of Object.entries(params)) s = s.replaceAll(`{${key}}`, v);
  return s;
};
const LOCALE = () => (lang === "it" ? "it-IT" : "en-US");
const typeLabel = (type) => t("type_" + type);

/* ---------- utilita' ---------- */
const uid = () => Math.random().toString(36).slice(2, 10);
const fmtHM = (ts) => new Date(ts).toLocaleTimeString(LOCALE(), { hour: "2-digit", minute: "2-digit" });
const fmtDur = (ms) => { const m = Math.round(ms / 60000), h = Math.floor(m / 60); return h > 0 ? `${h}h ${String(m % 60).padStart(2, "0")}m` : `${m} min`; };
const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
const localTodayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function persist() { saveStore(store); }
function toast(msg) {
  $toast.textContent = msg; $toast.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => ($toast.hidden = true), 2200);
}

/* ---------- composizione testi dal motore (codici -> lingua) ---------- */
const reasonText = (next) => t("r_" + { routine:"routine", max_naps:"max", window_into_night:"window", first_nap:"first", nap_n:"napn", night_hours:"nighth" }[next.code], next.params);
const notifText = (id, babyName) =>
  id === "pre-nap"
    ? { title: t("n_nap_t", { name: babyName }), body: t("n_nap_b") }
    : { title: t("n_bed_t"), body: t("n_bed_b") };

/* ---------- notifiche (client-side, approccio Bariletto) ---------- */
const hasNotif = () => "Notification" in window;
async function askNotifPermission() {
  if (!hasNotif()) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  return (await Notification.requestPermission()) === "granted";
}
async function showNotif(title, body) {
  try {
    const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : null;
    if (reg) reg.showNotification(title, { body, icon: "icons/icon-192.png", badge: "icons/icon-192.png", tag: "ninna" });
    else if (hasNotif()) new Notification(title, { body, icon: "icons/icon-192.png" });
  } catch (e) { console.warn("notifica fallita", e); }
}
function scheduleNotifications(plan) {
  notifTimeouts.forEach(clearTimeout); notifTimeouts = [];
  if (!hasNotif() || Notification.permission !== "granted") return;
  const now = Date.now();
  plan.filter((n) => n.at > now && n.at - now < 12 * 3600000).forEach((n) => {
    notifTimeouts.push(setTimeout(() => {
      const { title, body } = notifText(n.id, store.baby ? store.baby.name : "");
      showNotif(title, body);
    }, n.at - now));
  });
}

/* ---------- azioni ---------- */
window.NINNA = {
  setView(v) { view = v; render(); },
  setLang(l) { lang = l === "en" ? "en" : "it"; store.prefs.lang = lang; persist(); render(); if ($modal.innerHTML) renderSettings(); },
  toggleLogOnly() {
    logOnly = !logOnly;
    store.prefs.logOnly = logOnly;
    persist();
    if (logOnly && (view === "stat")) view = "oggi";   // la vista nascosta non resta aperta
    toast(logOnly ? t("logonly_on") : t("logonly_off"));
    render();
    if ($modal.innerHTML) renderSettings();
  },
  startSleep(kind) {
    store.events.push({ id: uid(), type: kind, start: Date.now(), end: null });
    persist(); toast(typeLabel(kind) + " — " + t("started")); render();
  },
  endSleep(id) {
    const e = store.events.find((x) => x.id === id);
    if (e) { e.end = Date.now(); persist(); toast(t("logged") + fmtDur(e.end - e.start)); }
    render();
  },
  logInstant(type) {
    store.events.push({ id: uid(), type, at: Date.now() });
    persist(); toast(t("logged_type", { label: typeLabel(type) })); render();
  },
  removeEvent(id) { store.events = store.events.filter((e) => e.id !== id); persist(); render(); },
  toggleWhy() { showWhy = !showWhy; render(); },
  toggleManual() { showManual = !showManual; render(); },
  addManual() {
    const kind = document.getElementById("m-kind").value;
    const s = document.getElementById("m-start").value;
    const e = document.getElementById("m-end").value;
    if (!s || !e) return toast(t("missing_times"));
    const iso = localTodayISO();
    let sMs = new Date(`${iso}T${s}:00`).getTime();
    let eMs = new Date(`${iso}T${e}:00`).getTime();
    if (isNaN(sMs) || isNaN(eMs)) return toast(t("invalid_times"));
    if (eMs <= sMs) eMs += 86400000;
    if (sMs > Date.now()) { sMs -= 86400000; eMs -= 86400000; } // "ieri sera" inserito stamattina
    store.events.push({ id: uid(), type: kind, start: sMs, end: eMs });
    persist(); showManual = false; toast(t("added")); render();
  },
  playSound(id) { sound.setVolume(store.prefs.volume ?? 0.4); sound.play(id); render(); },
  setVolume(v) {
    const f = parseFloat(v);
    sound.setVolume(f);
    clearTimeout(this._volT);
    this._volT = setTimeout(() => { store.prefs.volume = f; persist(); }, 400);
  },
  setSleepTimer(min) {
    const n = parseInt(min, 10) || 0;
    timerMin = n;
    sound.sleepTimer(n);
    toast(n > 0 ? t("timer_set", { n }) : t("timer_off"));
  },
  toggleArticle(id) { const el = document.getElementById("art-" + id); if (el) el.hidden = !el.hidden; },
  openSettings() { renderSettings(); },
  closeSettings() { $modal.innerHTML = ""; },
  openReport() {
    const blob = new Blob([buildReportHTML(14)], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (!win) {
      // popup bloccato dal browser: scarica il file, l'utente lo apre da solo
      downloadBlob(blob, "ninna-riepilogo.html");
      toast(t("report_print"));
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  },
  exportCSVFile() {
    const labels = Object.fromEntries(["nap","night","breast","bottle","solid","diaper","nightwake","pump"].map((k) => [k, typeLabel(k)]));
    const header = [t("csv_type"), t("csv_start"), t("csv_end"), t("csv_dur")];
    const blob = new Blob([exportCSV(store.events, labels, header)], { type: "text/csv" });
    downloadBlob(blob, "ninna-data.csv"); toast(t("csv_done"));
  },
  exportJSONFile() {
    const blob = new Blob([exportJSON(store)], { type: "application/json" });
    downloadBlob(blob, "ninna-backup.json"); toast(t("backup_done"));
  },
  importJSONFile(input) {
    const f = input.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        store = importJSON(r.result);
        lang = store.prefs.lang === "en" ? "en" : "it";
        logOnly = store.prefs.logOnly === true;
        persist(); NINNA.closeSettings(); toast(t("import_done")); render();
      } catch { toast(t("import_bad")); }
    };
    r.readAsText(f);
  },
  async enableNotifs() {
    const ok = await askNotifPermission();
    toast(ok ? t("notif_on") : t("notif_denied"));
    render();
  },
  wipe() {
    if (!confirm(t("wipe_confirm"))) return;
    store = { version: 1, baby: null, events: [], prefs: { volume: 0.4, lang, logOnly } };
    persist(); NINNA.closeSettings(); render();
  },
  saveBaby() {
    const name = document.getElementById("ob-name").value.trim();
    const birth = document.getElementById("ob-birth").value;
    if (!name || !birth) return toast(t("ob_missing"));
    store.baby = { name, birth }; persist(); render();
  },
};

function downloadBlob(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

/* ---------- viste ---------- */
function ringSVG(pct, sleeping) {
  const R = 52, C = 2 * Math.PI * R, filled = C * Math.min(1, pct);
  const color = sleeping ? "#8B7BFF" : pct < 0.75 ? "#8FE6C9" : "#F0A0B6";
  const label = sleeping ? "zZ" : Math.round(pct * 100) + "%";
  const sub = sleeping ? (lang === "it" ? "sta dormendo" : "sleeping") : (lang === "it" ? "pressione del sonno" : "sleep pressure");
  return `<svg width="120" height="120" viewBox="0 0 128 128" class="ring">
    <circle cx="64" cy="64" r="${R}" stroke="rgba(255,255,255,.08)" stroke-width="10" fill="none"/>
    <circle cx="64" cy="64" r="${R}" fill="none" stroke-width="10" stroke-linecap="round"
      stroke="${color}" stroke-dasharray="${filled} ${C}" transform="rotate(-90 64 64)"/>
    <text x="64" y="60" text-anchor="middle" fill="#EAF2EE" font-size="26">${label}</text>
    <text x="64" y="80" text-anchor="middle" fill="#A6B7B0" font-size="10">${sub}</text>
  </svg>`;
}

function footerHTML(kind) {
  const langBlock = `<div class="langrow">
      <span class="langlabel">${t("language").toUpperCase()}</span>
      <div class="langpill">
        <button class="langopt ${lang === "it" ? "on" : ""}" onclick="NINNA.setLang('it')">IT</button>
        <button class="langopt ${lang === "en" ? "on" : ""}" onclick="NINNA.setLang('en')">EN</button>
      </div>
    </div>`;
  if (kind === "onboarding") {
    return `<div class="appfooter">${langBlock}
    <div class="hairline"></div>
    <div class="finelines">${t("footer1")}</div>
  </div>`;
  }
  // kind === "full": solo in coda alla Guida
  return `<div class="appfooter">${langBlock}
    <a class="coffee" href="${KOFI}" target="_blank" rel="noopener">${CUP}<span>${t("coffee")}</span></a>
    <div class="hairline"></div>
    <div class="finelines">${t("footer1")}<br>${t("footer2")}</div>
  </div>`;
}

function renderOggi(f) {
  const active = store.events.find((e) => (e.type === "nap" || e.type === "night") && !e.end);
  const b = store.baby;
  let hero;
  if (active) {
    hero = `${ringSVG(1, true)}
      <div class="hero-text">
        <div class="hero-label">${typeLabel(active.type)} · ${t("hero_sleeping")}</div>
        <div class="hero-big">${fmtDur(Date.now() - active.start)}</div>
        <button class="primary" onclick="NINNA.endSleep('${active.id}')">${t("btn_awake")}</button>
      </div>`;
  } else if (logOnly) {
    hero = `<div class="hero-text">
      <div class="hero-label">${t("today")}</div>
      <div class="hero-sub">${t("logonly_hint")}</div>
    </div>`;
  } else if (f.lastWake) {
    const s = f.sweetSpot;
    const isNight = f.next.kind === "night";
    hero = `${ringSVG(f.pressure, false)}
      <div class="hero-text">
        <div class="hero-label">${isNight ? t("hero_night") : t("hero_nap")}</div>
        <div class="hero-big">${isNight ? fmtHM(f.bedtime.at) : fmtHM(s.from) + "–" + fmtHM(s.to)}</div>
        <div class="hero-sub">${isNight
          ? t("routine_at", { time: fmtHM(f.bedtime.at - 45 * 60000) })
          : s.center > Date.now()
            ? t("center_in", { dur: fmtDur(s.center - Date.now()) })
            : t("window_over", { dur: fmtDur(Date.now() - s.center) })} · ${t("awake_for", { dur: fmtDur(Date.now() - f.lastWake) })}</div>
        <button class="link" onclick="NINNA.toggleWhy()">${showWhy ? t("why_close") : t("why_open")}</button>
        ${showWhy ? `<div class="why">${reasonText(f.next)}<br>${t("why_window", { lo: f.profile.ww[0], hi: f.profile.ww[1] })}
          ${f.window.observedEma
            ? t("why_observed", { name: esc(b.name), ema: f.window.observedEma, conf: Math.round(f.window.confidence * 100), min: f.window.minutes })
            : t("why_default", { min: f.window.minutes })}
          ${t("why_bed", { time: fmtHM(f.bedtime.at) })}</div>` : ""}
      </div>`;
  } else {
    hero = `<div class="hero-text">
      <div class="hero-label">${t("hero_start")}</div>
      <div class="hero-sub">${t("hero_start_sub", { name: esc(b.name) })}</div>
    </div>`;
  }

  const todayEvents = [...store.events]
    .filter((e) => sameDay(e.start || e.at, Date.now()))
    .sort((a, b2) => (b2.start || b2.at) - (a.start || a.at));

  return `
    ${!logOnly && f.transition.detected ? `<div class="banner">${t("transition", { avg: f.transition.avgNaps, lo: f.transition.expected[0], hi: f.transition.expected[1] })}</div>` : ""}
    <div class="card hero">${hero}</div>
    ${!active ? (() => {
      const k = logOnly ? null : f.next.kind;
      const btn = (kind, icon, label) => `<button class="bigbtn ${k === kind ? "" : "alt"}" onclick="NINNA.startSleep('${kind}')">${icon} ${label}${k === kind ? `<span class="rec">${t("recommended")}</span>` : ""}</button>`;
      return `<div class="row2">${btn("nap", "☁️", t("btn_nap"))}${btn("night", "🌙", t("btn_night"))}</div>`;
    })() : ""}
    ${!active && !logOnly && f.lastWake && f.next.kind === "nap" ? `<div class="card slim">
      <div class="hero-sub">🌙 ${t("bed_card")} <b class="lit">${fmtHM(f.bedtime.at)}</b>
      ${f.bedtime.earlier ? `<br><span class="amber">${t("bed_earlier")}</span>` : ""}</div>
    </div>` : ""}
    <div class="grid3">
      ${INSTANT.map((ty) => `<button class="tile" onclick="NINNA.logInstant('${ty}')">
        <span class="tile-icon">${TYPE_ICONS[ty]}</span><span>${typeLabel(ty)}</span>
      </button>`).join("")}
    </div>
    <button class="link block" onclick="NINNA.toggleManual()">${showManual ? t("manual_close") : t("manual_open")}</button>
    ${showManual ? `<div class="card">
      <label class="field"><span>${t("manual_type")}</span>
        <select id="m-kind"><option value="nap">☁️ ${typeLabel("nap")}</option><option value="night">🌙 ${typeLabel("night")}</option></select>
      </label>
      <div class="row2">
        <label class="field"><span>${t("manual_start")}</span><input type="time" id="m-start" value="13:00"></label>
        <label class="field"><span>${t("manual_end")}</span><input type="time" id="m-end" value="14:00"></label>
      </div>
      <button class="secondary block" onclick="NINNA.addManual()">${t("save")}</button>
    </div>` : ""}
    <div class="card">
      <div class="card-title">${t("today")}</div>
      ${todayEvents.length === 0 ? `<div class="dim">${t("today_empty")}</div>` : ""}
      ${todayEvents.map((e) => `<div class="logrow">
        <span class="logicon">${TYPE_ICONS[e.type]}</span>
        <span class="loglabel">${typeLabel(e.type)}</span>
        <span class="logtime">${e.at
          ? fmtHM(e.at)
          : fmtHM(e.start) + (e.end ? "–" + fmtHM(e.end) + " · " + fmtDur(e.end - e.start) : " · " + t("in_progress"))}</span>
        <button class="del" onclick="NINNA.removeEvent('${e.id}')">✕</button>
      </div>`).join("")}
    </div>
    ${hasNotif() && Notification.permission === "default"
      ? `<button class="secondary block" onclick="NINNA.enableNotifs()">${t("notif_enable")}</button>` : ""}`;
}

function renderStat(f) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const ts = Date.now() - i * 86400000;
    const s = dailyStats(store.events, ts, profileFor(store.baby.birth, ts));
    days.push({ label: new Date(ts).toLocaleDateString(LOCALE(), { weekday: "short" }), total: s.totalMinutes / 60 });
  }
  const maxH = Math.max(1, ...days.map((d) => d.total));
  const st = f.stats, pr = f.profile;
  const row = (k, v) => `<div class="logrow"><span class="loglabel">${k}</span><span class="logtime">${v}</span></div>`;
  return `
    <div class="card">
      <div class="card-title">${t("stat_title")}</div>
      <div class="bars">${days.map((d) => `
        <div class="barcol">
          <div class="barval">${d.total ? d.total.toFixed(1) + "h" : "—"}</div>
          <div class="bar" style="height:${(d.total / maxH) * 100}%"></div>
          <div class="barlabel">${d.label}</div>
        </div>`).join("")}</div>
      <div class="dim small">${t("stat_target", { lo: pr.total[0], hi: pr.total[1], nlo: pr.naps[0], nhi: pr.naps[1] })}</div>
    </div>
    <div class="card">
      <div class="card-title">${t("stat_today")}</div>
      ${row(t("stat_day"), t("stat_rangefmt", { v: Math.round(st.napMinutes / 6) / 10, lo: pr.day[0], hi: pr.day[1] }))}
      ${row(t("stat_night"), t("stat_rangefmt", { v: Math.round(st.nightMinutes / 6) / 10, lo: pr.night[0], hi: pr.night[1] }))}
      ${row(t("stat_feeds"), `${st.feeds}${st.avgFeedGapMin ? " · " + t("stat_every", { h: Math.round(st.avgFeedGapMin / 6) / 10 }) : ""}`)}
      ${row(t("stat_diapers"), st.diapers)}
      ${row(t("stat_wakes"), st.nightWakes)}
      <div class="dim small">${t("stat_variability")}</div>
    </div>
    <button class="secondary block" onclick="NINNA.exportCSVFile()">${t("export_csv")}</button>`;
}

function renderSuoni() {
  const vol = store.prefs.volume ?? 0.4;
  return `
    <div class="card">
      <div class="card-title">${t("sounds_title")}</div>
      <div class="dim small">${t("sounds_note")}</div>
      ${SOUNDS.map((s) => {
        const on = sound.playing === s.id;
        const icon = on
          ? `<svg viewBox="0 0 24 24" width="18" height="18"><rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor"/></svg>`
          : `<svg viewBox="0 0 24 24" width="18" height="18"><path d="M7 5v14l12-7z" fill="currentColor"/></svg>`;
        return `<button class="soundrow ${on ? "on" : ""}" onclick="NINNA.playSound('${s.id}')">
        <span class="soundtext"><b>${t("sound_" + s.id)}</b><small>${t("sounddesc_" + s.id)}</small></span>
        <span class="soundstate ${on ? "stop" : "play"}">${icon}</span>
      </button>`;
      }).join("")}
      <label class="field"><span>${t("volume")}</span>
        <input type="range" min="0" max="1" step="0.01" value="${vol}" oninput="NINNA.setVolume(this.value)">
      </label>
      <label class="field"><span>${t("sleep_timer")}</span>
        <select onchange="NINNA.setSleepTimer(this.value)">
          <option value="0"${timerMin === 0 ? " selected" : ""}>${t("never")}</option>
          ${[15, 30, 45, 60].map((n) => `<option value="${n}"${timerMin === n ? " selected" : ""}>${t("timer_min", { n })}</option>`).join("")}
        </select>
      </label>
    </div>`;
}

function renderGuida() {
  const { cats, articles } = I18N[lang];
  return cats.map((c) => `
    <div class="catlabel">${c.label}</div>
    ${articles.filter((a) => a.cat === c.id).map((a) => `
      <div class="card artcard" onclick="NINNA.toggleArticle('${a.id}')">
        <div class="art-head">
          <span class="art-title">${a.t}</span>
          <span class="art-min">${t("read_min", { n: a.min })}</span>
        </div>
        <p class="artbody" id="art-${a.id}" hidden>${a.b}</p>
      </div>`).join("")}
  `).join("") + `<div class="dim small pad">${t("guide_disclaimer")}</div>`;
}

function renderOnboarding() {
  return `<div class="onboard">
    <img class="brandmark" src="icons/brandmark.png" alt="Ninna">
    <h1>Ninna</h1>
    <p class="dim">${t("ob_title_sub")}<br>${t("ob_sub2")}</p>
    <label class="field"><span>${t("ob_name")}</span>
      <input id="ob-name" placeholder="${t("ob_name_ph")}"></label>
    <label class="field"><span>${t("ob_birth")}</span>
      <input id="ob-birth" type="date"></label>
    <button class="primary block" onclick="NINNA.saveBaby()">${t("ob_start")}</button>
  </div>` + footerHTML("onboarding");
}


/* ---------- riepilogo stampabile per il pediatra ----------
   Nessuna libreria PDF: si apre una pagina formattata e si usa la
   stampa di sistema, che su Android e desktop offre "Salva come PDF". */
function buildReportHTML(days = 14) {
  const b = store.baby;
  const rows = [];
  let sumDay = 0, sumNight = 0, sumNaps = 0, sumWakes = 0, sumFeeds = 0, sumDiapers = 0, counted = 0;
  for (let i = days - 1; i >= 0; i--) {
    const ts = Date.now() - i * 86400000;
    const st = dailyStats(store.events, ts, profileFor(b.birth, ts));
    if (st.totalMinutes === 0 && st.feeds === 0 && st.diapers === 0) continue;
    counted++;
    sumDay += st.napMinutes; sumNight += st.nightMinutes; sumNaps += st.naps;
    sumWakes += st.nightWakes; sumFeeds += st.feeds; sumDiapers += st.diapers;
    const hm = (m) => `${Math.floor(m / 60)}h ${String(Math.round(m % 60)).padStart(2, "0")}m`;
    rows.push(`<tr>
      <td>${new Date(ts).toLocaleDateString(LOCALE(), { day: "2-digit", month: "2-digit" })}</td>
      <td>${hm(st.napMinutes)}</td><td>${hm(st.nightMinutes)}</td><td><b>${hm(st.totalMinutes)}</b></td>
      <td>${st.naps}</td><td>${st.nightWakes}</td><td>${st.feeds}</td><td>${st.diapers}</td>
    </tr>`);
  }
  const n = Math.max(1, counted);
  const hm = (m) => `${Math.floor(m / 60)}h ${String(Math.round(m % 60)).padStart(2, "0")}m`;
  const pr = profileFor(b.birth);
  const w = Math.floor(ageWeeks(b.birth));
  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="utf-8">
<title>${t("report_title")} — ${esc(b.name)}</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; color: #111; max-width: 760px; margin: 24px auto; padding: 0 16px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .meta { color: #555; font-size: 13px; margin-bottom: 18px; line-height: 1.6; }
  table { border-collapse: collapse; width: 100%; font-size: 13px; }
  th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: center; }
  th { background: #f2f2f2; font-weight: 600; }
  td:first-child, th:first-child { text-align: left; }
  tfoot td { background: #fafafa; font-weight: 600; }
  .note { margin-top: 18px; font-size: 11.5px; color: #666; line-height: 1.5; }
  .btn { margin: 18px 0; padding: 10px 18px; font-size: 14px; cursor: pointer; }
  @media print { .btn { display: none; } body { margin: 0; } }
</style></head><body>
<h1>${t("report_title")}</h1>
<div class="meta">
  <b>${t("report_child")}:</b> ${esc(b.name)} · <b>${t("report_age")}:</b> ${w} ${t("u_weeks")}<br>
  <b>${t("report_period")}:</b> ${counted} ${t("u_days")} · <b>${t("report_generated")}:</b> ${new Date().toLocaleString(LOCALE())}<br>
  ${t("stat_target", { lo: pr.total[0], hi: pr.total[1], nlo: pr.naps[0], nhi: pr.naps[1] })}
</div>
<button class="btn" onclick="window.print()">${t("report_print")}</button>
<table>
  <thead><tr>
    <th>${t("report_day")}</th><th>${t("report_daysleep")}</th><th>${t("report_nightsleep")}</th>
    <th>${t("report_tot")}</th><th>${t("report_naps")}</th><th>${t("report_wakes")}</th>
    <th>${t("report_feeds")}</th><th>${t("report_diapers")}</th>
  </tr></thead>
  <tbody>${rows.join("")}</tbody>
  <tfoot><tr>
    <td>${t("report_avg")}</td><td>${hm(sumDay / n)}</td><td>${hm(sumNight / n)}</td>
    <td>${hm((sumDay + sumNight) / n)}</td><td>${(sumNaps / n).toFixed(1)}</td>
    <td>${(sumWakes / n).toFixed(1)}</td><td>${(sumFeeds / n).toFixed(1)}</td><td>${(sumDiapers / n).toFixed(1)}</td>
  </tr></tfoot>
</table>
<div class="note">${t("report_note")}<br>${t("stat_variability")}</div>
</body></html>`;
}

function renderSettings() {
  const b = store.baby;
  $modal.innerHTML = `<div class="modal-wrap" onclick="NINNA.closeSettings()">
    <div class="modal" onclick="event.stopPropagation()">
      <div class="card-title">${t("settings")}</div>
      <div class="dim small" style="opacity:.6">Ninna v${APP_VERSION}</div>
      <div class="dim small">${t("profile_line", { name: esc(b.name), date: new Date(b.birth + "T00:00:00").toLocaleDateString(LOCALE()), w: Math.floor(ageWeeks(b.birth)) })}</div>
      <div class="langrow inmodal">
        <span class="langlabel">${t("language").toUpperCase()}</span>
        <div class="langpill">
          <button class="langopt ${lang === "it" ? "on" : ""}" onclick="NINNA.setLang('it')">IT</button>
          <button class="langopt ${lang === "en" ? "on" : ""}" onclick="NINNA.setLang('en')">EN</button>
        </div>
      </div>
      <button class="secondary block" onclick="NINNA.exportJSONFile()">${t("backup_json")}</button>
      <label class="secondary block" style="cursor:pointer">${t("import_json")}
        <input type="file" accept="application/json" hidden onchange="NINNA.importJSONFile(this)">
      </label>
      <button class="secondary block" onclick="NINNA.exportCSVFile()">${t("export_csv")}</button>
      ${logOnly ? "" : `<button class="secondary block" onclick="NINNA.openReport()">${t("report")}</button>`}
      <div class="logonly-row">
        <button class="secondary block" style="margin:0" onclick="NINNA.toggleLogOnly()">${logOnly ? "◉ " : "○ "}${t("logonly")}</button>
        <div class="dim small">${t("logonly_desc")}</div>
      </div>
      <button class="danger block" onclick="NINNA.wipe()">${t("wipe")}</button>
      <button class="link block" onclick="NINNA.closeSettings()">${t("close")}</button>
    </div>
  </div>`;
}

/* ---------- render principale ---------- */
function render() {
  document.documentElement.lang = lang;
  if (!store.baby) {
    $app.innerHTML = renderOnboarding();
    $tabbar.innerHTML = "";
    return;
  }
  const f = forecast({ birthISO: store.baby.birth, events: store.events });
  scheduleNotifications(f.notifications);

  const w = ageWeeks(store.baby.birth);
  const ageLabel = w < 5 ? `${Math.round(w * 7)} ${t("u_days")}` : `${Math.floor(w / 4.345)} ${t("u_months")}`;

  if (logOnly && view === "stat") view = "oggi";
  let body = "";
  if (view === "oggi") body = renderOggi(f);
  if (view === "stat") body = renderStat(f);
  if (view === "suoni") body = renderSuoni();
  if (view === "guida") body = renderGuida();

  $app.innerHTML = `
    <header class="topbar">
      <div>
        <div class="eyebrow">Ninna</div>
        <div class="babyname">${esc(store.baby.name)}<span class="agechip">${ageLabel}</span></div>
      </div>
      <button class="ghost" onclick="NINNA.openSettings()">⋯</button>
    </header>
    ${body}
    ${view === "guida" ? footerHTML("full") : ""}`;

  const tabs = logOnly
    ? [["oggi", t("tab_oggi")], ["suoni", t("tab_suoni")], ["guida", t("tab_guida")]]
    : [["oggi", t("tab_oggi")], ["stat", t("tab_stat")], ["suoni", t("tab_suoni")], ["guida", t("tab_guida")]];
  $tabbar.innerHTML = tabs
    .map(([id, label]) => `<button class="tab ${view === id ? "active" : ""}" onclick="NINNA.setView('${id}')">${label}</button>`)
    .join("");
}

/* ---------- scorciatoie da long-press sull'icona ---------- */
function handleShortcut() {
  const azione = new URLSearchParams(location.search).get("azione");
  if (!azione) return;
  // ripulisce subito l'URL: un refresh non deve registrare un secondo sonno
  history.replaceState(null, "", location.pathname);
  if (!store.baby) return;                       // profilo non ancora creato
  const active = store.events.find((e) => (e.type === "nap" || e.type === "night") && !e.end);
  if (active) return toast(typeLabel(active.type) + " — " + t("in_progress"));
  const kind = azione === "nanna" ? "night" : azione === "pisolino" ? "nap" : null;
  if (kind) NINNA.startSleep(kind);
}

handleShortcut();
render();
setInterval(() => {
  const tag = document.activeElement && document.activeElement.tagName;
  const typing = tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA";
  if (view === "oggi" && !$modal.innerHTML && !showManual && !typing) render();
}, 30000);
