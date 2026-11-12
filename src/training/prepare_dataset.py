"""Prepara data/processed a partir de data/raw: unifica las etiquetas de los datasets y deja
una carpeta por clase. Cada archivo se renombra como  <dataset>__<grupo>__<original>.<ext>
para que la particion (split.py) agrupe imagenes del mismo caso y no las separe entre conjuntos.

Esquemas:
    binario    NORMAL / ANORMAL con los 3 datasets (el que mide sensibilidad/especificidad de la guia)
    bethesda   NORMAL / LSIL / HSIL / CANCER con cpsmi2025 y lbc_hussain (SIPaKMeD no se mapea a grados)
    original   las clases originales de UN solo dataset
"""
import argparse
import json
import re
import shutil
from collections import Counter, defaultdict
from pathlib import Path

IMG = {".jpg", ".jpeg", ".png", ".bmp"}


def limpio(s: str) -> str:
    return re.sub(r"[^A-Za-z0-9-]+", "-", s).strip("-")


# --- Lectores: devuelven (clase_original, grupo, ruta) --------------------------------------
def leer_sipakmed(raw: Path):
    # Solo recortes de celulas (CROPPED/*.bmp). El grupo es la imagen madre (prefijo del nombre).
    for p in sorted(raw.rglob("*")):
        partes = p.relative_to(raw).parts
        if p.suffix.lower() == ".bmp" and any(x.upper() == "CROPPED" for x in partes):
            clase = next((x[3:] for x in partes if x.startswith("im_")), None)
            if clase:
                yield clase, f"{clase}-{p.stem.split('_')[0]}", p


def leer_cpsmi(raw: Path):
    # Estructura: <categoria>/<subcategoria>/imagen.jpg. Los nombres no traen id de lamina:
    # cada imagen es su propio grupo (limitacion conocida).
    for p in sorted(raw.rglob("*")):
        if p.suffix.lower() in IMG:
            yield f"{p.parent.parent.name}/{p.parent.name}", p.stem, p


RX_LBC = re.compile(r"^(.+?_\d+)_?\s*\(\d+\)$")  # LSIL_4 (24) -> grupo LSIL_4


def leer_lbc(raw: Path):
    for p in sorted(raw.rglob("*")):
        if p.suffix.lower() in IMG:
            m = RX_LBC.match(p.stem)
            yield p.parent.name, (m.group(1) if m else p.stem), p


LECTORES = {"sipakmed": leer_sipakmed, "cpsmi2025": leer_cpsmi, "lbc_hussain": leer_lbc}

# --- Mapeos de etiquetas (REVISAR con el asesor medico) -------------------------------------
BINARIO = {
    "sipakmed": {"Superficial-Intermediate": "NORMAL", "Parabasal": "NORMAL", "Metaplastic": "NORMAL",
                    "Koilocytotic": "ANORMAL", "Dyskeratotic": "ANORMAL"},
    "cpsmi2025": {"normal/metaplasia": "NORMAL", "normal/squamous": "NORMAL", "normal/endocervical": "NORMAL",
                    "others/inflammatory": "NORMAL", "lesion/low_grade": "ANORMAL", "lesion/high_grade": "ANORMAL",
                    "cancer/adeno": "ANORMAL", "cancer/in_situ": "ANORMAL", "cancer/invasive": "ANORMAL"},
    "lbc_hussain": {"Negative for Intraepithelial malignancy": "NORMAL",
                    "Low squamous intra-epithelial lesion": "ANORMAL",
                    "High squamous intra-epithelial lesion": "ANORMAL", "Squamous cell carcinoma": "ANORMAL"},
}
BETHESDA = {
    "cpsmi2025": {"normal/metaplasia": "NORMAL", "normal/squamous": "NORMAL", "normal/endocervical": "NORMAL",
                    "others/inflammatory": "NORMAL", "lesion/low_grade": "LSIL", "lesion/high_grade": "HSIL",
                    "cancer/adeno": "CANCER", "cancer/in_situ": "CANCER", "cancer/invasive": "CANCER"},
    "lbc_hussain": {"Negative for Intraepithelial malignancy": "NORMAL",
                    "Low squamous intra-epithelial lesion": "LSIL",
                    "High squamous intra-epithelial lesion": "HSIL", "Squamous cell carcinoma": "CANCER"},
}
ESQUEMAS = {"binario": BINARIO, "bethesda": BETHESDA}


def main(a) -> None:
    raw, out = Path(a.raw), Path(a.out)
    if a.esquema == "original" and len(a.datasets) != 1:
        raise SystemExit("El esquema original se usa con UN solo dataset: --datasets sipakmed")
    if out.exists() and any(out.iterdir()):
        if not a.force:
            raise SystemExit(f"{out} ya tiene contenido. Usa --force para rehacerlo.")
        shutil.rmtree(out)

    cuenta, omitidas = defaultdict(Counter), Counter()
    for ds in a.datasets:
        if a.esquema != "original" and ds not in ESQUEMAS[a.esquema]:
            print(f"AVISO: {ds} no se usa en el esquema {a.esquema}.")
            continue
        carpeta = raw / ds
        if not carpeta.exists():
            raise SystemExit(f"No existe {carpeta}")
        mapa = None if a.esquema == "original" else ESQUEMAS[a.esquema][ds]
        for orig, grupo, p in LECTORES[ds](carpeta):
            clase = limpio(orig) if mapa is None else mapa.get(orig)
            if clase is None:
                omitidas[(ds, orig)] += 1
                continue
            dest = out / clase
            dest.mkdir(parents=True, exist_ok=True)
            nombre = f"{ds}__{limpio(grupo)}__{limpio(orig)}-{limpio(p.stem)}{p.suffix.lower()}"
            shutil.copy2(p, dest / nombre)
            cuenta[clase][ds] += 1

    if not cuenta:
        raise SystemExit("No se copio ninguna imagen. Revisa las rutas de --raw.")
    datasets = sorted({ds for c in cuenta.values() for ds in c})
    print(f"\nEsquema: {a.esquema}\n{'clase':28s}" + "".join(f"{d:>14s}" for d in datasets) + f"{'total':>9s}")
    for clase in sorted(cuenta):
        print(f"{clase:28s}" + "".join(f"{cuenta[clase][d]:14d}" for d in datasets) + f"{sum(cuenta[clase].values()):9d}")
    if omitidas:
        print("\nOmitidas (clase original sin mapeo en este esquema):")
        for (ds, orig), n in omitidas.items():
            print(f"  {ds} / {orig}: {n}")
    (out / "_resumen.json").write_text(json.dumps(
        {"esquema": a.esquema, "conteo": {c: dict(v) for c, v in cuenta.items()}}, indent=2, ensure_ascii=False),
        encoding="utf-8")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--raw", default="data/raw")
    ap.add_argument("--out", default="data/processed")
    ap.add_argument("--esquema", choices=["binario", "bethesda", "original"], default="binario")
    ap.add_argument("--datasets", nargs="+", default=list(LECTORES), choices=list(LECTORES))
    ap.add_argument("--force", action="store_true")
    main(ap.parse_args())