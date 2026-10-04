let audioContext = null;
let masterVolume = 0.22;
let muted = false;

export function setMasterVolume(value) {
  const numeric = Number(value);
  masterVolume = Number.isFinite(numeric) ? Math.max(0, Math.min(1, numeric / 100)) : 0.22;
  muted = masterVolume === 0;
}

export function isMuted() { return muted; }

function context() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
  return audioContext;
}

export function playSystemSound(kind = "click") {
  if (muted || masterVolume <= 0) return;
  const ctx = context();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes = kind === "logon" ? [523.25, 659.25, 783.99] : kind === "open" ? [740, 988] : kind === "error" ? [245, 190] : [660];
  notes.forEach((frequency, index) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + index * (kind === "logon" ? 0.115 : 0.055);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, masterVolume * 0.055), start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.14);
  });
}
