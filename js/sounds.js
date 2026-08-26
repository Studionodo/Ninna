/* ============================================================
   NINNA SOUNDS · motore audio interamente sintetizzato
   Zero file audio, zero licenze, zero banda: tutto generato
   con Web Audio API. ES module senza dipendenze.

   Suoni disponibili:
   - white  → rumore bianco (copre i rumori improvvisi)
   - pink   → rumore rosa (più morbido sulle alte frequenze)
   - brown  → rumore marrone (profondo, ovattato)
   - ocean  → onde: marrone modulato lentamente in ampiezza
   - rain   → pioggia: bianco filtrato + gocce casuali
   - heart  → battito: doppio tono grave a ~60 bpm
   - shush  → "shhh" ritmico: banda di rumore modulata a ~0.9 Hz

   Extra:
   - fade-in/out su ogni transizione (niente attacchi bruschi)
   - sleep timer con dissolvenza finale (spegnimento automatico)
   ============================================================ */

const FADE_S = 1.2;

function makeNoiseBuffer(ctx, kind) {
  const len = 4 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buffer.getChannelData(0);
  if (kind === "white") {
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  } else if (kind === "pink") {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.016898;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
  } else {
    // brown
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    }
  }
  return buffer;
}

export const SOUNDS = ["white", "pink", "brown", "ocean", "rain", "heart", "shush"].map((id) => ({ id }));

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.active = [];      // nodi da fermare al cambio suono
    this.playing = null;   // id del suono corrente
    this.volume = 0.4;
    this._timerId = null;
    this._heartInterval = null;
    this._rainInterval = null;
  }

  _ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.master && this.playing) {
      this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  /** Ferma tutto con dissolvenza. */
  stop() {
    if (!this.ctx || !this.playing) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(0, t, FADE_S / 3);
    const toKill = this.active;
    this.active = [];
    setTimeout(() => toKill.forEach((n) => { try { n.stop ? n.stop() : n.disconnect(); } catch {} }), FADE_S * 1000 + 200);
    clearInterval(this._heartInterval);
    clearInterval(this._rainInterval);
    clearTimeout(this._timerId);
    this._heartInterval = this._rainInterval = this._timerId = null;
    this.playing = null;
  }

  /** Avvia un suono per id (ferma il precedente). */
  play(id) {
    this._ensure();
    const wasPlaying = this.playing;
    this.stop();
    if (wasPlaying === id) return; // toggle
    const t = this.ctx.currentTime;
    switch (id) {
      case "white":
      case "pink":
      case "brown": this._noise(id); break;
      case "ocean": this._ocean(); break;
      case "rain":  this._rain(); break;
      case "heart": this._heart(); break;
      case "shush": this._shush(); break;
      default: return;
    }
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setValueAtTime(0.0001, t);
    this.master.gain.exponentialRampToValueAtTime(Math.max(0.001, this.volume), t + FADE_S);
    this.playing = id;
  }

  /** Spegnimento automatico dopo N minuti, con dissolvenza di 30 s. */
  sleepTimer(minutes) {
    clearTimeout(this._timerId);
    if (!minutes) return;
    this._timerId = setTimeout(() => {
      if (!this.ctx || !this.playing) return;
      const t = this.ctx.currentTime;
      this.master.gain.setTargetAtTime(0, t, 10);
      setTimeout(() => this.stop(), 32000);
    }, minutes * 60000);
  }

  /* ---------- generatori ---------- */

  _loopBuffer(kind) {
    const src = this.ctx.createBufferSource();
    src.buffer = makeNoiseBuffer(this.ctx, kind);
    src.loop = true;
    return src;
  }

  _noise(kind) {
    const src = this._loopBuffer(kind);
    src.connect(this.master);
    src.start();
    this.active.push(src);
  }

  _ocean() {
    const src = this._loopBuffer("brown");
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.55;
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.09;                 // un'onda ogni ~11 s
    const lfoDepth = this.ctx.createGain();
    lfoDepth.gain.value = 0.4;
    lfo.connect(lfoDepth).connect(lfoGain.gain);
    src.connect(lfoGain).connect(this.master);
    src.start(); lfo.start();
    this.active.push(src, lfo);
  }

  _rain() {
    // letto di pioggia: bianco passa-banda
    const bed = this._loopBuffer("white");
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 1800; bp.Q.value = 0.6;
    const bedGain = this.ctx.createGain();
    bedGain.gain.value = 0.7;
    bed.connect(bp).connect(bedGain).connect(this.master);
    bed.start();
    this.active.push(bed);
    // gocce sparse: brevi impulsi filtrati ad alta frequenza
    this._rainInterval = setInterval(() => {
      if (!this.ctx || this.playing !== "rain") return;
      const n = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const t = this.ctx.currentTime + Math.random() * 0.4;
        const osc = this.ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = 2500 + Math.random() * 3500;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.05, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
        osc.connect(g).connect(this.master);
        osc.start(t); osc.stop(t + 0.08);
      }
    }, 500);
  }

  _heart() {
    const beat = () => {
      if (!this.ctx || this.playing !== "heart") return;
      const thump = (t0, freq, vol) => {
        const osc = this.ctx.createOscillator();
        osc.type = "sine"; osc.frequency.value = freq;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.25);
        osc.connect(g).connect(this.master);
        osc.start(t0); osc.stop(t0 + 0.3);
      };
      const t = this.ctx.currentTime + 0.05;
      thump(t, 52, 0.8);            // "lub"
      thump(t + 0.28, 44, 0.55);    // "dub"
    };
    beat();
    this._heartInterval = setInterval(beat, 1000); // ~60 bpm
  }

  _shush() {
    const src = this._loopBuffer("white");
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 2600; bp.Q.value = 1.1;
    const mod = this.ctx.createGain();
    mod.gain.value = 0.5;
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.45;                 // uno "shhh" ogni ~2,2 s
    const depth = this.ctx.createGain();
    depth.gain.value = 0.45;
    lfo.connect(depth).connect(mod.gain);
    src.connect(bp).connect(mod).connect(this.master);
    src.start(); lfo.start();
    this.active.push(src, lfo);
  }
}
