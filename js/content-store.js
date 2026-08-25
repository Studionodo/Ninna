/* ============================================================
   /* ============================================================
   NINNA STORE — persistenza locale per la PWA
   localStorage con versioning, export/import JSON e export CSV.
   (Nella PWA vera si può migrare a IndexedDB se i dati crescono;
   per eventi testuali localStorage regge anni di utilizzo.)
   ============================================================ */

const KEY = "ninna_v1";

export function loadStore() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { version: 1, baby: null, events: [], prefs: { volume: 0.4 } };
    const data = JSON.parse(raw);
    if (!data.version) data.version = 1;
    return data;
  } catch {
    return { version: 1, baby: null, events: [], prefs: { volume: 0.4 } };
  }
}

export function saveStore(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Ninna: salvataggio fallito", e);
    return false;
  }
}

export function exportJSON(data) {
  return JSON.stringify({ ...data, exportedAt: new Date().toISOString() }, null, 2);
}

const KNOWN_TYPES = ["nap", "night", "breast", "bottle", "solid", "diaper", "nightwake", "pump"];

export function importJSON(text) {
  const data = JSON.parse(text);
  if (!Array.isArray(data.events)) throw new Error("File non valido: manca l'elenco eventi");
  const events = data.events.filter((e) =>
    e && KNOWN_TYPES.includes(e.type) &&
    ((typeof e.start === "number" && (e.end == null || typeof e.end === "number")) ||
     typeof e.at === "number"));
  return { version: data.version || 1, baby: data.baby || null, events, prefs: data.prefs || {} };
}

export function exportCSV(events, labels, header = ["tipo", "inizio", "fine", "durata_min"]) {
  const rows = [header];
  [...events]
    .sort((a, b) => (a.start || a.at) - (b.start || b.at))
    .forEach((e) => {
      const label = labels[e.type] || e.type;
      if (e.start) {
        rows.push([
          label,
          new Date(e.start).toISOString(),
          e.end ? new Date(e.end).toISOString() : "",
          e.end ? Math.round((e.end - e.start) / 60000) : "",
        ]);
      } else {
        rows.push([label, new Date(e.at).toISOString(), "", ""]);
      }
    });
  return rows.map((r) => r.join(";")).join("\n");
}
