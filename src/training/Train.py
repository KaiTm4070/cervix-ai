"""Entrenamiento por transfer learning. Usa SOLO train y val (el test queda intacto)."""
import argparse
import json
import platform
import random
from pathlib import Path

import numpy as np
import timm
import torch
import yaml
from sklearn.metrics import f1_score
from torch.utils.data import DataLoader

from src.models.Factory import create_model
from src.preprocessing.Transform import MEAN, STD, eval_transform, train_transform
from src.training.dataset import SplitDataset


def seed_all(s: int) -> None:
    random.seed(s)
    np.random.seed(s)
    torch.manual_seed(s)
    torch.cuda.manual_seed_all(s)


def run_epoch(model, loader, loss_fn, device, opt=None):
    entrenando = opt is not None
    model.train(entrenando)
    perdida, ys, ps = 0.0, [], []
    with torch.set_grad_enabled(entrenando):
        for x, y in loader:
            x, y = x.to(device), y.to(device)
            out = model(x)
            loss = loss_fn(out, y)
            if entrenando:
                opt.zero_grad()
                loss.backward()
                opt.step()
            perdida += loss.item() * len(y)
            ys += y.tolist()
            ps += out.argmax(1).tolist()
    return perdida / len(ys), f1_score(ys, ps, average="macro")


def main(cfg_path: str) -> None:
    cfg = yaml.safe_load(open(cfg_path, encoding="utf-8"))
    seed_all(cfg["seed"])
    device = "cuda" if torch.cuda.is_available() else "cpu"
    sp = json.load(open(cfg["splits_file"], encoding="utf-8"))
    classes, root, size = sp["classes"], Path(cfg["dataset_dir"]), cfg["img_size"]

    def loader(s, tf, shuffle):
        return DataLoader(SplitDataset(root, sp["splits"][s], tf), batch_size=cfg["batch_size"],
                        shuffle=shuffle, num_workers=cfg["num_workers"])

    tr, va = loader("train", train_transform(size), True), loader("val", eval_transform(size), False)
    cuentas = np.bincount([y for _, y in sp["splits"]["train"]], minlength=len(classes))
    pesos = torch.tensor(cuentas.sum() / (len(classes) * np.maximum(cuentas, 1)), dtype=torch.float32, device=device)

    model = create_model(cfg["model_name"], len(classes)).to(device)
    loss_fn = torch.nn.CrossEntropyLoss(weight=pesos)
    out_dir = Path("models") / cfg["run_name"]
    out_dir.mkdir(parents=True, exist_ok=True)

    mejor, sin_mejora, historia, opt = -1.0, 0, [], None
    for ep in range(cfg["epochs"]):
        if ep == 0 or ep == cfg["freeze_epochs"]:
            congelado = ep < cfg["freeze_epochs"]
            for p in model.parameters():
                p.requires_grad = not congelado
            for p in model.get_classifier().parameters():
                p.requires_grad = True
            opt = torch.optim.AdamW([p for p in model.parameters() if p.requires_grad],
                                    lr=cfg["lr_head"] if congelado else cfg["lr_finetune"])
        tl, tf1 = run_epoch(model, tr, loss_fn, device, opt)
        vl, vf1 = run_epoch(model, va, loss_fn, device)
        historia.append({"epoca": ep + 1, "train_loss": tl, "train_f1": tf1, "val_loss": vl, "val_f1": vf1})
        print(f"Epoca {ep + 1:02d}  train_loss={tl:.3f} f1={tf1:.3f} | val_loss={vl:.3f} f1={vf1:.3f}")
        if vf1 > mejor:
            mejor, sin_mejora = vf1, 0
            torch.save(model.state_dict(), out_dir / "model.pt")
        else:
            sin_mejora += 1
            if sin_mejora >= cfg["patience"]:
                print("Parada temprana.")
                break

    # Paquete de modelo versionado (RNF-07.1): configuracion, dataset, semilla, parametros y entorno
    meta = {
        "run_name": cfg["run_name"], "model_name": cfg["model_name"], "classes": classes, "img_size": size,
        "mean": MEAN, "std": STD, "dataset_version": sp["dataset_version"], "seed": cfg["seed"],
        "params": {k: cfg[k] for k in ("batch_size", "epochs", "freeze_epochs", "lr_head", "lr_finetune", "patience")},
        "env": {"python": platform.python_version(), "torch": torch.__version__, "timm": timm.__version__, "device": device},
        "best_val_f1": mejor, "history": historia,
    }
    (out_dir / "package.json").write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Mejor F1 en validacion: {mejor:.3f}. Paquete guardado en {out_dir}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="configs/training.yaml")
    main(ap.parse_args().config)