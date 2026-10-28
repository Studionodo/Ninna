/* ============================================================
   NINNA · timer
   Tutto calcolato dall'orario di fine, mai contando i secondi: se il
   telefono sospende la pagina, al ritorno il tempo mostrato e' giusto
   e, se e' gia' scaduto, l'avviso parte subito. Lo schermo resta
   acceso solo mentre il timer corre.
   ============================================================ */
import { S, persist } from "./state.js";

export const TIMER_PRESETS = [5, 10, 15, 20, 30];
export const canVibrate = typeof navigator.vibrate === "function";

export const T = {
  run: S.store.prefs.timerRun || null,   // { end, total } in ms
  done: false,
};

let endH = null, tickH = null, wake = null, ctx = null;
let onTick = () => {}, onChange = () => {};

/** app.js registra qui come ridisegnare: ogni secondo (leggero) e ai cambi di stato. */
export function timerHooks(tick, change) { onTick = tick; onChange = change; }

export function alertMode() {
  const m = S.store.prefs.timerAlert || (canVibrate ? "vibe" : "sound");
  return canVibrate ? m : "sound";
}

export function unlockAudio() {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
  } catch (e) {}
}

/* rintocco morbido: suona accanto a un neonato che magari dorme,
   quindi niente sveglia, tre tocchi e basta */
function chime() {
  try {
    unlockAudio();
    [0, 1.7, 3.4].forEach((off) => {
      [[659.25, 0.16], [987.77, 0.07]].forEach(([freq, peak]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine"; o.frequency.value = freq;
        const t0 = ctx.currentTime + off;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.55);
        o.connect(g); g.connect(ctx.destination);
        o.start(t0); o.stop(t0 + 1.6);
      });
    });
  } catch (e) {}
}

async function wakeOn() {
  try {
    if ("wakeLock" in navigator && !wake) {
      wake = await navigator.wakeLock.request("screen");
      wake.addEventListener("release", () => { wake = null; });
    }
  } catch (e) {}
}
function wakeOff() { try { if (wake) wake.release(); } catch (e) {} wake = null; }

function clearHandles() { clearTimeout(endH); clearInterval(tickH); endH = tickH = null; }

function fire() {
  if (!T.run || T.done) return;
  clearHandles();
  T.done = true;
  const m = alertMode();
  if (m !== "vibe") chime();
  if (m !== "sound" && canVibrate) navigator.vibrate([400, 200, 400, 200, 700]);
  wakeOff();
  onChange();
}

function schedule() {
  clearHandles();
  if (!T.run || T.done) return;
  const left = T.run.end - Date.now();
  if (left <= 0) return fire();
  endH = setTimeout(fire, left);
  tickH = setInterval(() => {
    if (!T.run || T.done) return;
    if (T.run.end - Date.now() <= 0) return fire();
    onTick();
  }, 1000);
}

export function timerLeft() { return T.run ? (T.done ? 0 : Math.max(0, T.run.end - Date.now())) : 0; }

export function startTimer(minutes) {
  const m = parseInt(minutes, 10);
  if (!(m >= 1 && m <= 240)) return false;
  unlockAudio();                       // il gesto dell'utente sblocca l'audio per dopo
  S.store.prefs.timerLast = m;
  T.run = { end: Date.now() + m * 60000, total: m * 60000 };
  T.done = false;
  S.store.prefs.timerRun = T.run;
  persist();
  wakeOn(); schedule(); onChange();
  return true;
}

export function stopTimer() {
  clearHandles();
  T.run = null; T.done = false;
  delete S.store.prefs.timerRun;
  persist();
  wakeOff(); onChange();
}

/* ripresa dopo una chiusura dell'app: se e' scaduto da poco lo mostriamo
   scaduto (senza suono: i browser bloccano l'audio finche' non tocchi lo
   schermo); se e' vecchio lo scartiamo */
export function resumeTimer() {
  if (!T.run) return;
  if (T.run.end > Date.now()) schedule();
  else if (Date.now() - T.run.end < 30 * 60000) T.done = true;
  else { T.run = null; delete S.store.prefs.timerRun; persist(); }
}

/* rientrando nell'app: il blocco schermo si perde in background */
export function timerVisible() {
  if (!T.run || T.done) return;
  if (T.run.end <= Date.now()) return fire();
  wakeOn(); schedule();
}
