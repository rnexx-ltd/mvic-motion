"""Bande-son synthétisée du plan test « Le fleuve » (provisoire, en attendant les vrais sons).
Calée sur les repères de src/fleuve/FleuveTest.tsx (30 i/s). Sortie : public/fleuve/fleuve-test-audio.wav
"""
import sys, wave
import numpy as np

SR = 44100
FPS = 30
DUR = 375 / FPS + 0.3
N = int(SR * DUR)
out = np.zeros((N, 2), dtype=np.float64)
rng = np.random.default_rng(7)

def t(sec):
    return np.arange(int(SR * sec)) / SR

def add(sig, at_sec, gain=1.0, pan=0.0):
    i = int(at_sec * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
    out[i : i + len(sig), 0] += sig * gain * l
    out[i : i + len(sig), 1] += sig * gain * r

def f2s(frame):
    return frame / FPS

def env(n, a=0.005, d=0.3):
    x = np.arange(n) / SR
    return np.minimum(1, x / a) * np.exp(-x / d)

def marimba(freq, dur=0.6, bright=1.0):
    x = t(dur)
    s = np.sin(2 * np.pi * freq * x) + 0.35 * bright * np.sin(2 * np.pi * freq * 4 * x) * np.exp(-x / 0.05)
    return s * env(len(x), 0.002, 0.22)

def bass(freq, dur=0.45):
    x = t(dur)
    s = np.sin(2 * np.pi * freq * x) + 0.3 * np.sin(2 * np.pi * freq * 2 * x)
    return s * env(len(x), 0.004, 0.25)

def kick():
    x = t(0.35)
    f = 120 * np.exp(-x / 0.04) + 45
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), 0.001, 0.12)

def noise_hit(dur=0.06, decay=0.02, hp=True):
    n = rng.standard_normal(int(SR * dur))
    if hp:
        n = np.diff(n, prepend=0)
    return n * env(len(n), 0.001, decay)

def note(name):
    names = {"C": 0, "D": 2, "E": 4, "G": 7, "A": 9}
    n, octv = name[:-1], int(name[-1])
    return 440 * 2 ** ((names[n] + 12 * (octv - 4) - 9) / 12)

# ── Musique : 104 BPM, pentatonique, entrée légère puis plus pleine ──
BPM = 104
beat = 60 / BPM
melody = ["E5", "G5", "A5", "G5", "E5", "D5", "C5", "D5", "E5", "G5", "C6", "A5", "G5", "E5", "G5", "A5"]
bassline = ["C3", "C3", "A2", "A2", "G2", "G2", "A2", "G2"]
nbeats = int(DUR / beat)
for b in range(nbeats):
    tb = b * beat
    full = tb > f2s(120)
    peak = tb > f2s(236)
    # marimba en croches
    for h in range(2):
        m = melody[(b * 2 + h) % len(melody)]
        add(marimba(note(m), bright=1.0 if full else 0.6), tb + h * beat / 2, 0.16 if full else 0.11, pan=-0.2)
    if full:
        add(marimba(note(melody[(b * 2 + 3) % len(melody)]) / 2, 0.5, 0.5), tb + beat * 0.75, 0.07, pan=0.3)
    # basse
    if b % 2 == 0:
        add(bass(note(bassline[(b // 2) % len(bassline)])), tb, 0.35 if full else 0.22)
    # grosse caisse, claps, shaker
    if full:
        if b % 2 == 0:
            add(kick(), tb, 0.6)
        if b % 2 == 1:
            add(noise_hit(0.12, 0.05), tb, 0.18)
    for q in range(4):
        add(noise_hit(0.04, 0.012), tb + q * beat / 4, 0.05 if not peak else 0.08, pan=0.4)

# ── Bruitages ──
def bip(freq=880, dur=0.12):
    x = t(dur)
    return np.sin(2 * np.pi * freq * x) * env(len(x), 0.003, 0.05)

def wood_knock():
    x = t(0.25)
    s = 0.8 * np.sin(2 * np.pi * 520 * x) * np.exp(-x / 0.035) + 0.5 * np.sin(2 * np.pi * 1350 * x) * np.exp(-x / 0.02)
    return s + 0.4 * np.pad(noise_hit(0.03, 0.008), (0, len(x) - int(SR * 0.03)))

def shimmer():
    x = t(1.4)
    s = sum(np.sin(2 * np.pi * f * x) * np.exp(-x / 0.6) for f in [1046, 1318, 1568, 2093])
    trem = 0.6 + 0.4 * np.sin(2 * np.pi * 9 * x)
    return s * trem * np.minimum(1, x / 0.05) * 0.25

def boing(up=True):
    x = t(0.35)
    f = (300 + 900 * x / 0.35) if up else (900 - 700 * x / 0.35)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), 0.005, 0.15)

def step():
    return noise_hit(0.03, 0.006) * 0.6 + np.pad(bip(2400, 0.02), (0, int(SR * 0.01)))[: int(SR * 0.03)] * 0.3

def buzz(dur):
    x = t(dur)
    s = np.sign(np.sin(2 * np.pi * 150 * x)) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 7 * x)))
    return s * 0.35 * np.minimum(1, x / 0.02)

def ding_dong():
    a = marimba(note("E6"), 0.8) + 0.5 * marimba(note("E7"), 0.8)
    b = marimba(note("C6"), 1.0) + 0.5 * marimba(note("C7"), 1.0)
    s = np.zeros(max(len(a), len(b)) + int(SR * 0.18))
    s[: len(a)] += a
    s[int(SR * 0.18) : int(SR * 0.18) + len(b)] += b
    return s

def final_chord():
    x = t(2.2)
    s = sum(np.sin(2 * np.pi * note(n) * x) for n in ["C4", "E4", "G4", "C5", "E5"])
    return s * np.minimum(1, x / 0.02) * np.exp(-x / 1.1) * 0.22

add(bip(988), f2s(28), 0.35)  # validation sur Mvic
add(bip(1318, 0.1), f2s(28) + 0.09, 0.3)
for i in range(9):
    add(wood_knock(), f2s(36 + i * 9 + 9), 0.55, pan=-0.6 + i * 0.15)
add(shimmer(), f2s(120), 0.9)
add(boing(True), f2s(140), 0.35, pan=-0.5)
for fr in range(156, 222, 4):
    add(step(), f2s(fr), 0.35, pan=-0.6 + (fr - 156) / 66 * 1.2)
add(boing(True), f2s(222), 0.3, pan=0.5)
add(shimmer()[: int(SR * 0.6)], f2s(236), 0.6, pan=0.6)
add(buzz(0.75), f2s(242), 0.4, pan=0.6)
add(ding_dong(), f2s(256), 0.55)
add(final_chord(), f2s(312), 1.0)

# fondu de sortie, normalisation (~ -10 LUFS approx. par crête)
fade = int(SR * 0.6)
out[-fade:] *= np.linspace(1, 0, fade)[:, None]
out /= np.max(np.abs(out)) / 0.89
pcm = (out * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("ok", sys.argv[1], round(DUR, 2), "s")
