/* ============================================================
   NINNA · componenti di interfaccia
   Pochi mattoni, usati ovunque nello stesso modo: intestazione delle
   pagine (indietro + chiudi), foglio dal basso, gruppi di righe,
   selettori. Se un elemento si ripete, nasce qui e non nelle viste.
   ============================================================ */
import { t, esc } from "./state.js";
import { ICON } from "./icons.js";

/** Intestazione unica delle pagine: indietro a sinistra, titolo, chiudi a destra.
    Indietro torna al livello precedente; chiudi riporta direttamente alle schede. */
export const pageHead = (title, extra = "") => `
  <header class="pagehead">
    <button class="iconbtn" onclick="NINNA.back()" aria-label="${t("nav_back")}">${ICON.back}</button>
    <h1 class="pagetitle">${title}</h1>
    ${extra || `<button class="iconbtn" onclick="NINNA.closeAll()" aria-label="${t("nav_close")}">${ICON.close}</button>`}
  </header>`;

/** Pagina a tutto schermo. */
export const page = (id, title, body, cls = "") => `
  <div class="page ${cls}" data-page="${id}">
    ${pageHead(title)}
    <div class="page-body">${body}</div>
  </div>`;

/** Foglio dal basso: per scelte brevi e moduli. Chiude con la X, toccando fuori o con indietro. */
export const sheet = (title, body, icon = "") => `
  <div class="sheet-wrap" onclick="NINNA.back()">
    <div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(stripTags(title))}" onclick="event.stopPropagation()">
      <div class="sheet-grip" aria-hidden="true"></div>
      <div class="sheet-head">
        <div class="sheet-title">${icon ? `<span class="sheet-ico">${icon}</span>` : ""}${title}</div>
        <button class="iconbtn sm" onclick="NINNA.back()" aria-label="${t("nav_close")}">${ICON.close}</button>
      </div>
      <div class="sheet-body">${body}</div>
    </div>
  </div>`;

function stripTags(s) { return String(s).replace(/<[^>]*>/g, ""); }

/** Gruppo di righe con titolo, come in un pannello di sistema. */
export const group = (title, rows, note = "") => `
  <section class="group">
    ${title ? `<h2 class="group-title">${title}</h2>` : ""}
    <div class="group-card">${rows}</div>
    ${note ? `<p class="group-note">${note}</p>` : ""}
  </section>`;

/** Riga toccabile: icona, testo, eventuale sottotesto, valore o freccia. */
export const row = ({ icon = "", label, sub = "", value = "", onclick = "", tone = "", chevron = true, tag = "button", attrs = "" }) => `
  <${tag} class="row ${tone}" ${onclick ? `onclick="${onclick}"` : ""} ${attrs}>
    ${icon ? `<span class="row-ico">${icon}</span>` : ""}
    <span class="row-txt"><span class="row-label">${label}</span>${sub ? `<span class="row-sub">${sub}</span>` : ""}</span>
    ${value ? `<span class="row-value">${value}</span>` : ""}
    ${chevron ? `<span class="row-chev">${ICON.chevron}</span>` : ""}
  </${tag}>`;

/** Riga con interruttore vero, al posto del vecchio pallino finto. */
export const switchRow = ({ icon = "", label, sub = "", on, onclick }) => `
  <button class="row" role="switch" aria-checked="${on}" onclick="${onclick}">
    ${icon ? `<span class="row-ico">${icon}</span>` : ""}
    <span class="row-txt"><span class="row-label">${label}</span>${sub ? `<span class="row-sub">${sub}</span>` : ""}</span>
    <span class="switch ${on ? "on" : ""}" aria-hidden="true"><span></span></span>
  </button>`;

/** Selettore a segmenti (tema, lingua, avviso del timer...). */
export const seg = (options, current, handler, cls = "") => `
  <div class="seg ${cls}" role="radiogroup">
    ${options.map(([k, label]) => `<button class="seg-opt ${k === current ? "on" : ""}" role="radio" aria-checked="${k === current}" onclick="${handler}(${esc(JSON.stringify(k))})">${label}</button>`).join("")}
  </div>`;

/** Riga di impostazione con etichetta a sinistra e controllo a destra o sotto. */
export const ctlRow = (icon, label, control) => `
  <div class="row static">
    <span class="row-ico">${icon}</span>
    <span class="row-txt"><span class="row-label">${label}</span></span>
  </div>
  <div class="row-ctl">${control}</div>`;

/** Etichetta di sezione dentro le schede. */
export const label = (text, extra = "") => `<h2 class="seclabel">${text}${extra}</h2>`;

/** Piastrella delle azioni rapide. */
export const tile = (icon, text, onclick) => `
  <button class="tile" onclick="${onclick}"><span class="tile-ico">${icon}</span><span class="tile-txt">${text}</span></button>`;
