"""Interfaz comun de modelos (CNN, ViT...). Cambiar de modelo = cambiar model_name en la configuracion."""
import json
from pathlib import Path

import timm
import torch


def create_model(name: str, num_classes: int, pretrained: bool = True):
    return timm.create_model(name, pretrained=pretrained, num_classes=num_classes)


def load_package(package_dir):
    """Carga un paquete de modelo (carpeta con package.json + model.pt)."""
    d = Path(package_dir)
    meta = json.loads((d / "package.json").read_text(encoding="utf-8"))
    model = create_model(meta["model_name"], len(meta["classes"]), pretrained=False)
    model.load_state_dict(torch.load(d / "model.pt", map_location="cpu"))
    model.eval()
    return model, meta