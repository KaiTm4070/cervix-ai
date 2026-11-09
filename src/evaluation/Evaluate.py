"""Evaluacion UNICA sobre el conjunto de prueba. Genera metricas.json y matriz de confusion."""
import argparse
import json
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import torch
import yaml
from sklearn.metrics import accuracy_score, confusion_matrix, precision_recall_fscore_support
from torch.utils.data import DataLoader

from src.models.factory import load_package
from src.preprocessing.transforms import eval_transform
from src.training.dataset import SplitDataset


def main(cfg_path: str) -> None:
    cfg = yaml.safe_load(open(cfg_path, encoding="utf-8"))
    pkg = Path("models") / cfg["run_name"]
    model, meta = load_package(pkg)
    classes = meta["classes"]
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.to(device)

    sp = json.load(open(cfg["splits_file"], encoding="utf-8"))
    dl = DataLoader(SplitDataset(cfg["dataset_dir"], sp["splits"]["test"], eval_transform(meta["img_size"])),
                    batch_size=cfg["batch_size"], num_workers=cfg["num_workers"])
    ys, ps = [], []
    with torch.no_grad():
        for x, y in dl:
            ps += model(x.to(device)).argmax(1).tolist()
            ys += y.tolist()

    cm = confusion_matrix(ys, ps, labels=range(len(classes)))
    prec, rec, f1, _ = precision_recall_fscore_support(ys, ps, labels=range(len(classes)), zero_division=0)
    total = cm.sum()
    tp = np.diag(cm)
    fp = cm.sum(0) - tp
    fn = cm.sum(1) - tp
    esp_clase = (total - tp - fp - fn) / np.maximum(total - tp - fn, 1)

    normales = [classes.index(c) for c in cfg["normal_classes"]]
    if normales:  # sensibilidad/especificidad binarias: anormal = positivo
        yb = np.array([0 if y in normales else 1 for y in ys])
        pb = np.array([0 if p in normales else 1 for p in ps])
        TP, FN = ((yb == 1) & (pb == 1)).sum(), ((yb == 1) & (pb == 0)).sum()
        TN, FP = ((yb == 0) & (pb == 0)).sum(), ((yb == 0) & (pb == 1)).sum()
        sens, esp, modo = TP / max(TP + FN, 1), TN / max(TN + FP, 1), "binario normal vs anormal"
    else:
        sens, esp, modo = float(rec.mean()), float(esp_clase.mean()), "promedio macro"

    metricas = {  # los 4 primeros campos coinciden con POST /metricas (agrega id_version)
        "exactitud": round(float(accuracy_score(ys, ps)), 4), "sensibilidad": round(float(sens), 4),
        "especificidad": round(float(esp), 4), "f1": round(float(f1.mean()), 4),
        "modo_sens_esp": modo, "n_test": int(total),
        "por_clase": {c: {"precision": round(float(prec[i]), 4), "sensibilidad": round(float(rec[i]), 4),
                        "especificidad": round(float(esp_clase[i]), 4), "f1": round(float(f1[i]), 4)}
                    for i, c in enumerate(classes)},
        "matriz_confusion": cm.tolist(),
    }
    (pkg / "metricas.json").write_text(json.dumps(metricas, indent=2, ensure_ascii=False), encoding="utf-8")

    fig, ax = plt.subplots(figsize=(6, 5))
    ax.imshow(cm, cmap="Blues")
    ax.set_xticks(range(len(classes)), classes, rotation=45, ha="right")
    ax.set_yticks(range(len(classes)), classes)
    for i in range(len(classes)):
        for j in range(len(classes)):
            ax.text(j, i, cm[i, j], ha="center", va="center")
    ax.set_xlabel("Predicha")
    ax.set_ylabel("Real")
    fig.tight_layout()
    fig.savefig(pkg / "matriz_confusion.png", dpi=150)

    print(json.dumps({k: v for k, v in metricas.items() if k not in ("por_clase", "matriz_confusion")}, indent=2))
    ok = metricas["sensibilidad"] >= 0.85 and metricas["especificidad"] >= 0.80
    print("Cumple umbrales (sens >= 85 %, esp >= 80 %):", "SI" if ok else "NO")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="configs/training.yaml")
    main(ap.parse_args().config)