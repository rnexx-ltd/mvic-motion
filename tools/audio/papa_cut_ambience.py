"""Ambiance sonore provisoire de « Le vocal de Papa » (séquence de la table). Synthétisée.
Grillons, flamme, ton de pièce, vibration sur le bois, sonnerie SMS, silence, piano.
Sortie : public/papa/papa-cut-ambience.wav
"""
import sys, wave
import numpy as np

SR = 44100
DUR = 28.6
N = int(SR * DUR)
L = np.zeros(N)
R = np.zeros(N)
rng = np.random.default_rng(3)
t_all = np.arange(N) / SR

def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    L[i : i + len(sig)] += sig * gain * np.sqrt((1 - pan) / 2)
    R[i : i + len(sig)] += sig * gain * np.sqrt((1 + pan) / 2)

def lowpass(x, a):
    y = np.empty_like(x)
    acc = 0.0
    for k in range(len(x)):
        acc += a * (x[k] - acc)
        y[k] = acc
    return y

# ── Ton de pièce (souffle grave) ──
room = lowpass(rng.standard_normal(N), 0.01) * 0.6
L += room * 0.25
R += room * 0.25

# ── Grillons : salves de chants à ~4,6 kHz ──
for c in range(3):
    f0 = 4300 + c * 350
    period = 0.9 + c * 0.37
    pan = [-0.6, 0.5, 0.1][c]
    t0 = c * 0.21
    while t0 < DUR:
        n = int(SR * 0.16)
        tt = np.arange(n) / SR
        chirp = np.sin(2 * np.pi * f0 * tt) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 32 * tt))) * np.hanning(n)
        add(chirp, t0, 0.05, pan)
        t0 += period

# ── Crépitement de la flamme ──
for k in range(int(DUR * 7)):
    at = rng.uniform(0, DUR)
    n = int(SR * 0.012)
    pop = rng.standard_normal(n) * np.exp(-np.arange(n) / (SR * 0.002))
    add(pop, at, 0.12 * rng.uniform(0.3, 1), pan=-0.3)

# ── Vibration du téléphone sur la table en bois (12,6 → 14,2 s) ──
def buzz(dur):
    n = int(SR * dur)
    tt = np.arange(n) / SR
    motor = np.sin(2 * np.pi * 165 * tt) + 0.6 * np.sin(2 * np.pi * 330 * tt)
    rattle = lowpass(rng.standard_normal(n), 0.3) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 82 * tt)))
    gate = (np.sin(2 * np.pi * 2.2 * tt) > -0.3).astype(float)
    return (motor * 0.5 + rattle * 0.6) * gate * np.minimum(1, tt / 0.02)

add(buzz(1.6), 12.6, 0.45, 0.2)

# ── Sonnerie SMS d'un vieux téléphone (deux bips carrés) ──
def beep(freq, dur):
    n = int(SR * dur)
    tt = np.arange(n) / SR
    return np.sign(np.sin(2 * np.pi * freq * tt)) * 0.3 * np.minimum(1, (n - np.arange(n)) / (SR * 0.01))

add(beep(1760, 0.09), 14.3, 0.35, 0.2)
add(beep(1760, 0.09), 14.45, 0.35, 0.2)

# ── Silence total : on coupe tout de 15,0 à 16,5 s, puis l'ambiance revient doucement ──
env = np.ones(N)
a, b, c2 = int(15.0 * SR), int(16.5 * SR), int(17.4 * SR)
env[a:b] = 0.02
env[b:c2] = np.linspace(0.02, 1, c2 - b)
fade_in = int(14.85 * SR)
env[fade_in:a] = np.linspace(1, 0.02, a - fade_in)
L *= env
R *= env

# ── Piano doux (entre à 17 s, s'élève sur « fier » à 20,3 s) ──
def piano(freq, dur=3.5):
    n = int(SR * dur)
    tt = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * freq * h * tt) * (0.6 ** (h - 1)) * np.exp(-tt * (0.9 + h * 0.5)) for h in range(1, 6))
    return s * np.minimum(1, tt / 0.006)

def note(n):
    names = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
    return 440 * 2 ** ((names[n[0]] + 12 * (int(n[-1]) - 4) - 9) / 12)

chords = [
    (17.0, ["C3", "G3", "E4"], 0.18),
    (18.9, ["A2", "E3", "C4"], 0.18),
    (20.3, ["F2", "C3", "A3", "F4"], 0.24),
    (22.0, ["G2", "D3", "B3", "G4"], 0.24),
    (23.6, ["C3", "G3", "E4", "C5"], 0.26),
    (25.6, ["A2", "E3", "C4", "A4"], 0.24),
    (27.0, ["F2", "C3", "A3", "C5"], 0.22),
]
for at, notes, g in chords:
    for j, n in enumerate(notes):
        add(piano(note(n)), at + j * 0.05, g, pan=-0.2 + j * 0.15)
# mélodie très simple sur « Je suis fier de toi »
for at, n in [(20.4, "E5"), (21.1, "D5"), (21.6, "C5"), (23.7, "G5"), (24.4, "E5")]:
    add(piano(note(n), 2.5), at, 0.12, 0.2)

out = np.stack([L, R], axis=1)
fade = int(SR * 0.8)
out[-fade:] *= np.linspace(1, 0, fade)[:, None]
out /= np.max(np.abs(out)) / 0.6
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print("ok", sys.argv[1])
