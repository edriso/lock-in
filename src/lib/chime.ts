/*
 * A soft three-note completion chime via WebAudio. Created on the user gesture
 * that ends the session (banking), and fully try/catch-wrapped so a missing or
 * blocked AudioContext never breaks the flow.
 */
export function playChime(): void {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) {
      return;
    }
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const notes: Array<[number, number]> = [
      [523, 0],
      [784, 0.12],
      [1047, 0.24],
    ];
    for (const [frequency, offset] of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = frequency;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(0.16, now + offset + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.9);
      osc.start(now + offset);
      osc.stop(now + offset + 1);
    }
    setTimeout(() => ctx.close?.(), 1800);
  } catch {
    // Audio can be unavailable or blocked; the session still completes silently.
  }
}
