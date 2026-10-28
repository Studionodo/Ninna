/* ============================================================
   NINNA · fogli dal basso
   Moduli e scelte brevi. Tutti con titolo e X, si chiudono anche
   toccando fuori o con il tasto indietro del telefono.
   ============================================================ */
import { S, t, esc, arg, typeLabel, fmtHM, hmOf, isoDay, HEALTH, doseReminders } from "./state.js";
import { TYPE_ICONS, ICON } from "./icons.js";
import { sheet } from "./ui.js";

const REPEATS = [4, 6, 8, 12, 24];
const repeatSelect = (id, current = 0) => `<select id="${id}" class="input">
    <option value="0"${!current ? " selected" : ""}>${t("health_repeat_none")}</option>
    ${REPEATS.map((h) => `<option value="${h}"${current === h ? " selected" : ""}>${t("health_repeat_in", { h })}</option>`).join("")}
  </select>`;

/* farmaci e integratori hanno bisogno di un nome; quelli gia' usati
   diventano scorciatoie, cosi' il caso frequente resta a due tocchi */
function healthSheet({ type }) {
  const recent = [...new Set(S.store.events.filter((e) => e.type === type && e.note).sort((a, b) => b.at - a.at).map((e) => e.note))].slice(0, 4);
  return sheet(typeLabel(type), `
    ${recent.length ? `<div class="field"><span>${t("health_recent")}</span>
      <div class="chips">${recent.map((r) => `<button class="chip" onclick="NINNA.saveHealth('${type}', ${arg(r)})">${esc(r)}</button>`).join("")}</div></div>` : ""}
    <label class="field"><span>${t("health_which")}</span>
      <input id="h-name" class="input" placeholder="${t("health_ph_" + type)}" autocomplete="off" maxlength="60"></label>
    <label class="field"><span>${t("health_repeat")}</span>${repeatSelect("h-repeat")}</label>
    <button class="btn primary block" onclick="NINNA.saveHealth('${type}')">${t("save")}</button>
    <button class="textbtn center" onclick="NINNA.saveHealth('${type}', '')">${t("health_skip")}</button>`, TYPE_ICONS[type]);
}

function editSheet({ id }) {
  const e = S.store.events.find((x) => x.id === id);
  if (!e) return "";
  const dur = e.start != null, isHealth = HEALTH.includes(e.type);
  return sheet(typeLabel(e.type), `
    <label class="field"><span>${t("edit_date")}</span><input type="date" id="e-date" class="input" value="${isoDay(dur ? e.start : e.at)}" max="${isoDay()}"></label>
    ${dur ? `<div class="pair">
        <label class="field"><span>${t("manual_start")}</span><input type="time" id="e-start" class="input" value="${hmOf(e.start)}"></label>
        ${e.end ? `<label class="field"><span>${t("manual_end")}</span><input type="time" id="e-end" class="input" value="${hmOf(e.end)}"></label>` : ""}
      </div>`
      : `<label class="field"><span>${t("edit_time")}</span><input type="time" id="e-at" class="input" value="${hmOf(e.at)}"></label>`}
    ${dur ? "" : `<label class="field"><span>${isHealth ? t("health_which") : t("note_label")}</span>
      <input id="e-note" class="input" value="${esc(e.note || "")}" placeholder="${t((isHealth ? "health_ph_" : "note_ph_") + e.type)}" autocomplete="off" maxlength="80"></label>`}
    ${!dur && isHealth ? `<label class="field"><span>${t("health_repeat")}</span>${repeatSelect("e-repeat", e.repeatH || 0)}</label>` : ""}
    <button class="btn primary block" onclick="NINNA.saveEdit(${arg(e.id)})">${t("save")}</button>
    <button class="textbtn center danger" onclick="NINNA.deleteEvent(${arg(e.id)})">${ICON.trash} ${t("delete_entry")}</button>`, TYPE_ICONS[e.type]);
}

function manualSheet() {
  return sheet(t("manual_title"), `
    <div class="field"><span>${t("manual_type")}</span>
      <div class="seg full" role="radiogroup" id="m-kind" data-v="nap">
        <button class="seg-opt on" onclick="NINNA.pickManualKind(this, 'nap')">${TYPE_ICONS.nap} ${typeLabel("nap")}</button>
        <button class="seg-opt" onclick="NINNA.pickManualKind(this, 'night')">${TYPE_ICONS.night} ${typeLabel("night")}</button>
      </div></div>
    <div class="pair">
      <label class="field"><span>${t("manual_start")}</span><input type="time" id="m-start" class="input" value="13:00"></label>
      <label class="field"><span>${t("manual_end")}</span><input type="time" id="m-end" class="input" value="14:00"></label>
    </div>
    <p class="muted small">${t("manual_hint")}</p>
    <button class="btn primary block" onclick="NINNA.addManual()">${t("save")}</button>`, ICON.plus);
}

/* Non un sito fisso: una ricerca mirata. Nessun aggregatore copre bene
   ogni comune, quindi lasciamo scegliere alla ricerca la fonte piu'
   aggiornata. Zero server, zero dati che passano da Ninna. */
function pharmacySheet() {
  const last = S.store.prefs.pharmacyTown || "";
  return sheet(t("pharmacy_tile"), `
    <label class="field"><span>${t("pharmacy_town")}</span>
      <input id="pharm-town" class="input" value="${esc(last)}" placeholder="${t("pharmacy_ph")}" autocomplete="off" maxlength="60"
        onkeydown="if(event.key==='Enter')NINNA.searchPharmacy()"></label>
    <p class="muted small">${t("pharmacy_hint")}</p>
    <button class="btn primary block" onclick="NINNA.searchPharmacy()">${t("pharmacy_search")}</button>`, ICON.pharmacy);
}

function doseSheet({ name }) {
  const d = doseReminders().find((x) => x.name === name);
  if (!d) return "";
  const ready = d.due <= Date.now();
  return sheet(esc(name), `
    <p class="muted">${t("dose_last_at", { time: fmtHM(d.lastAt) })}</p>
    <p class="sheet-lead">${ready ? t("dose_ready", { name: esc(name) }) : t("dose_next", { name: esc(name), time: `<b>${fmtHM(d.due)}</b>` })}</p>
    <button class="btn primary block" onclick="NINNA.logDoseAgain(${arg(name)}, true)">${t("dose_log_repeat", { h: d.repeatH })}</button>
    <button class="btn ghost block" onclick="NINNA.logDoseAgain(${arg(name)}, false)">${t("dose_log_stop")}</button>`, TYPE_ICONS[d.type]);
}

function nightPromptSheet() {
  return sheet(t("night_prompt_title"), `
    <p class="sheet-lead">${t("night_prompt_body")}</p>
    <button class="btn primary block" onclick="NINNA.acceptNightPrompt()">${t("night_prompt_yes")}</button>
    <button class="textbtn center" onclick="NINNA.back()">${t("night_prompt_no")}</button>`, TYPE_ICONS.night);
}

// nel campo il decimale si mostra come lo si scrive: virgola in italiano
const fmtNum = (n) => (n === "" ? "" : S.lang === "it" ? String(n).replace(".", ",") : String(n));

function growthSheet({ id } = {}) {
  const g = id ? S.store.growth.find((x) => x.id === id) : null;
  const v = (k) => (g && g[k] ? g[k] : "");
  return sheet(g ? t("growth_edit") : t("growth_add"), `
    <label class="field"><span>${t("growth_date")}</span><input type="date" id="g-date" class="input" value="${g ? g.date : isoDay()}" max="${isoDay()}"></label>
    <div class="pair">
      <label class="field"><span>${t("growth_weight")}</span><input type="text" inputmode="decimal" autocomplete="off" id="g-weight" class="input" value="${fmtNum(v("weight"))}" placeholder="—"></label>
      <label class="field"><span>${t("growth_height")}</span><input type="text" inputmode="decimal" autocomplete="off" id="g-height" class="input" value="${fmtNum(v("height"))}" placeholder="—"></label>
    </div>
    <label class="field"><span>${t("growth_head")}</span><input type="text" inputmode="decimal" autocomplete="off" id="g-head" class="input" value="${fmtNum(v("head"))}" placeholder="—"></label>
    <p class="muted small">${t("growth_save_hint")}</p>
    <button class="btn primary block" onclick="NINNA.saveGrowth(${g ? arg(g.id) : ""})">${t("save")}</button>
    ${g ? `<button class="textbtn center danger" onclick="NINNA.deleteGrowth(${arg(g.id)})">${ICON.trash} ${t("growth_delete")}</button>` : ""}`, ICON.growth);
}

function pinSheet() {
  return sheet(t("docs_pin_change"), `
    <label class="field"><span>${t("docs_pin_new")}</span>
      <input class="pin" id="new-pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="····"
        onkeydown="if(event.key==='Enter')NINNA.saveDocsPin()"></label>
    <button class="btn primary block" onclick="NINNA.saveDocsPin()">${t("save")}</button>`, ICON.lock);
}

/** Conferma generica: sostituisce i confirm() del browser, che su Android
    hanno l'aspetto di un errore di sistema. */
function confirmSheet({ title, body, action, label, danger }) {
  return sheet(title, `
    ${body ? `<p class="sheet-lead">${body}</p>` : ""}
    <button class="btn ${danger ? "danger" : "primary"} block" onclick="${action}">${label}</button>
    <button class="textbtn center" onclick="NINNA.back()">${t("cancel")}</button>`);
}

export const SHEETS = {
  health: healthSheet,
  edit: editSheet,
  manual: manualSheet,
  pharmacy: pharmacySheet,
  dose: doseSheet,
  nightprompt: nightPromptSheet,
  growth: growthSheet,
  pin: pinSheet,
  confirm: confirmSheet,
};
