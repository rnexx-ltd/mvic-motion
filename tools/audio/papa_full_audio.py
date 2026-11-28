"""Bande-son provisoire complète de « Le vocal de Papa » (test A) : ambiances, bruitages, musique, voix témoins.
Calée sur T de src/papa/PapaFull.tsx. Sortie : public/papa/papa-full-audio.wav (48 kHz, normalisation à faire ensuite).
usage : python papa_full_audio.py <dossier public/papa> <sortie.wav>
"""
import sys, wave
import numpy as np

SR = 48000
DUR = 50.6
N = int(SR * DUR)
L = np.zeros(N)
R = np.zeros(N)
rng = np.random.default_rng(11)
T = dict(A1=0, A2=3.2, A3=7.4, A4=12.0, A5=15.6, A6=19.6, A7=24.4, A8=30.0, A9=34.0, A10=38.8, A11=44.8, END=50.3)

def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N or i < 0:
        return
    sig = sig[: N - i]
    L[i : i + len(sig)] += sig * gain * np.sqrt((1 - pan) / 2)
    R[i : i + len(sig)] += sig * gain * np.sqrt((1 + pan) / 2)

def onepole(x, a):
    # passe-bas simple, vectorisé par filtrage récursif (scipy absent)
    y = np.empty_like(x)
    acc = 0.0
    for k in range(len(x)):
        acc += a * (x[k] - acc)
        y[k] = acc
    return y

def env_between(a, b, fade=0.3):
    e = np.zeros(N)
    ia, ib, f = int(a * SR), int(b * SR), int(fade * SR)
    e[ia:ib] = 1
    e[ia : ia + f] = np.linspace(0, 1, f)
    e[max(ia, ib - f) : ib] = np.linspace(1, 0, ib - max(ia, ib - f))
    return e

def read_wav(path):
    with wave.open(path) as w:
        sr = w.getframerate()
        ch = w.getnchannels()
        data = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    if ch == 2:
        data = data.reshape(-1, 2).mean(axis=1)
    if sr != SR:
        idx = np.arange(0, len(data), sr / SR)
        data = np.interp(idx, np.arange(len(data)), data)
    return data

# ── Ambiance « case du père » : grillons + flamme (sur les plans de la table) ──
table = env_between(0, 7.4) + env_between(19.6, 24.4) + env_between(34.0, 50.6)
table = np.clip(table, 0, 1)
crick = np.zeros(N)
for c in range(3):
    f0 = 4300 + c * 350
    t0 = c * 0.21
    while t0 < DUR:
        n = int(SR * 0.16)
        tt = np.arange(n) / SR
        ch = np.sin(2 * np.pi * f0 * tt) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 32 * tt))) * np.hanning(n)
        i = int(t0 * SR)
        crick[i : i + n] += ch[: max(0, N - i)]
        t0 += 0.9 + c * 0.37
crackle = np.zeros(N)
for k in range(int(DUR * 7)):
    i = int(rng.uniform(0, DUR) * SR)
    n = int(SR * 0.012)
    pop = rng.standard_normal(n) * np.exp(-np.arange(n) / (SR * 0.002))
    crackle[i : i + n] += pop[: max(0, N - i)] * rng.uniform(0.3, 1)
L += (crick * 0.05 + crackle * 0.1) * table
R += (crick * 0.05 + crackle * 0.08) * table

# ── Pluie (chambre, impasse, début du vol) ──
rain_env = np.clip(env_between(7.4, 19.6, 0.4) + env_between(24.4, 31.5, 0.4), 0, 1)
rain = rng.standard_normal(N)
rain = rain - onepole(rain, 0.05)  # passe-haut : souffle de pluie
L += rain * 0.035 * rain_env
R += np.roll(rain, 997) * 0.035 * rain_env
for k in range(int(12 * 40)):
    at = rng.uniform(7.4, 19.6) if k % 2 else rng.uniform(24.4, 31.0)
    n = int(SR * 0.02)
    add(rng.standard_normal(n) * np.exp(-np.arange(n) / (SR * 0.003)), at, 0.05, rng.uniform(-0.8, 0.8))

# ── Ville lointaine (chambre) ──
city = onepole(rng.standard_normal(N), 0.004) * env_between(7.4, 15.6)
L += city * 0.5
R += city * 0.5

# ── Tic d'horloge (A4) ──
for k in range(4):
    n = int(SR * 0.02)
    add(np.sin(2 * np.pi * 2200 * np.arange(n) / SR) * np.exp(-np.arange(n) / (SR * 0.003)), T["A4"] + 0.3 + k, 0.25, 0.3)

# ── Battement sourd qui accélère (A5) ──
t = T["A5"]
period = 0.62
while t < T["A6"] - 0.1:
    for d, g in [(0, 1.0), (0.14, 0.7)]:
        n = int(SR * 0.25)
        tt = np.arange(n) / SR
        add(np.sin(2 * np.pi * (55 + 30 * np.exp(-tt / 0.03)) * tt) * np.exp(-tt / 0.08), t + d, 0.6 * g)
    t += period
    period = max(0.32, period * 0.9)

# ── TAP des étapes Mvic (A7) et FWIIIP (départ de l'argent) ──
for off in [0.1, 0.25, 0.95, 1.9, 2.3, 3.2, 4.0, 4.2, 4.4, 4.6]:
    n = int(SR * 0.03)
    add(np.sin(2 * np.pi * 1800 * np.arange(n) / SR) * np.exp(-np.arange(n) / (SR * 0.004)), T["A7"] + off, 0.3)
n = int(SR * 1.2)
tt = np.arange(n) / SR
sweep = np.sin(2 * np.pi * np.cumsum(300 + 2600 * (tt / 1.2) ** 2) / SR) * np.exp(-((tt - 0.5) ** 2) / 0.08)
noise = rng.standard_normal(n) * np.exp(-((tt - 0.6) ** 2) / 0.05)
add(sweep * 0.5 + (noise - onepole(noise, 0.2)) * 0.3, 29.7, 0.6)

# ── Vibration sur le bois + bips SMS (A9) ──
def buzz(dur):
    n = int(SR * dur)
    tt = np.arange(n) / SR
    motor = np.sin(2 * np.pi * 165 * tt) + 0.6 * np.sin(2 * np.pi * 330 * tt)
    rattle = onepole(rng.standard_normal(n), 0.3) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 82 * tt)))
    return (motor * 0.5 + rattle * 0.6) * (np.sin(2 * np.pi * 2.2 * tt) > -0.3) * np.minimum(1, tt / 0.02)

add(buzz(1.6), T["A9"] + 0.4, 0.45, 0.2)
for d in (0, 0.15):
    n = int(SR * 0.09)
    add(np.sign(np.sin(2 * np.pi * 1760 * np.arange(n) / SR)) * 0.3, T["A9"] + 2.1 + d, 0.35, 0.2)

# ── Silence total après la réception ──
quiet = np.ones(N)
a, b, c = int(36.8 * SR), int(38.3 * SR), int(39.2 * SR)
quiet[int(36.65 * SR) : a] = np.linspace(1, 0.02, a - int(36.65 * SR))
quiet[a:b] = 0.02
quiet[b:c] = np.linspace(0.02, 1, c - b)
L *= quiet
R *= quiet

# ── Musique : piano doux, démarre au vol de nuit, monte jusqu'à la fin ──
def note(nm):
    names = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
    return 440 * 2 ** ((names[nm[0]] + 12 * (int(nm[-1]) - 4) - 9) / 12)

def piano(freq, dur=3.5):
    n = int(SR * dur)
    tt = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * freq * h * tt) * (0.6 ** (h - 1)) * np.exp(-tt * (0.9 + h * 0.5)) for h in range(1, 6)) * np.minimum(1, tt / 0.006)

music = [
    (30.0, ["C3", "G3", "E4"], 0.16), (32.0, ["A2", "E3", "C4"], 0.16),
    (39.2, ["C3", "G3", "E4"], 0.18), (40.8, ["A2", "E3", "C4"], 0.18),
    (42.1, ["F2", "C3", "A3", "F4"], 0.24), (43.6, ["G2", "D3", "B3", "G4"], 0.24),
    (45.0, ["C3", "G3", "E4", "C5"], 0.26), (47.2, ["A2", "E3", "C4", "A4"], 0.24), (48.8, ["F2", "C3", "A3", "C5"], 0.22),
]
for at, notes, g in music:
    for j, nm in enumerate(notes):
        add(piano(note(nm)), at + j * 0.05, g, -0.2 + j * 0.15)
for at, nm in [(42.2, "E5"), (42.9, "D5"), (43.4, "C5"), (45.1, "G5"), (45.8, "E5")]:
    add(piano(note(nm), 2.5), at, 0.12, 0.2)

# ── Voix témoins ──
base = sys.argv[1]
voices = [("1a", 0.35), ("1b", 1.9), ("2a", 3.5), ("2b", 5.9), ("3a", 7.8), ("3b", 10.0), ("3c", 12.4), ("4a", 19.9), ("4b", 23.0), ("5", 39.4), ("6", 42.1)]
for vid, at in voices:
    v = read_wav(f"{base}/vo/{vid}.wav")
    add(v, at, 1.0, 0.0)

out = np.stack([L, R], axis=1)
out[-int(SR * 0.6) :] *= np.linspace(1, 0, int(SR * 0.6))[:, None]
out /= np.max(np.abs(out)) / 0.9
with wave.open(sys.argv[2], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print("ok", sys.argv[2])
