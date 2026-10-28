/* ============================================================
   NINNA · le cinque schede
   Oggi · Statistiche · Suoni · Timer · scheda del bambino
   ============================================================ */
import { dailyStats, profileFor, ageWeeks } from "./engine.js";
import { SOUNDS } from "./sounds.js";
import { I18N } from "./i18n.js";
import {
  S, t, esc, arg, typeLabel, fmtHM, fmtDur, fmtMS, fmtDate, sameDay, awakeLabel, elapsedLabel,
  INSTANT, HEALTH, activeSleep, doseReminders, ageLabel, LOCALE,
} from "./state.js";
import { TYPE_ICONS, TAB_ICONS, ICON, PLAY, STOP } from "./icons.js";
import { label, tile, row, seg } from "./ui.js";
import { T, TIMER_PRESETS, canVibrate, alertMode, timerLeft } from "./timer.js";

/* ============================ OGGI ============================ */

function ringSVG(pct, sleeping) {
  const R = 52, C = 2 * Math.PI * R, filled = C * Math.min(1, pct);
  const color = sleeping ? "var(--sleeping)" : pct < 0.75 ? "var(--mint)" : "var(--rose)";
  // il numero non supera mai il 100%, come il disegno; oltre, l'anello pulsa
  const big = sleeping ? "zZ" : Math.round(Math.min(1, pct) * 100) + "%";
  const l1 = sleeping ? t("ring_sleeping") : t("ring_l1");
  const l2 = sleeping ? "" : t("ring_l2");
  return `<svg width="118" height="118" viewBox="0 0 128 128" class="ring${!sleeping && pct > 1 ? " over" : ""}" aria-hidden="true">
    <circle cx="64" cy="64" r="${R}" stroke="var(--track)" stroke-width="10" fill="none"/>
    <circle cx="64" cy="64" r="${R}" fill="none" stroke-width="10" stroke-linecap="round"
      stroke="${color}" stroke-dasharray="${filled} ${C}" transform="rotate(-90 64 64)"/>
    <text x="64" y="${l2 ? 60 : 64}" text-anchor="middle" class="ring-big">${big}</text>
    <text x="64" y="${l2 ? 78 : 84}" text-anchor="middle" class="ring-small">${l1}</text>
    ${l2 ? `<text x="64" y="90" text-anchor="middle" class="ring-small">${l2}</text>` : ""}
  </svg>`;
}

function timelineHTML(events, now) {
  const d0 = new Date(now); d0.setHours(0, 0, 0, 0);
  const dayStart = d0.getTime(), dayEnd = dayStart + 86400000;
  const pct = (ts) => Math.max(0, Math.min(100, ((ts - dayStart) / 86400000) * 100));
  const segs = events
    .filter((e) => (e.type === "nap" || e.type === "night") && e.start < dayEnd && (e.end || now) > dayStart)
    .map((e) => {
      const s = Math.max(e.start, dayStart), en = Math.min(e.end || now, dayEnd);
      return { left: pct(s), width: pct(en) - pct(s), night: e.type === "night" };
    })
    .filter((x) => x.width > 0.3);
  const feeds = events.filter((e) => ["breast", "bottle", "solid"].includes(e.type) && e.at >= dayStart && e.at < dayEnd).map((e) => pct(e.at));
  return `<div class="timeline" aria-hidden="true">
    <div class="tl-track">
      ${segs.map((s) => `<div class="tl-sleep${s.night ? " night" : ""}" style="left:${s.left}%;width:${s.width}%"></div>`).join("")}
      ${feeds.map((p) => `<div class="tl-feed" style="left:${p}%"></div>`).join("")}
      <div class="tl-now" style="left:${pct(now)}%"></div>
    </div>
    <div class="tl-hours">${[0, 6, 12, 18, 24].map((h) => `<span>${String(h).padStart(2, "0")}</span>`).join("")}</div>
    <div class="tl-legend">
      <span><i class="sw nap"></i>${t("tl_legend_nap")}</span>
      <span><i class="sw night"></i>${t("tl_legend_night")}</span>
      <span><i class="sw feed"></i>${t("tl_legend_feed")}</span>
    </div>
  </div>`;
}

const reasonText = (next) => t("r_" + { routine: "routine", max_naps: "max", window_into_night: "window", first_nap: "first", nap_n: "napn", night_hours: "nighth" }[next.code], next.params);

function heroHTML(f, active) {
  const b = S.store.baby, ui = S.ui;
  if (active) {
    return `<div class="card hero">
      ${ringSVG(1, true)}
      <div class="hero-txt">
        <div class="eyebrow">${typeLabel(active.type)} · ${t("hero_sleeping")}</div>
        <div class="hero-big">${fmtDur(Date.now() - active.start)}</div>
        <button class="btn primary" onclick="NINNA.endSleep(${arg(active.id)})">${t("btn_awake")}</button>
      </div>
    </div>`;
  }
  if (S.logOnly) {
    return `<div class="card hero"><div class="hero-txt">
      <div class="eyebrow">${t("today")}</div>
      <div class="hero-sub">${t("logonly_hint")}</div>
    </div></div>`;
  }
  if (f.lastWake) {
    const s = f.sweetSpot, isNight = f.next.kind === "night", soft = f.profile.maxWeeks <= 8;
    const sub = isNight
      ? t("routine_at", { time: fmtHM(f.bedtime.at - 45 * 60000) })
      : s.center > Date.now() ? t("center_in", { time: fmtHM(s.center) }) : t("window_over", { dur: fmtDur(Date.now() - s.center) });
    return `<div class="card hero">
      <button class="ringtap" onclick="NINNA.togglePressureInfo()" aria-label="${t("pressure_label")}">${ringSVG(f.pressure, false)}</button>
      <div class="hero-txt">
        <div class="eyebrow">${isNight ? t("hero_night") : t("hero_nap")}</div>
        <div class="hero-big">${isNight ? fmtHM(f.bedtime.at) : fmtHM(s.from) + "–" + fmtHM(s.to)}</div>
        <div class="hero-sub">${sub} · ${awakeLabel(Date.now() - f.lastWake)}</div>
        <button class="textbtn" onclick="NINNA.toggleWhy()">${ui.showWhy ? t("why_close") : t("why_open")}</button>
      </div>
      ${isNight && Date.now() >= f.bedtime.at - 45 * 60000 ? `<div class="hero-tip">${t(soft ? "bed_routine_tip_soft" : "bed_routine_tip")}</div>` : ""}
      ${ui.showWhy ? `<div class="explain">${reasonText(f.next)} ${t("why_window", { lo: f.profile.ww[0], hi: f.profile.ww[1] })}
        ${f.window.observedEma
          ? t("why_observed", { name: esc(b.name), ema: f.window.observedEma, conf: Math.round(f.window.confidence * 100), min: f.window.minutes })
          : t("why_default", { min: f.window.minutes })}
        ${t("why_bed", { time: fmtHM(f.bedtime.at) })}</div>` : ""}
      ${ui.showPressureInfo ? `<div class="explain">${t("pressure_info")}</div>` : ""}
    </div>`;
  }
  if (S.store.events.length === 0) {
    return `<div class="card hero"><div class="hero-txt">
      <div class="eyebrow">${t("hero_start")}</div>
      <div class="hero-sub">${t("hero_start_sub", { name: esc(b.name) })}</div>
    </div></div>`;
  }
  return "";
}

/** Righe "da tenere d'occhio": nanna serale prevista e dosi in ripetizione. */
export function alertRows(f, active) {
  const rows = [];
  if (f && !active && !S.logOnly && f.lastWake && f.next.kind === "nap") {
    const soft = f.profile.maxWeeks <= 8;
    rows.push(`<div class="alert">
      <span class="alert-ico">${TYPE_ICONS.night}</span>
      <span class="alert-txt">${t(soft ? "bed_card_soft" : "bed_card")} <b>${fmtHM(f.bedtime.at)}</b>${f.bedtime.earlier ? `<span class="alert-note">${t("bed_earlier")}</span>` : ""}</span>
    </div>`);
  }
  for (const d of doseReminders()) {
    const ready = d.due <= Date.now(), soon = d.due - Date.now() < 30 * 60000;
    const acked = S.ui.ackedDoses[d.name] === d.due;
    const cls = ready ? (acked ? "warn" : "warn pulse") : soon ? "warn" : "";
    const txt = ready ? t("dose_ready", { name: esc(d.name) }) : t("dose_next", { name: esc(d.name), time: `<b>${fmtHM(d.due)}</b>` });
    rows.push(`<button class="alert tap ${cls}" onclick="NINNA.openDose(${arg(d.name)})">
      <span class="alert-ico">${TYPE_ICONS[d.type]}</span><span class="alert-txt">${txt}</span><span class="alert-chev">${ICON.chevron}</span>
    </button>`);
  }
  return rows;
}

function diaryRow(e) {
  const time = e.at != null
    ? fmtHM(e.at)
    : fmtHM(e.start) + (e.end ? "–" + fmtHM(e.end) + " · " + fmtDur(e.end - e.start) : " · " + t("in_progress"));
  return `<button class="diary-row" onclick="NINNA.openEdit(${arg(e.id)})" aria-label="${t("edit_title")}: ${typeLabel(e.type)} ${time}">
    <span class="diary-ico">${TYPE_ICONS[e.type]}</span>
    <span class="diary-txt"><span class="diary-label">${typeLabel(e.type)}</span>${e.note ? `<span class="diary-note">${esc(e.note)}</span>` : ""}</span>
    <span class="diary-time">${time}</span>
    <span class="diary-edit">${ICON.edit}</span>
  </button>`;
}

export function renderOggi(f) {
  const active = activeSleep();
  const today = [...S.store.events]
    .filter((e) => sameDay(e.start || e.at, Date.now()))
    .sort((a, b) => (b.start || b.at) - (a.start || a.at));
  const alerts = alertRows(f, active);
  const k = S.logOnly ? null : f.next.kind;
  const sleepBtn = (kind, text) => `<button class="sleepbtn ${k === kind ? "rec" : ""}" onclick="NINNA.startSleep('${kind}')">
      <span class="sleepbtn-main">${TYPE_ICONS[kind]} ${text}</span>${k === kind ? `<span class="sleepbtn-tag">${t("recommended")}</span>` : ""}
    </button>`;
  const notifAsk = "Notification" in window && Notification.permission === "default";

  return `
    ${!S.logOnly && f.transition.detected ? `<div class="banner">${t("transition", { avg: f.transition.avgNaps, lo: f.transition.expected[0], hi: f.transition.expected[1] })}</div>` : ""}
    ${today.length ? timelineHTML(S.store.events, Date.now()) : ""}
    ${heroHTML(f, active)}
    ${!active ? `<div class="pair">${sleepBtn("nap", t("btn_nap"))}${sleepBtn("night", t("btn_night"))}</div>` : ""}
    ${alerts.length ? `${label(t("zone_alerts"))}<div class="card alerts">${alerts.join("")}</div>` : ""}
    ${label(t("zone_actions"))}
    <div class="grid3">${INSTANT.map((ty) => tile(TYPE_ICONS[ty], typeLabel(ty), `NINNA.logInstant('${ty}')`)).join("")}</div>
    <button class="textbtn center" onclick="NINNA.openSheet('manual')">${ICON.plus} ${t("manual_open")}</button>
    ${label(t("zone_diary"))}
    <div class="card diary">
      ${today.length ? today.map(diaryRow).join("") : `<p class="empty">${t("today_empty")}</p>`}
    </div>
    ${notifAsk ? `<button class="btn ghost block" onclick="NINNA.enableNotifs()">${ICON.bell} ${t("notif_enable")}</button>` : ""}`;
}

/* ========================= STATISTICHE ========================= */

export function renderStat(f) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const ts = Date.now() - i * 86400000;
    const s = dailyStats(S.store.events, ts, profileFor(S.store.baby.birth, ts));
    days.push({ label: new Date(ts).toLocaleDateString(LOCALE(), { weekday: "short" }), total: s.totalMinutes / 60 });
  }
  const st = f.stats, pr = f.profile;
  /* Il grafico non parte da zero: con valori fra 12 e 15 ore le barre da zero
     sembravano tutte uguali. La fascia e' l'intervallo tipico per l'eta'; il
     giorno in corso e' tratteggiato e resta fuori dalla scala. */
  const TRACK = 106;
  const complete = days.slice(0, 6).filter((d) => d.total > 0);
  const dataMax = Math.max(...complete.map((d) => d.total), pr.total[1]);
  const dataMin = complete.length ? Math.min(...complete.map((d) => d.total), pr.total[0]) : pr.total[0];
  const lo = Math.max(0, dataMin - 1.5), hi = dataMax + 0.5;
  const px = (v) => Math.max(3, Math.min(TRACK, Math.round(((v - lo) / (hi - lo)) * TRACK)));
  const bandBottom = Math.round(((pr.total[0] - lo) / (hi - lo)) * TRACK);
  const bandH = Math.round(((pr.total[1] - pr.total[0]) / (hi - lo)) * TRACK);
  const line = (k, v) => `<div class="kv"><span>${k}</span><span>${v}</span></div>`;
  return `
    <div class="card">
      <h2 class="card-title">${t("stat_title")}</h2>
      <div class="chart">
        <div class="chart-vals">${days.map((d, i) => `<span class="${i === 6 ? "dimv" : ""}">${d.total ? d.total.toFixed(1) + "h" : "·"}</span>`).join("")}</div>
        <div class="chart-track">
          <div class="chart-band" style="bottom:${bandBottom}px;height:${bandH}px"></div>
          <div class="chart-bars">${days.map((d, i) => `<div class="cbar ${i === 6 ? "today" : ""}" style="height:${d.total ? px(d.total) : 3}px"></div>`).join("")}</div>
        </div>
        <div class="chart-labels">${days.map((d, i) => `<span>${i === 6 ? t("stat_today_short") : d.label}</span>`).join("")}</div>
      </div>
      <div class="chart-legend"><span class="lg-band"></span>${t("stat_band")}<span class="lg-today"></span>${t("stat_inprogress")}</div>
    </div>
    <div class="card">
      <h2 class="card-title">${t("stat_today")}</h2>
      <p class="muted">${t("stat_today_note")}</p>
      ${line(t("stat_day"), t("stat_rangefmt", { v: Math.round(st.napMinutes / 6) / 10, lo: pr.day[0], hi: pr.day[1] }))}
      ${line(t("stat_night"), t("stat_rangefmt", { v: Math.round(st.nightMinutes / 6) / 10, lo: pr.night[0], hi: pr.night[1] }))}
      ${line(t("stat_naps"), t("count_rangefmt", { v: st.naps, lo: pr.naps[0], hi: pr.naps[1] }))}
      <div class="divider"></div>
      ${line(t("stat_feeds"), `${st.feeds}${st.avgFeedGapMin ? " · " + t("stat_every", { h: Math.round(st.avgFeedGapMin / 6) / 10 }) : ""}`)}
      ${line(t("stat_diapers"), st.diapers)}
      ${line(t("stat_wakes"), st.nightWakes)}
      <p class="muted small">${t("stat_variability")}</p>
    </div>`;
}

/* ============================ SUONI ============================ */

/** Volume e spegnimento automatico: stessa riga in Suoni e in modalita' notte. */
export function soundControls(cls = "") {
  const vol = S.store.prefs.volume ?? 0.4, tm = S.ui.sleepTimerMin;
  return `<div class="sctl ${cls}">
    ${S.sound.startedAt ? `<div class="sctl-elapsed">${elapsedLabel(Date.now() - S.sound.startedAt)}</div>` : ""}
    <div class="sctl-row">
      <span class="sctl-ico">${ICON.volume}</span>
      <input class="sctl-range" type="range" min="0" max="1" step="0.01" value="${vol}" aria-label="${t("volume")}" oninput="NINNA.setVolume(this.value)">
      <span class="sctl-val">${Math.round(vol * 100)}%</span>
      <span class="sctl-sep"></span>
      <span class="sctl-ico">${ICON.clock}</span>
      <select class="sctl-select" aria-label="${t("sleep_timer")}" onchange="NINNA.setSleepTimer(this.value)">
        <option value="0"${tm === 0 ? " selected" : ""}>${t("never")}</option>
        ${[15, 30, 45, 60].map((n) => `<option value="${n}"${tm === n ? " selected" : ""}>${t("timer_min", { n })}</option>`).join("")}
      </select>
    </div>
  </div>`;
}

export function renderSuoni() {
  const on = S.sound.playing;
  return `
    <p class="intro muted">${t("sounds_note")}</p>
    <div class="sounds">
      ${SOUNDS.map((s) => {
        const isOn = s.id === on;
        return `<div class="sound ${isOn ? "on" : ""}">
          <button class="sound-head" onclick="NINNA.playSound('${s.id}')" aria-pressed="${isOn}">
            <span class="sound-txt"><b>${t("sound_" + s.id)}</b><small>${t("sounddesc_" + s.id)}</small></span>
            <span class="sound-btn ${isOn ? "stop" : ""}">${isOn ? STOP : PLAY}</span>
          </button>
          ${isOn ? soundControls() : ""}
        </div>`;
      }).join("")}
    </div>`;
}

/* ============================ TIMER ============================ */

export const TM_R = 104, TM_C = 2 * Math.PI * TM_R;

function tmRing(offset, cls, inner) {
  return `<div class="tm-ring-in ${cls}">
    <svg class="tm-ring" viewBox="0 0 240 240" aria-hidden="true">
      <circle cx="120" cy="120" r="${TM_R}" class="tm-track"/>
      <circle id="tm-prog" cx="120" cy="120" r="${TM_R}" class="tm-prog" style="stroke-dasharray:${TM_C.toFixed(2)};stroke-dashoffset:${offset.toFixed(2)}"/>
    </svg>
    <div class="tm-center">${inner}</div>
  </div>`;
}

export function renderTimer() {
  if (T.run) {
    const left = timerLeft();
    const off = T.done ? 0 : TM_C * (1 - left / T.run.total);
    return `<div class="timer">
      <div class="tm-ring-wrap">${tmRing(off, T.done ? "done" : "running",
        `<div id="tm-digits" class="tm-digits">${fmtMS(left)}</div>
         <div class="tm-sub">${T.done ? t("timer_done") : t("timer_of", { m: Math.round(T.run.total / 60000) })}</div>`)}</div>
      ${T.done
        ? `<button class="btn primary block" onclick="NINNA.stopTimer()">${t("timer_ok")}</button>
           <button class="textbtn center" onclick="NINNA.againTimer()">${t("timer_again")}</button>`
        : `<button class="btn ghost block" onclick="NINNA.stopTimer()">${t("timer_stop")}</button>
           ${"wakeLock" in navigator ? `<p class="muted center small">${t("timer_screen_on")}</p>` : ""}`}
    </div>`;
  }
  const last = S.store.prefs.timerLast || 10;
  return `<div class="timer">
    <button class="tm-ring-wrap tap" onclick="NINNA.startTimer(${last})" aria-label="${t("timer_start")} ${last} min">
      ${tmRing(0, "idle", `<div class="tm-digits">${fmtMS(last * 60000)}</div><div class="tm-sub">${t("timer_tap")}</div>`)}
    </button>
    <div class="tm-presets">
      ${TIMER_PRESETS.map((m) => `<button class="chip ${m === last ? "on" : ""}" onclick="NINNA.startTimer(${m})">${m}<small> min</small></button>`).join("")}
      <button class="chip ${S.ui.showTimerCustom ? "on" : ""}" onclick="NINNA.toggleTimerCustom()">${t("timer_other")}</button>
    </div>
    ${S.ui.showTimerCustom ? `<div class="tm-custom">
      <input id="tm-custom" class="input" type="number" inputmode="numeric" min="1" max="240" placeholder="${t("timer_min_ph")}" onkeydown="if(event.key==='Enter')NINNA.startCustomTimer()">
      <button class="btn ghost" onclick="NINNA.startCustomTimer()">${t("timer_start")}</button>
    </div>` : ""}
    ${label(t("timer_alert"))}
    ${canVibrate
      ? seg([["sound", t("timer_sound")], ["vibe", t("timer_vibe")], ["both", t("timer_both")]], alertMode(), "NINNA.setTimerAlert", "full")
      : `<p class="muted small">${t("timer_sound_only")}</p>`}
  </div>`;
}

/* ===================== SCHEDA DEL BAMBINO ===================== */

export function renderBimbo() {
  const b = S.store.baby, w = ageWeeks(b.birth);
  const growth = [...S.store.growth].sort((a, c) => c.date.localeCompare(a.date));
  const last = growth[0];
  const health = S.store.events.filter((e) => HEALTH.includes(e.type)).sort((a, c) => c.at - a.at).slice(0, 3);

  const stat = (k, v, unit) => `<div class="metric"><span class="metric-k">${k}</span><span class="metric-v">${v != null ? v : "—"}${v != null ? `<small> ${unit}</small>` : ""}</span></div>`;

  return `
    <div class="card profile">
      <div class="profile-main">
        <div class="profile-name">${esc(b.name)}</div>
        <div class="profile-sub">${t(b.sex === "f" ? "born_f" : b.sex === "m" ? "born_m" : "born_x", { date: fmtDate(b.birth, { day: "numeric", month: "long", year: "numeric" }) })} · ${ageLabel(w)}</div>
      </div>
      <button class="btn ghost sm" onclick="NINNA.openPage('profile')">${ICON.edit} ${t("edit")}</button>
    </div>

    ${label(t("salute"))}
    <div class="grid3">
      ${tile(TYPE_ICONS.vitamins, typeLabel("vitamins"), "NINNA.logInstant('vitamins')")}
      ${tile(TYPE_ICONS.med, typeLabel("med"), "NINNA.logInstant('med')")}
      ${tile(ICON.pharmacy, t("pharmacy_tile"), "NINNA.openSheet('pharmacy')")}
    </div>
    ${health.length ? `<div class="card diary slim">
      <div class="card-kicker">${t("health_last")}</div>
      ${health.map((e) => `<button class="diary-row" onclick="NINNA.openEdit(${arg(e.id)})">
        <span class="diary-ico">${TYPE_ICONS[e.type]}</span>
        <span class="diary-txt"><span class="diary-label">${e.note ? esc(e.note) : typeLabel(e.type)}</span>${e.repeatH ? `<span class="diary-note">${t("health_every", { h: e.repeatH })}</span>` : ""}</span>
        <span class="diary-time">${sameDay(e.at, Date.now()) ? fmtHM(e.at) : new Date(e.at).toLocaleDateString(LOCALE(), { day: "2-digit", month: "short" }) + " " + fmtHM(e.at)}</span>
        <span class="diary-edit">${ICON.edit}</span>
      </button>`).join("")}
    </div>` : ""}

    ${label(t("growth"))}
    <div class="card growth-card">
      ${last ? `<div class="metrics">
          ${stat(t("growth_w_short"), last.weight, "kg")}
          ${stat(t("growth_h_short"), last.height, "cm")}
          ${stat(t("growth_head_short_cap"), last.head, "cm")}
        </div>
        <div class="muted small">${t("growth_measured", { date: fmtDate(last.date, { day: "numeric", month: "long" }) })}</div>`
      : `<p class="empty">${t("growth_none_long")}</p>`}
      <div class="card-actions">
        <button class="btn primary sm" onclick="NINNA.openSheet('growth')">${ICON.plus} ${t("growth_add")}</button>
        ${growth.length ? `<button class="textbtn" onclick="NINNA.openPage('growth')">${t("growth_history_link")} ${ICON.chevron}</button>` : ""}
      </div>
    </div>

    ${label(t("more"))}
    <div class="group-card">
      ${row({ icon: ICON.lock, label: t("docs_open"), sub: t("docs_row_sub"), onclick: "NINNA.openPage('docs')" })}
      ${S.logOnly ? "" : row({ icon: ICON.report, label: t("report"), sub: t("report_row_sub"), onclick: "NINNA.openPage('report')" })}
      ${row({ icon: ICON.book, label: t("guide_title"), sub: t("guide_row_sub", { n: I18N[S.lang].articles.length }), onclick: "NINNA.openPage('guide')" })}
    </div>`;
}

/* ========================= PRIMO AVVIO ========================= */

export function renderOnboarding() {
  return `<div class="onboard">
    <img class="brandmark" src="icons/brandmark.png" alt="" width="96" height="96">
    <h1 class="onboard-title">Ninna<span class="wm-dot">.</span></h1>
    <p class="muted">${t("ob_title_sub")}<br>${t("ob_sub2")}</p>
    <div class="card form">
      <label class="field"><span>${t("ob_name")}</span><input id="ob-name" class="input" placeholder="${t("ob_name_ph")}" autocomplete="off" maxlength="40"></label>
      <label class="field"><span>${t("ob_birth")}</span><input id="ob-birth" class="input" type="date"></label>
      <button class="btn primary block" onclick="NINNA.saveBaby()">${t("ob_start")}</button>
    </div>
    ${seg([["it", "Italiano"], ["en", "English"]], S.lang, "NINNA.setLang", "center")}
    <p class="fineprint">${t("footer1")}</p>
  </div>`;
}

export { TAB_ICONS };
