"""Particion train/val/test UNA sola vez, sin fuga entre imagenes madre y sin duplicados exactos."""
import argparse
import hashlib
import json
import random
import re
from pathlib import Path

import yaml

EXT = {".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff"}


def main(cfg_path: str, force: bool) -> None:
    cfg = yaml.safe_load(open(cfg_path, encoding="utf-8"))
    out = Path(cfg["splits_file"])
    if out.exists() and not force:
        raise SystemExit("La particion ya existe y debe hacerse una sola vez. Usa --force solo si cambias de dataset.")

    root = Path(cfg["dataset_dir"])
    rx = re.compile(cfg["group_regex"])
    classes = sorted(d.name for d in root.iterdir() if d.is_dir())
    if not classes:
        raise SystemExit(f"No hay carpetas de clases en {root}.")
    rng = random.Random(cfg["seed"])
    splits = {"train": [], "val": [], "test": []}

    for ci, c in enumerate(classes):
        grupos = {}
        for p in sorted((root / c).rglob("*")):
            if p.suffix.lower() in EXT:
                m = rx.match(p.stem)
                grupos.setdefault(m.group(1) if m else p.stem, []).append(p.relative_to(root).as_posix())
        claves = sorted(grupos)
        rng.shuffle(claves)
        n = len(claves)
        n_tr, n_va = round(n * cfg["split"]["train"]), round(n * cfg["split"]["val"])
        partes = {"train": claves[:n_tr], "val": claves[n_tr:n_tr + n_va], "test": claves[n_tr + n_va:]}
        for s, ks in partes.items():
            for k in ks:
                splits[s] += [[f, ci] for f in grupos[k]]

    vistos = {}  # verificacion: ninguna imagen identica en dos conjuntos
    for s, items in splits.items():
        for f, _ in items:
            h = hashlib.md5((root / f).read_bytes()).hexdigest()
            if h in vistos and vistos[h] != s:
                raise SystemExit(f"Imagen duplicada entre {vistos[h]} y {s}: {f}")
            vistos[h] = s

    conteo = {s: [sum(1 for _, y in items if y == i) for i in range(len(classes))] for s, items in splits.items()}
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({
        "dataset_version": cfg["dataset_version"], "seed": cfg["seed"], "classes": classes,
        "counts": conteo, "splits": splits,
    }, ensure_ascii=False), encoding="utf-8")
    print("Clases:", classes)
    for s, c in conteo.items():
        print(f"{s:5s} total={sum(c):5d}  por clase={c}")
    print("Verificacion de duplicados: OK ->", out)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="configs/training.yaml")
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    main(a.config, a.force)