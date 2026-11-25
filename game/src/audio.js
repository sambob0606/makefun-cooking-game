// Tiny synthesized sound effects, made with the Web Audio API — no audio files.
// One file, one job: bleeps for chop, sizzle, ding and the rest.
export function createAudio() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') void ctx.resume();
    return ctx;
  }

  function tone(freq, seconds, type, volume, slideTo) {
    if (muted) return;
    const audio = ensure();
    if (!audio) return;
    const start = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + seconds);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + seconds);
    osc.connect(gain).connect(audio.destination);
    osc.start(start);
    osc.stop(start + seconds + 0.02);
  }

  function noise(seconds, volume) {
    if (muted) return;
    const audio = ensure();
    if (!audio) return;
    const length = Math.floor(audio.sampleRate * seconds);
    const buffer = audio.createBuffer(1, length, audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = audio.createBufferSource();
    const gain = audio.createGain();
    gain.gain.value = volume;
    source.buffer = buffer;
    source.connect(gain).connect(audio.destination);
    source.start();
  }

  return {
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    get muted() {
      return muted;
    },
    chop() {
      noise(0.08, 0.25);
      tone(180, 0.07, 'triangle', 0.15, 90);
    },
    sizzle() {
      noise(0.35, 0.12);
    },
    ding() {
      tone(880, 0.18, 'sine', 0.2);
      tone(1318, 0.28, 'sine', 0.15);
    },
    serve() {
      tone(523, 0.12, 'triangle', 0.2);
      tone(659, 0.12, 'triangle', 0.2);
      tone(784, 0.22, 'triangle', 0.2);
    },
    bad() {
      tone(220, 0.25, 'sawtooth', 0.12, 110);
    },
    tick() {
      tone(1200, 0.04, 'square', 0.06);
    },
  };
}
