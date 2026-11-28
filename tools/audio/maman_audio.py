"""Bande-son provisoire de « Qu'est-ce que tu m'as fait ?! » (test B) : ambiances, bruitages, musique, voix témoins.
Calée sur src/maman/MamanFilm.tsx. usage : python maman_audio.py <dossier public/maman> <sortie.wav>
"""
import sys, wave
import numpy as np

SR = 48000
DUR = 40.0
N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(23)

def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N or i < 0: return
    sig = sig[: N - i]
    L[i:i+len(sig)] += sig * gain * np.sqrt((1 - pan) / 2)
    R[i:i+len(sig)] += sig * gain * np.sqrt((1 + pan) / 2)

def lp(x, a):
    # passe-bas un pôle (implémentation par blocs via lfilter maison)
    y = np.empty_like(x); acc = 0.0
    for k in range(len(x)):
        acc += a * (x[k] - acc); y[k] = acc
    return y

def env(a, b, fade=0.2):
    e = np.zeros(N); ia, ib, f = int(a*SR), int(b*SR), int(fade*SR)
    e[ia:ib] = 1; e[ia:ia+f] = np.linspace(0, 1, f); e[max(ia, ib-f):ib] = np.linspace(1, 0, ib-max(ia, ib-f))
    return e

def read_wav(path):
    with wave.open(path) as w:
        sr, ch = w.getframerate(), w.getnchannels()
        d = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    if ch == 2: d = d.reshape(-1, 2).mean(axis=1)
    if sr != SR: d = np.interp(np.arange(0, len(d), sr / SR), np.arange(len(d)), d)
    return d

def tone(f, dur, decay):
    n = int(SR*dur); t = np.arange(n)/SR
    return np.sin(2*np.pi*f*t) * np.exp(-t/decay)

def noise_burst(dur, decay, hp=True):
    n = int(SR*dur); x = rng.standard_normal(n)
    if hp: x = x - lp(x, 0.15)
    return x * np.exp(-np.arange(n)/(SR*decay))

base_noise = rng.standard_normal(N)
hiss = base_noise - lp(base_noise, 0.05)
rumble = lp(rng.standard_normal(N), 0.003)

# ── Village (B1-B2, B9-B12) : vent léger, oiseaux du soir, poules ──
village = np.clip(env(0, 4.0) + env(24.0, 40.0, 0.4), 0, 1)
L += rumble * 0.4 * village; R += np.roll(rumble, 3000) * 0.4 * village
for k in range(40):
    at = rng.uniform(0, 4) if k < 14 else rng.uniform(24, 30)
    n = int(SR*0.09); t = np.arange(n)/SR
    f = rng.uniform(2800, 4200)
    add(np.sin(2*np.pi*(f + 900*np.sin(2*np.pi*14*t))*t)*np.hanning(n), at, 0.035, rng.uniform(-0.7, 0.7))
def cluck(at, pan):
    for j in range(rng.integers(3, 7)):
        n = int(SR*0.07); t = np.arange(n)/SR
        sig = np.sign(np.sin(2*np.pi*(520+rng.uniform(-60,120))*t)) * np.exp(-t/0.025)
        add(lp(sig, 0.25), at + j*0.09, 0.12, pan)
for at, pan in [(0.6, -0.5), (0.9, 0.4), (1.3, 0.1), (2.0, -0.3)]:
    cluck(at, pan)
    add(noise_burst(0.35, 0.12), at + 0.05, 0.06, pan)  # battements d'ailes
# pas de course des voisines (B2)
for k in range(10):
    add(lp(noise_burst(0.06, 0.012, False), 0.2), 2.55 + k*0.14, 0.35, -0.6 + k*0.12)

# ── B3 : rembobinage (VHS) ──
n = int(SR*1.3); t = np.arange(n)/SR
rew = np.sin(2*np.pi*np.cumsum(2400 - 1900*(t/1.3))/SR) * (0.6 + 0.4*np.sign(np.sin(2*np.pi*22*t)))
add(rew * np.minimum(1, t/0.05) * np.minimum(1, (1.3-t)/0.1), 4.05, 0.18)
add(noise_burst(1.3, 0.9, True), 4.05, 0.08)

# ── B4-B5 : Douala de jour, klaxons, rue ──
street = env(5.5, 10.0)
L += rumble * 1.1 * street + hiss * 0.012 * street; R += np.roll(rumble, 7000) * 1.1 * street + np.roll(hiss, 11) * 0.012 * street
for at, f, pan in [(5.9, 420, -0.6), (6.8, 380, 0.5), (8.2, 460, -0.2), (9.4, 410, 0.6)]:
    n = int(SR*0.35); t = np.arange(n)/SR
    add(np.sign(np.sin(2*np.pi*f*t)) * np.minimum(1, t/0.01) * np.minimum(1, (0.35-t)/0.03), at, 0.05, pan)
# TAP contacts (B5)
add(tone(1800, 0.03, 0.004), 8.9, 0.25)

# ── B6 : l'odyssée — pluie qui monte, course, moto, parapluie, rideaux métalliques ──
rain = np.clip(env(10.0, 24.0, 0.6) * np.clip((np.arange(N)/SR - 10.0)/3, 0, 1) + env(14, 24, 0.3)*0.0, 0, 1)
L += hiss * 0.05 * rain; R += np.roll(hiss, 997) * 0.05 * rain
for k in range(300):
    add(noise_burst(0.02, 0.003), rng.uniform(11, 24), 0.05, rng.uniform(-0.8, 0.8))
slot = 0.5
kinds = ["run","moto","queue","run","shutter","moto","queue","run","moto","shutter","queue","run","shutter","run"]
for i, kd in enumerate(kinds):
    t0 = 10.0 + i*slot
    add(noise_burst(0.12, 0.05), t0, 0.12)  # coupe sèche, souffle
    if kd == "run":
        for j in range(4): add(lp(noise_burst(0.05, 0.01, False), 0.25), t0 + 0.05 + j*0.11, 0.4, -0.5 + j*0.3)
    if kd == "moto":
        n = int(SR*0.5); t = np.arange(n)/SR
        f = 70 + 60*t/0.5
        eng = np.sign(np.sin(2*np.pi*np.cumsum(f)/SR)) * np.hanning(n)
        add(lp(eng, 0.12), t0, 0.35, -0.8 + 1.6*0.5)
        if i == 1: add(noise_burst(0.3, 0.1), t0 + 0.25, 0.25, 0.3)  # FLOP du parapluie
    if kd == "queue":
        for j in range(5): add(lp(rng.standard_normal(int(SR*0.12)), 0.08) * np.hanning(int(SR*0.12)), t0 + j*0.09, 0.25, rng.uniform(-0.5, 0.5))
    if kd == "shutter":
        n = int(SR*0.38); t = np.arange(n)/SR
        rattle = (rng.standard_normal(n) * (0.5 + 0.5*np.sign(np.sin(2*np.pi*38*t)))) * np.minimum(1, t/0.02)
        add(rattle - lp(rattle, 0.1), t0 + 0.02, 0.25)
        add(lp(noise_burst(0.3, 0.06, False), 0.08) + tone(110, 0.3, 0.07), t0 + 0.4, 0.7)  # BANG du rideau
# cœur qui bat pendant l'odyssée
t = 10.2; per = 0.55
while t < 17.0:
    for d, g in [(0, 1), (0.13, 0.65)]:
        n = int(SR*0.22); tt = np.arange(n)/SR
        add(np.sin(2*np.pi*(52 + 28*np.exp(-tt/0.03))*tt)*np.exp(-tt/0.07), t + d, 0.45*g)
    t += per; per = max(0.36, per*0.95)

# ── B7 : marche sous la pluie, néon qui grésille ──
neon = env(17.0, 24.0)
n = N; tt = np.arange(N)/SR
L += np.sin(2*np.pi*100*tt) * 0.01 * neon; R += np.sin(2*np.pi*100*tt) * 0.01 * neon
for j in range(6): add(lp(noise_burst(0.05, 0.012, False), 0.2), 17.1 + j*0.18, 0.25, 0.6 - j*0.1)

# ── B8 : TAP x étapes, PIN, FWIIIP ──
for off in [0.15, 0.6, 0.9, 1.6, 2.1, 2.45, 2.6, 2.75, 2.9]:
    add(tone(1800, 0.03, 0.004), 20.2 + off, 0.3)
n = int(SR*1.0); t = np.arange(n)/SR
sweep = np.sin(2*np.pi*np.cumsum(300 + 2600*(t/1.0)**2)/SR) * np.exp(-((t-0.45)**2)/0.06)
nz = rng.standard_normal(n) * np.exp(-((t-0.5)**2)/0.04)
add(sweep*0.5 + (nz - lp(nz, 0.2))*0.3, 23.15, 0.6)

# ── B9 : vibration sur la table, bips, puis SILENCE d'1 s ──
def buzz(dur):
    n = int(SR*dur); t = np.arange(n)/SR
    motor = np.sin(2*np.pi*165*t) + 0.6*np.sin(2*np.pi*330*t)
    rat = lp(rng.standard_normal(n), 0.3) * (0.5 + 0.5*np.sign(np.sin(2*np.pi*82*t)))
    return (motor*0.5 + rat*0.6) * (np.sin(2*np.pi*2.4*t) > -0.3) * np.minimum(1, t/0.02)
add(buzz(1.1), 24.05, 0.45, 0.2)
for d in (0, 0.15):
    add(np.sign(np.sin(2*np.pi*1760*np.arange(int(SR*0.09))/SR))*0.3, 25.0 + d, 0.35)
quiet = np.ones(N)
a, b, c = int(25.35*SR), int(26.35*SR), int(26.9*SR)
quiet[int(25.2*SR):a] = np.linspace(1, 0.02, a - int(25.2*SR)); quiet[a:b] = 0.02; quiet[b:c] = np.linspace(0.02, 1, c - b)
L *= quiet; R *= quiet

# ── B10-B12 : rires, feu, musique de fête (percussions + mélodie) ──
fire = env(30.0, 40.0, 0.5)
for k in range(int(10*8)):
    add(noise_burst(0.012, 0.002), rng.uniform(30, 40), 0.08, rng.uniform(-0.4, 0.4))
L += rumble * 0.5 * fire; R += rumble * 0.5 * fire
def laugh(at, f0, pan):
    for j in range(rng.integers(5, 9)):
        n = int(SR*0.11); t = np.arange(n)/SR
        v = np.sin(2*np.pi*(f0 + 40*np.sin(2*np.pi*6*t))*t) + 0.4*rng.standard_normal(n)*0.3
        add(lp(v, 0.3) * np.hanning(n), at + j*0.13, 0.12, pan)
for at, f0, pan in [(29.95, 300, -0.2), (30.4, 360, 0.4), (31.2, 250, -0.5), (32.6, 320, 0.3), (34.0, 280, -0.3)]:
    laugh(at, f0, pan)
bpm = 118; beat = 60/bpm
t = 29.9
i = 0
while t < 39.6:
    kick = np.sin(2*np.pi*(55 + 90*np.exp(-np.arange(int(SR*0.25))/(SR*0.02)))*np.arange(int(SR*0.25))/SR) * np.exp(-np.arange(int(SR*0.25))/(SR*0.09))
    if i % 2 == 0: add(kick, t, 0.55)
    add(noise_burst(0.05, 0.01), t + beat/2, 0.12, 0.3)                 # shaker
    if i % 4 in (1, 3): add(lp(noise_burst(0.12, 0.04, False), 0.35) + tone(220, 0.12, 0.05), t, 0.3, -0.2)  # tam-tam
    if i % 8 == 6: add(tone(330, 0.15, 0.05) + tone(495, 0.15, 0.04), t + beat/4, 0.18, 0.4)
    t += beat; i += 1
def pluck(f, dur=0.5):
    n = int(SR*dur); tt = np.arange(n)/SR
    return sum(np.sin(2*np.pi*f*h*tt) * 0.55**(h-1) for h in range(1, 5)) * np.exp(-tt/0.18) * np.minimum(1, tt/0.004)
mel = ["E5","G5","A5","G5","E5","D5","C5","D5","E5","G5","C6","A5","G5","E5","D5","E5"]
names = {"C":0,"D":2,"E":4,"F":5,"G":7,"A":9,"B":11}
fq = lambda nm: 440*2**((names[nm[0]] + 12*(int(nm[-1])-4) - 9)/12)
for k in range(int((39.4-30.4)/(beat))):
    nm = mel[k % len(mel)]
    add(pluck(fq(nm)), 30.4 + k*beat, 0.12, 0.25 if k % 2 else -0.25)
    if k % 2 == 0: add(pluck(fq(nm)/2, 0.7), 30.4 + k*beat, 0.08, 0)

# ── Voix témoins ──
base = sys.argv[1]
for vid, at in [("b1", 0.2), ("b2", 2.5), ("b4", 5.7), ("b5", 8.6), ("b7", 17.6), ("b10a", 27.15), ("b10b", 28.8)]:
    add(read_wav(f"{base}/vo/{vid}.wav"), at, 1.0)

out = np.stack([L, R], axis=1)
out[-int(SR*0.5):] *= np.linspace(1, 0, int(SR*0.5))[:, None]
out /= np.max(np.abs(out)) / 0.9
with wave.open(sys.argv[2], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out*32767).astype(np.int16).tobytes())
print("ok", sys.argv[2])
