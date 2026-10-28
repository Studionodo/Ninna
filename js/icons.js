/* ============================================================
   NINNA · icone
   Un solo disegnatore: tratto 1.6, estremi arrotondati, currentColor.
   Tutte le icone dell'app vivono qui, nessun SVG sparso nelle viste.
   ============================================================ */

const svg = (paths, size = "1em", sw = 1.6) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" class="ico" aria-hidden="true">${paths}</svg>`;

/* --- tipi di registrazione (disegni invariati dalla v2) --- */
export const TYPE_ICONS = {
  nap: svg('<path d="M6.5 17.2h10.2a3 3 0 0 0 .3-6 4.6 4.6 0 0 0-8.7-1.5A3.4 3.4 0 0 0 6.5 17.2z"/>'),
  night: svg('<path d="M17.2 13.8A7 7 0 1 1 10.2 3.3a5.6 5.6 0 0 0 7 10.5z"/>'),
  breast: svg('<path d="M12 20s-7.2-4.4-9.4-8.8A5 5 0 0 1 12 6.3a5 5 0 0 1 9.4 4.9C19.2 15.6 12 20 12 20z"/>'),
  bottle: svg('<path d="M10.2 3.5h3.6M10.7 3.5v2c0 .6-.4 1-.9 1.3-.9.5-1.5 1.4-1.5 2.4V19a1.3 1.3 0 0 0 1.3 1.3h5a1.3 1.3 0 0 0 1.3-1.3V9.2c0-1-.6-1.9-1.5-2.4-.5-.3-.9-.7-.9-1.3v-2M8.4 13.5h7.2M8.4 16.5h7.2"/>'),
  solid: svg('<ellipse cx="12" cy="10.5" rx="7.3" ry="1.7"/><path d="M4.7 10.5c0 4 2.9 7.2 7.3 7.2s7.3-3.2 7.3-7.2"/><path d="M8.4 10.3h7.2"/><path d="M16.3 6.8 18.7 4.4M17.5 5.6a1.15 1.15 0 1 0 1.6-1.6"/>'),
  diaper: svg('<circle cx="7" cy="16" r="2.1"/><path d="M8.6 14.4 15.5 7.5a2.3 2.3 0 0 1 3.2 3.2l-2.2 2.2"/><path d="M17.8 11.8a1.9 1.9 0 1 1-2.7-2.7"/>'),
  nightwake: svg('<path d="M2.5 12S6 6.3 12 6.3 21.5 12 21.5 12 18 17.7 12 17.7 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.1"/>'),
  pump: svg('<path d="M10.3 3.8h3.4M9 3.8v3.6c0 .5-.2.9-.5 1.3-1 1.1-1.5 3-1.5 4.9 0 3.5 2 6.6 5 6.6s5-3.1 5-6.6c0-1.9-.5-3.8-1.5-4.9-.3-.4-.5-.8-.5-1.3V3.8"/><path d="M7.6 13.2h8.8"/>'),
  vitamins: svg('<path d="M12 3.2c3.2 4.6 6.2 8.6 6.2 12A6.2 6.2 0 1 1 5.8 15.2c0-3.4 3-7.4 6.2-12z"/>'),
  med: svg('<rect x="3.2" y="9.3" width="17.6" height="5.4" rx="2.7" transform="rotate(-40 12 12)"/><path d="M9.8 8.6 14.2 15.4" transform="rotate(-40 12 12)"/>'),
};

/* --- schede della barra in basso --- */
export const TAB_ICONS = {
  oggi: svg('<rect x="3.8" y="5.2" width="16.4" height="15" rx="3"/><path d="M3.8 9.8h16.4M8.2 3.4v3.4M15.8 3.4v3.4"/><circle cx="12" cy="15" r="1.6"/>'),
  stat: svg('<path d="M5.5 19.5v-6M12 19.5V5M18.5 19.5v-9.5"/>'),
  suoni: svg('<path d="M3.5 12h1.4M7.5 8.5v7M11.5 5v14M15.5 8v8M19.5 10.8v2.4"/>'),
  timer: svg('<circle cx="12" cy="13.5" r="7.3"/><path d="M12 9.6v3.9l2.6 1.6M9.6 3.2h4.8M12 3.2v3"/>'),
  bimbo: svg('<circle cx="12" cy="13" r="7.8"/><path d="M12 5.2c-.2-1.7 1.4-2.6 2.8-1.7"/><path d="M9.6 16.2c1.3 1.1 3.5 1.1 4.8 0"/><circle cx="9.3" cy="12.4" r=".5" fill="currentColor"/><circle cx="14.7" cy="12.4" r=".5" fill="currentColor"/>'),
};

/* --- navigazione e righe --- */
export const ICON = {
  back: svg('<path d="M14.5 5.5 8 12l6.5 6.5"/>', "22", 1.9),
  close: svg('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>', "20", 1.9),
  chevron: svg('<path d="M9.5 6l6 6-6 6"/>', "18", 1.8),
  settings: svg('<path d="M4 7.5h9.2M17.6 7.5H20M4 16.5h2.4M10.8 16.5H20"/><circle cx="15.4" cy="7.5" r="2.2"/><circle cx="8.6" cy="16.5" r="2.2"/>', "21"),
  edit: svg('<path d="M4 20l.9-3.6L15.5 6a1.7 1.7 0 0 1 2.4 0l.1.1a1.7 1.7 0 0 1 0 2.4L7.6 19.1 4 20z"/><path d="M13.8 7.7l2.5 2.5"/>'),
  plus: svg('<path d="M12 5.5v13M5.5 12h13"/>'),
  trash: svg('<path d="M4.5 7h15M9.5 7V4.8h5V7M6.5 7l.9 12.2a1.5 1.5 0 0 0 1.5 1.3h6.2a1.5 1.5 0 0 0 1.5-1.3L17.5 7"/>'),
  person: svg('<circle cx="12" cy="8.3" r="3.6"/><path d="M4.8 20c.9-3.6 3.7-5.6 7.2-5.6s6.3 2 7.2 5.6"/>'),
  theme: svg('<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 0 0 16z" fill="currentColor" stroke="none"/>'),
  lang: svg('<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.3 2.2 3.4 4.9 3.4 8s-1.1 5.8-3.4 8c-2.3-2.2-3.4-4.9-3.4-8S9.7 6.2 12 4z"/>'),
  eyeoff: svg('<path d="M4 4l16 16"/><path d="M9.6 6.6A9.6 9.6 0 0 1 12 6.3c6 0 9.5 5.7 9.5 5.7a16 16 0 0 1-2.9 3.4M6.3 8.3A16 16 0 0 0 2.5 12s3.5 5.7 9.5 5.7c1.3 0 2.5-.3 3.6-.7"/>'),
  bell: svg('<path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 1.5H5z"/><path d="M10.2 20.2a2 2 0 0 0 3.6 0"/>'),
  download: svg('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>'),
  upload: svg('<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 19.5h14"/>'),
  table: svg('<rect x="4" y="5" width="16" height="14" rx="2.2"/><path d="M4 10h16M4 14.5h16M10 10v9"/>'),
  info: svg('<circle cx="12" cy="12" r="8"/><path d="M12 11v5"/><circle cx="12" cy="8" r=".6" fill="currentColor"/>'),
  book: svg('<path d="M12 6.5C10.4 5.3 8 4.8 4.5 5v13c3.5-.2 5.9.3 7.5 1.5 1.6-1.2 4-1.7 7.5-1.5V5c-3.5-.2-5.9.3-7.5 1.5zM12 6.5v13"/>'),
  report: svg('<rect x="5.5" y="4.5" width="13" height="16" rx="2"/><path d="M9 4.5V3.4h6v1.1M8.8 10h6.4M8.8 13.5h6.4M8.8 17h3.8"/>'),
  growth: svg('<path d="M4 19.5h16M6 16l4-4.5 3 2.5 5-6.5"/><path d="M14.8 7.5H18v3.2"/>'),
  lock: svg('<rect x="4.6" y="10.4" width="14.8" height="10.2" rx="3"/><path d="M8.2 10.4V7.6a3.8 3.8 0 0 1 7.6 0v2.8"/>'),
  pharmacy: svg('<path d="M4.9 11.2V19.6h14.2v-8.4"/><path d="M3.3 11.4 12 4.6l8.7 6.8"/><path d="M12 12.4v4.6M9.7 14.7h4.6"/>'),
  camera: svg('<path d="M3.5 8.6h3.2l1.5-2.2h7.6l1.5 2.2h3.2v10H3.5z"/><circle cx="12" cy="13.4" r="3.4"/>', "24", 1.5),
  cup: svg('<path d="M4.5 9h11v5.5a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4V9z"/><path d="M15.5 10h1.6a2.4 2.4 0 0 1 0 4.8h-1.6"/><path d="M8 4.5c0 .9.9 1.1.9 2M11.5 4c0 .9.9 1.1.9 2"/>'),
  volume: svg('<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/>', "16", 1.7),
  clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 1.8"/>', "16", 1.7),
  printer: svg('<path d="M7 9V4.5h10V9M7 17H5a1.5 1.5 0 0 1-1.5-1.5V10.5A1.5 1.5 0 0 1 5 9h14a1.5 1.5 0 0 1 1.5 1.5v5A1.5 1.5 0 0 1 19 17h-2"/><rect x="7" y="14" width="10" height="6.5" rx="1"/>'),
};

/* pieni simboli pieni, per i tasti di riproduzione */
export const PLAY = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M7.5 5v14l11.5-7z" fill="currentColor"/></svg>';
export const STOP = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><rect x="5.5" y="5.5" width="13" height="13" rx="2.5" fill="currentColor"/></svg>';
export const PAUSE = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor"/></svg>';
