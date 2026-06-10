import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { TIMER_PRESETS } from '../data';

export default function Timer() {
  const navigateTo = useStore((s) => s.navigateTo);
  const [duration, setDuration] = useState(300);
  const [remaining, setRemaining] = useState(300);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const beep = () => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'square';
      gain.gain.value = 0.15;
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  const start = () => {
    if (running) return;
    setFinished(false);
    setRunning(true);
    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setRunning(false);
          setFinished(true);
          beep();
          if (intervalRef.current !== null) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pause = () => {
    setRunning(false);
    clearTimer();
  };

  const reset = () => {
    pause();
    setRemaining(duration);
    setFinished(false);
  };

  const setPreset = (mins: number) => {
    pause();
    const secs = mins * 60;
    setDuration(secs);
    setRemaining(secs);
    setFinished(false);
  };

  const setCustom = (mins: number, secs: number) => {
    pause();
    const total = Math.max(1, mins * 60 + secs);
    setDuration(total);
    setRemaining(total);
    setFinished(false);
  };

  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;
  const display = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

  return (
    <div className="tool-page">
      <div className="tool-header">
        <button className="btn btn-outline btn-sm" onClick={() => { pause(); navigateTo('dashboard'); }}>
          ← Retour
        </button>
        <h2>Timer</h2>
      </div>

      <div className={`timer-display card ${finished ? 'timer-finished' : ''}`}>
        <div className="card-body">
          <div className="timer-time">{display}</div>
        </div>
      </div>

      {finished && (
        <div className="card card-highlight timer-finished-msg">
          <div className="card-body">
            <h3>⏰ Temps écoulé !</h3>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 'var(--space-6)' }}>
        <div className="card-body">
          <div className="timer-presets">
            {TIMER_PRESETS.map((m) => (
              <button key={m} className="btn btn-outline btn-sm" onClick={() => setPreset(m)}>
                {m} min
              </button>
            ))}
          </div>
          <div className="timer-custom">
            <input
              className="input-brutal timer-input"
              type="number"
              min="0"
              max="99"
              value={Math.floor(duration / 60)}
              onChange={(e) => setCustom(parseInt(e.target.value) || 0, duration % 60)}
            />
            <span>min</span>
            <input
              className="input-brutal timer-input"
              type="number"
              min="0"
              max="59"
              value={duration % 60}
              onChange={(e) => setCustom(Math.floor(duration / 60), parseInt(e.target.value) || 0)}
            />
            <span>sec</span>
          </div>
        </div>
      </div>

      <div className="timer-actions" style={{ marginTop: 'var(--space-6)' }}>
        {!running && !finished && (
          <button className="btn btn-primary btn-lg" onClick={start}>
            ▶ Démarrer
          </button>
        )}
        {running && (
          <button className="btn btn-outline btn-lg" onClick={pause}>
            ⏸ Pause
          </button>
        )}
        {(running || finished || remaining !== duration) && (
          <button className="btn btn-outline btn-lg" onClick={reset}>
            ↺ Réinitialiser
          </button>
        )}
      </div>
    </div>
  );}