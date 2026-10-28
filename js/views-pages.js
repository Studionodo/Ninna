/* ============================================================
   NINNA · pagine a tutto schermo
   Tutte con la stessa intestazione: indietro, titolo, chiudi.
   ============================================================ */
import { dailyStats, profileFor, ageWeeks } from "./engine.js";
import { I18N } from "./i18n.js";
import {
  S, t, esc, arg, typeLabel, fmtHM, fmtDate, LOCALE, INSTANT, DOC_TYPES, growthSummary, ageLabel, isoDay,
} from "./state.js";
import { ICON } from "./icons.js";
import { page, pageHead, group, row, switchRow, seg, ctlRow } from "./ui.js";

export const APP_VERSION = "2.20.0";
const KOFI = "https://ko-fi.com/istantelabs/tip";
const GITHUB = "https://github.com/Studionodo";

/* ======================== IMPOSTAZIONI ======================== */

function notifState() {
  if (!("Notification" in window)) return { label: t("notif_unsupported"), action: "" };
  const p = Notification.permission;
  if (p === "granted") return { label: t("notif_state_on"), action: "" };
  if (p === "denied") return { label: t("notif_state_denied"), action: "" };
  return { label: t("notif_state_off"), action: "NINNA.enableNotifs()" };
}

function settingsPage() {
  const b = S.store.baby, n = notifState();
  const body = `
    ${group(t("set_child"), row({
      icon: ICON.person, label: esc(b.name),
      sub: `${fmtDate(b.birth, { day: "numeric", month: "long", year: "numeric" })} · ${ageLabel(ageWeeks(b.birth))}`,
      onclick: "NINNA.openPage('profile')",
    }))}

    ${group(t("appearance"), `
      ${ctlRow(ICON.theme, t("theme"), seg([["light", t("theme_light")], ["dark", t("theme_dark")], ["auto", t("theme_auto")]], S.theme, "NINNA.setTheme", "full"))}
      ${ctlRow(ICON.lang, t("language"), seg([["it", "Italiano"], ["en", "English"]], S.lang, "NINNA.setLang", "full"))}
    `)}

    ${group(t("set_prefs"), `
      ${switchRow({ icon: ICON.eyeoff, label: t("logonly"), sub: t("logonly_sub"), on: S.logOnly, onclick: "NINNA.toggleLogOnly()" })}
      ${row({ icon: ICON.bell, label: t("notif_title"), sub: t("notif_sub"), value: n.label, onclick: n.action, chevron: !!n.action, tag: n.action ? "button" : "div" })}
    `, t("logonly_desc"))}

    ${group(t("set_data"), `
      ${row({ icon: ICON.download, label: t("backup_json"), sub: t("backup_sub"), onclick: "NINNA.exportJSONFile()" })}
      <label class="row" tabindex="0">
        <span class="row-ico">${ICON.upload}</span>
        <span class="row-txt"><span class="row-label">${t("import_json")}</span><span class="row-sub">${t("import_sub")}</span></span>
        <span class="row-chev">${ICON.chevron}</span>
        <input type="file" accept="application/json,.json" hidden onchange="NINNA.importJSONFile(this)">
      </label>
      ${row({ icon: ICON.table, label: t("export_csv"), sub: t("csv_sub"), onclick: "NINNA.exportCSVFile()" })}
    `, t("data_note"))}

    ${group(t("set_info"), `
      ${row({ icon: ICON.info, label: t("about_link"), onclick: "NINNA.openPage('about')" })}
      ${row({ icon: ICON.cup, label: t("coffee"), sub: "Ko-fi", tag: "a", chevron: false, attrs: `href="${KOFI}" target="_blank" rel="noopener"` })}
    `)}

    ${group(t("set_danger"), row({
      icon: ICON.trash, label: t("wipe"), sub: t("wipe_sub"), tone: "danger", onclick: "NINNA.askWipe()",
    }))}

    <p class="fineprint">Ninna v${APP_VERSION}<br>${t("footer1")}<br>${t("footer2")} · <a href="${GITHUB}" target="_blank" rel="noopener">GitHub</a></p>`;
  return page("settings", t("settings"), body);
}

/* ========================== PROFILO ========================== */

function profilePage() {
  const b = S.store.baby;
  const body = `
    <div class="card form">
      <label class="field"><span>${t("profile_name")}</span>
        <input id="p-name" class="input" value="${esc(b.name)}" maxlength="40" autocomplete="off"></label>
      <label class="field"><span>${t("profile_birth")}</span>
        <input id="p-birth" class="input" type="date" value="${b.birth}" max="${isoDay()}"></label>
      <p class="muted small">${t("profile_birth_hint")}</p>
      <div class="field"><span>${t("growth_sex")}</span>
        ${seg([["m", t("growth_male")], ["f", t("growth_female")]], S.ui.pendingSex ?? b.sex ?? "", "NINNA.setSex", "full sexseg")}
      </div>
      <p class="muted small">${t("sex_hint")}</p>
    </div>
    <button class="btn primary block" onclick="NINNA.saveProfile()">${t("save")}</button>`;
  return page("profile", t("profile_title"), body);
}

/* ========================== CRESCITA ========================== */

function growthPage() {
  const list = [...S.store.growth].sort((a, b) => b.date.localeCompare(a.date));
  const trend = [...S.store.growth].filter((g) => g.weight).sort((a, b) => a.date.localeCompare(b.date)).slice(-8);
  const maxW = Math.max(...trend.map((g) => g.weight), 0.1);
  const minW = Math.min(...trend.map((g) => g.weight), maxW);
  const lo = Math.max(0, minW - (maxW - minW) * 0.6 - 0.3);
  const h = (w) => Math.round(12 + ((w - lo) / (maxW - lo)) * 88);
  const body = `
    ${trend.length >= 2 ? `<div class="card">
      <h2 class="card-title">${t("growth_trend")}</h2>
      <div class="wbars">${trend.map((g) => `<div class="wbar-col">
          <span class="wbar-v">${g.weight}</span>
          <span class="wbar" style="height:${h(g.weight)}%"></span>
          <span class="wbar-d">${fmtDate(g.date, { day: "2-digit", month: "2-digit" })}</span>
        </div>`).join("")}</div>
    </div>` : ""}
    <button class="btn primary block" onclick="NINNA.openSheet('growth')">${ICON.plus} ${t("growth_add")}</button>
    ${list.length ? `<h2 class="seclabel">${t("growth_history")}</h2>
    <div class="group-card">
      ${list.map((g) => row({
        icon: ICON.growth,
        label: fmtDate(g.date, { day: "numeric", month: "long", year: "numeric" }),
        sub: growthSummary(g), onclick: `NINNA.openSheet('growth', ${arg({ id: g.id })})`,
        value: ICON.edit, chevron: false,
      })).join("")}
    </div>` : `<p class="empty">${t("growth_none_long")}</p>`}
    <p class="muted small">${t("growth_note")}</p>`;
  return page("growth", t("growth"), body);
}

/* ========================= DOCUMENTI ========================= */

function docsSize() {
  const c = S.ui.docsCache;
  const bytes = DOC_TYPES.reduce((n, ty) => n + (c[ty] ? c[ty].dataUrl.length * 0.75 : 0), 0);
  return bytes < 1048576 ? Math.max(1, Math.round(bytes / 1024)) + " KB" : (bytes / 1048576).toFixed(1) + " MB";
}

function docsPage() {
  if (!S.ui.docsUnlocked) {
    const first = !S.store.prefs.docsPin;
    return page("docs", t("docs_title"), `
      <div class="lock">
        <div class="lock-mark">${ICON.lock}</div>
        <h2 class="lock-title">${t(first ? "docs_pin_set" : "docs_pin_ask")}</h2>
        <p class="muted">${t("docs_pin_hint")}</p>
        <input class="pin" id="doc-pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="····"
          onkeydown="if(event.key==='Enter')NINNA.submitDocsPin()">
        <button class="btn primary block narrow" onclick="NINNA.submitDocsPin()">${t(first ? "save" : "docs_unlock")}</button>
      </div>`);
  }
  const c = S.ui.docsCache;
  const body = `
    <p class="lead">${t("docs_intro")}</p>
    ${DOC_TYPES.map((ty) => {
      const d = c[ty];
      return `<section class="doc">
        <div class="doc-head">
          <h2 class="doc-name">${t("doc_" + ty)}</h2>
          <span class="doc-state">${d ? t("docs_added", { date: new Date(d.addedAt).toLocaleDateString(LOCALE()) }) : t("docs_empty")}</span>
        </div>
        ${d
          ? `<button class="doc-thumb" onclick="NINNA.openPage('docview', ${arg({ type: ty })})" aria-label="${t("doc_" + ty)}"><img src="${d.dataUrl}" alt=""></button>
             <div class="doc-actions">
               <button class="textbtn" onclick="NINNA.pickDoc('${ty}')">${t("docs_replace")}</button>
               <button class="textbtn danger" onclick="NINNA.askDeleteDoc('${ty}')">${t("docs_delete_one")}</button>
             </div>`
          : `<button class="doc-empty" onclick="NINNA.pickDoc('${ty}')">${ICON.camera}<span>${t("docs_scan")}</span></button>`}
      </section>`;
    }).join("")}
    <div class="divider"></div>
    <p class="muted small">${t("docs_space", { size: docsSize() })}</p>
    <p class="muted small">${t("docs_note")}</p>
    <button class="btn ghost block" onclick="NINNA.openSheet('pin')">${t("docs_pin_change")}</button>`;
  return page("docs", t("docs_title"), body);
}

function docViewPage(p) {
  const d = S.ui.docsCache[p.type];
  return `<div class="page docview" data-page="docview">
    ${pageHead(t("doc_" + p.type))}
    <div class="docview-body">${d ? `<img src="${d.dataUrl}" alt="${t("doc_" + p.type)}">` : ""}</div>
  </div>`;
}

/* ===================== RIEPILOGO PEDIATRA ===================== */

export function reportHTML(days = 14) {
  const b = S.store.baby, events = S.store.events;
  const rows = [];
  let sDay = 0, sNight = 0, sNaps = 0, sWakes = 0, sFeeds = 0, sDiap = 0, counted = 0;
  const hm = (m) => `${Math.floor(m / 60)}h ${String(Math.round(m % 60)).padStart(2, "0")}m`;
  for (let i = days - 1; i >= 0; i--) {
    const ts = Date.now() - i * 86400000;
    const st = dailyStats(events, ts, profileFor(b.birth, ts));
    if (st.totalMinutes === 0 && st.feeds === 0 && st.diapers === 0) continue;
    counted++;
    sDay += st.napMinutes; sNight += st.nightMinutes; sNaps += st.naps;
    sWakes += st.nightWakes; sFeeds += st.feeds; sDiap += st.diapers;
    rows.push(`<tr><td>${new Date(ts).toLocaleDateString(LOCALE(), { day: "2-digit", month: "2-digit" })}</td>
      <td>${hm(st.napMinutes)}</td><td>${hm(st.nightMinutes)}</td><td><b>${hm(st.totalMinutes)}</b></td>
      <td>${st.naps}</td><td>${st.nightWakes}</td><td>${st.feeds}</td><td>${st.diapers}</td></tr>`);
  }
  const n = Math.max(1, counted), pr = profileFor(b.birth), cutoff = Date.now() - days * 86400000;
  const healthList = (ty) => {
    const evs = events.filter((e) => e.type === ty && e.at >= cutoff);
    if (!evs.length) return null;
    const byName = {};
    evs.forEach((e) => { const k = e.note || "-"; byName[k] = (byName[k] || 0) + 1; });
    return Object.entries(byName).map(([k, c]) => `${esc(k)} (${c})`).join(", ");
  };
  const vit = healthList("vitamins"), med = healthList("med");
  const notes = events.filter((e) => INSTANT.includes(e.type) && e.note && e.at >= cutoff).sort((a, c) => a.at - c.at);
  const growth = [...S.store.growth].sort((a, c) => a.date.localeCompare(c.date));
  return `
    <h2 class="report-title">${t("report_title")}</h2>
    <p class="report-meta">
      <b>${t("report_child")}:</b> ${esc(b.name)} · <b>${t("report_age")}:</b> ${Math.floor(ageWeeks(b.birth))} ${t("u_weeks")}<br>
      <b>${t("report_period")}:</b> ${counted} ${t("u_days")} · <b>${t("report_generated")}:</b> ${new Date().toLocaleString(LOCALE())}<br>
      ${t("stat_target", { lo: pr.total[0], hi: pr.total[1], nlo: pr.naps[0], nhi: pr.naps[1] })}
    </p>
    <div class="table-wrap"><table class="report-table">
      <thead><tr><th>${t("report_day")}</th><th>${t("report_daysleep")}</th><th>${t("report_nightsleep")}</th><th>${t("report_tot")}</th>
        <th>${t("report_naps")}</th><th>${t("report_wakes")}</th><th>${t("report_feeds")}</th><th>${t("report_diapers")}</th></tr></thead>
      <tbody>${rows.join("") || `<tr><td colspan="8">${t("report_empty")}</td></tr>`}</tbody>
      <tfoot><tr><td>${t("report_avg")}</td><td>${hm(sDay / n)}</td><td>${hm(sNight / n)}</td><td>${hm((sDay + sNight) / n)}</td>
        <td>${(sNaps / n).toFixed(1)}</td><td>${(sWakes / n).toFixed(1)}</td><td>${(sFeeds / n).toFixed(1)}</td><td>${(sDiap / n).toFixed(1)}</td></tr></tfoot>
    </table></div>
    ${vit || med ? `<p class="report-meta"><b>${t("report_health")}</b><br>${vit ? `${typeLabel("vitamins")}: ${vit}<br>` : ""}${med ? `${typeLabel("med")}: ${med}` : ""}</p>` : ""}
    ${notes.length ? `<p class="report-meta"><b>${t("report_notes")}</b><br>${notes.map((e) => `${new Date(e.at).toLocaleDateString(LOCALE(), { day: "2-digit", month: "2-digit" })} ${fmtHM(e.at)} · ${typeLabel(e.type)}: ${esc(e.note)}`).join("<br>")}</p>` : ""}
    ${growth.length ? `<p class="report-meta"><b>${t("report_growth")}</b>${b.sex ? ` · ${b.sex === "m" ? t("growth_male") : t("growth_female")}` : ""}<br>${growth.map((g) => `${fmtDate(g.date)}: ${growthSummary(g)}`).join("<br>")}</p>` : ""}
    <p class="report-note">${t("report_note")}<br>${t("stat_variability")}</p>`;
}

function reportPage() {
  return `<div class="page" data-page="report">
    ${pageHead(t("report_short"))}
    <div class="page-body">
      <button class="btn primary block no-print" onclick="window.print()">${ICON.printer} ${t("report_print")}</button>
      <div id="print-area">${reportHTML(14)}</div>
    </div>
  </div>`;
}

/* ======================== COS'E' NINNA ======================== */

function aboutPage() {
  const body = `
    <div class="about-head">
      <div class="about-mark">Ninna<span class="wm-dot">.</span></div>
      <p class="about-tag">${t("ob_title_sub")}</p>
    </div>
    ${I18N[S.lang].about.map((p) => `<p class="prose">${p}</p>`).join("")}
    <a class="coffee" href="${KOFI}" target="_blank" rel="noopener">${ICON.cup}<span>${t("coffee")}</span></a>
    <p class="fineprint">${t("footer1")}<br>${t("footer2")} · <a href="${GITHUB}" target="_blank" rel="noopener">GitHub</a></p>`;
  return page("about", t("about_link"), body);
}

/* =========================== GUIDA =========================== */

function guidePage() {
  const { cats, articles } = I18N[S.lang];
  const open = S.ui.openArticle;
  const body = cats.map((c) => `
    <h2 class="seclabel">${c.label}</h2>
    <div class="articles">
      ${articles.filter((a) => a.cat === c.id).map((a) => `
        <div class="article ${open === a.id ? "open" : ""}">
          <button class="article-head" onclick="NINNA.toggleArticle(${arg(a.id)})" aria-expanded="${open === a.id}">
            <span class="article-title">${a.t}</span>
            <span class="article-min">${t("read_min", { n: a.min })}</span>
          </button>
          ${open === a.id ? `<p class="article-body">${a.b}</p>` : ""}
        </div>`).join("")}
    </div>`).join("") + `<p class="muted small">${t("guide_disclaimer")}</p>`;
  return page("guide", t("guide_title"), body);
}

export const PAGES = {
  settings: settingsPage,
  profile: profilePage,
  growth: growthPage,
  docs: docsPage,
  docview: docViewPage,
  report: reportPage,
  about: aboutPage,
  guide: guidePage,
};
