"""Téléchargeur d'assets Poly Haven (licence CC0) pour le chantier vidéo Mvic.
usage : python polyhaven.py <dossier_sortie> model:ID ... tex:ID ... hdri:ID ...
Modèles : glTF 1k (+ textures incluses). Textures : diffuse, normale GL, rugosité (1k JPG). HDRI : 1k .hdr
"""
import json, os, sys, urllib.request

API = "https://api.polyhaven.com/files/"

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "mvic-motion-asset-fetcher/1.0"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()

def save(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(data)

def model(out, aid, res="1k"):
    files = json.loads(get(API + aid))
    g = files["gltf"][res]["gltf"]
    base = os.path.join(out, "models", aid)
    save(os.path.join(base, os.path.basename(g["url"])), get(g["url"]))
    for rel, meta in g.get("include", {}).items():
        save(os.path.join(base, rel), get(meta["url"]))
    print("modèle", aid, "ok")

def tex(out, aid, res="1k"):
    files = json.loads(get(API + aid))
    base = os.path.join(out, "textures", aid)
    for key, name in [("Diffuse", "diff"), ("nor_gl", "nor"), ("Rough", "rough"), ("AO", "ao")]:
        if key in files and res in files[key]:
            entry = files[key][res].get("jpg") or files[key][res].get("png")
            save(os.path.join(base, f"{name}.jpg"), get(entry["url"]))
    print("texture", aid, "ok")

def hdri(out, aid, res="1k"):
    files = json.loads(get(API + aid))
    entry = files["hdri"][res]["hdr"]
    save(os.path.join(out, "hdri", f"{aid}.hdr"), get(entry["url"]))
    print("hdri", aid, "ok")

if __name__ == "__main__":
    out = sys.argv[1]
    for spec in sys.argv[2:]:
        kind, aid = spec.split(":", 1)
        try:
            {"model": model, "tex": tex, "hdri": hdri}[kind](out, aid)
        except Exception as e:  # noqa: BLE001
            print("ÉCHEC", spec, e)
