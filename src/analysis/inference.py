"""Interfaz de prediccion usada por la API. Si existe un paquete real en MODEL_DIR lo usa;
si no, responde con un SIMULADOR para poder desarrollar el resto del sistema."""
import random
from pathlib import Path

from PIL import Image

from src.common.config import MODEL_DIR as MODEL_DIR_VALUE

MODEL_DIR = Path(MODEL_DIR_VALUE)
CODIGOS = ["NORMAL", "ANORMAL"]
_cache = None


def _cargar():
    global _cache  # el modelo se carga una sola vez, no en cada analisis
    if _cache is None:
        if (MODEL_DIR / "package.json").exists():
            from src.models.Factory import load_package
            from src.preprocessing.Transform import eval_transform
            model, meta = load_package(MODEL_DIR)
            _cache = ("real", model, meta, eval_transform(meta["img_size"]))
        else:
            _cache = ("simulado", None, None, None)
    return _cache


def es_simulado() -> bool:
    return _cargar()[0] == "simulado"


def predict(img: Image.Image) -> tuple[str, float]:
    category, confidence, _ = predict_with_interpretability(img)
    return category, confidence


def predict_with_interpretability(img: Image.Image) -> tuple[str, float, str | None]:
    modo, model, meta, tf = _cargar()
    if modo == "simulado":
        return random.choice(CODIGOS), round(random.uniform(0.5, 0.99), 4), None
    import torch

    with torch.no_grad():
        probs = torch.softmax(model(tf(img.convert("RGB")).unsqueeze(0)), dim=1)[0]
    i = int(probs.argmax())
    from utils.interpretability import obtener_zonas_de_interes

    explanation = obtener_zonas_de_interes(
        model,
        img,
        tf,
        target_size=(meta["img_size"], meta["img_size"]),
    )
    return meta["classes"][i].upper(), round(float(probs[i]), 4), explanation