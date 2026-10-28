/* ============================================================
   NINNA · modalita' notte
   Nero vero a prescindere dal tema: qui l'obiettivo e' zero luce.
   Un tasto grande al centro, poppate a portata, suoni senza uscire.
   ============================================================ */
import { SOUNDS } from "./sounds.js";
import { S, t, arg, typeLabel, fmtDur, fmtMS, awakeLabel, elapsedLabel, activeSleep } from "./state.js";
import { TYPE_ICONS, ICON, PLAY, PAUSE } from "./icons.js";
import { soundControls } from "./views-tabs.js";
import { T, timerLeft } from "./timer.js";

export function renderNight(f, picker = false) {
  const ui = S.ui;
  if (S.sound.playing) ui.nightLastSound = S.sound.playing;   // sopravvive alla pausa

  /* la scelta del suono sostituisce la schermata invece di galleggiarci
     sopra: cosi' non puo' mai coprire il tasto centrale */
  if (picker) {
    return `<div class="nightmode picker">
      <button class="night-chip night-tl" onclick="NINNA.back()">${ICON.back}<span>${t("nav_back")}</span></button>
      <div class="picker-list">
        <div class="picker-title">${t("sounds_title")}</div>
        ${SOUNDS.map((s) => {
          const on = S.sound.playing === s.id;
          return `<button class="picker-row ${on ? "on" : ""}" onclick="${on ? "NINNA.pauseNightSound()" : `NINNA.playSound('${s.id}')`}">
            <span>${t("sound_" + s.id)}</span>${on ? PAUSE : PLAY}
          </button>${on ? soundControls("night-ctl") : ""}`;
        }).join("")}
        ${ui.nightLastSound ? `<button class="picker-stop" onclick="NINNA.stopSound()">${t("mp_stop")}</button>` : ""}
      </div>
    </div>`;
  }

  const active = activeSleep();
  let status, big;
  if (active) {
    status = `${typeLabel(active.type)} · ${t("hero_sleeping")}`;
    big = `<button class="night-big" onclick="NINNA.endSleep(${arg(active.id)})">${t("btn_awake")}</button>`;
  } else {
    status = f.lastWake ? awakeLabel(Date.now() - f.lastWake) : "";
    const kind = f.next ? f.next.kind : "night";
    big = `<button class="night-big" onclick="NINNA.startSleep('${kind}')">${kind === "night" ? t("btn_night") : t("btn_nap")}</button>`;
  }
  const last = ui.nightLastSound;
  return `<div class="nightmode">
    <button class="night-chip night-tl" onclick="NINNA.back()" aria-label="${t("night_exit")}">${ICON.close}<span>${t("night_exit_short")}</span></button>
    ${last
      ? `<div class="night-chip night-tr">
          <button class="ns-name" onclick="NINNA.toggleNightSoundList()">${t("sound_" + last)}</button>
          <button class="ns-btn ${S.sound.playing ? "" : "paused"}" onclick="${S.sound.playing ? "NINNA.pauseNightSound()" : "NINNA.resumeNightSound()"}" aria-label="${S.sound.playing ? t("night_pause") : t("night_resume")}">${S.sound.playing ? PAUSE : PLAY}</button>
        </div>
        ${S.sound.playing && S.sound.startedAt ? `<div class="ns-elapsed">${elapsedLabel(Date.now() - S.sound.startedAt)}</div>` : ""}`
      : `<button class="night-chip night-tr" onclick="NINNA.toggleNightSoundList()">${PLAY}<span>${t("tab_suoni")}</span></button>`}
    <div class="night-head">
      <div class="night-status">${status}</div>
      ${active ? `<div class="night-dur">${fmtDur(Date.now() - active.start)}</div>` : ""}
    </div>
    ${big}
    <div class="night-quick">
      <button onclick="NINNA.logInstant('breast')"><span class="night-circle">${TYPE_ICONS.breast}</span><span>${typeLabel("breast")}</span></button>
      <button onclick="NINNA.logInstant('bottle')"><span class="night-circle">${TYPE_ICONS.bottle}</span><span>${typeLabel("bottle")}</span></button>
    </div>
    ${T.run ? `<button class="night-timer ${T.done ? "done" : ""}" onclick="NINNA.nightTimerTap()">${ICON.clock}<span id="night-tm">${T.done ? t("timer_done") : fmtMS(timerLeft())}</span></button>` : ""}
    <div class="night-caption">${t("night_caption")}</div>
  </div>`;
}
