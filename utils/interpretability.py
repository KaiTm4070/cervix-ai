"""Generación de mapas de saliencia para apoyar la revisión profesional."""

from __future__ import annotations

import base64
from typing import Any

import cv2
import numpy as np
import torch
from PIL import Image


def obtener_zonas_de_interes(
    model: torch.nn.Module,
    image: Image.Image,
    transform: Any,
    target_size: tuple[int, int] = (224, 224),
) -> str:
    """Devuelve la imagen original con el mapa de saliencia superpuesto.

    El mapa muestra las regiones que más contribuyeron a la clase predicha.
    No representa una segmentación clínica ni sustituye la revisión profesional.
    """
    device = next(model.parameters()).device
    prepared = transform(image.convert("RGB")).unsqueeze(0).to(device)
    prepared.requires_grad_(True)

    was_training = model.training
    model.eval()
    model.zero_grad(set_to_none=True)
    with torch.enable_grad():
        output = model(prepared)
        if isinstance(output, (tuple, list)):
            output = output[0]
        class_index = int(output.argmax(dim=1).item())
        output[0, class_index].backward()

    gradient = prepared.grad
    if gradient is None:
        raise RuntimeError("No se pudo obtener el gradiente para el mapa de saliencia")
    saliency = gradient.detach().abs().amax(dim=1)[0]
    saliency = torch.nn.functional.interpolate(
        saliency.unsqueeze(0).unsqueeze(0),
        size=target_size,
        mode="bilinear",
        align_corners=False,
    )[0, 0]
    saliency -= saliency.min()
    saliency /= saliency.max().clamp_min(1e-8)
    saliency_np = (saliency.detach().cpu().numpy() * 255).astype(np.uint8)

    original = np.asarray(image.convert("RGB").resize(target_size[::-1]))
    original = cv2.cvtColor(original, cv2.COLOR_RGB2BGR)
    heatmap = cv2.applyColorMap(saliency_np, cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(original, 0.65, heatmap, 0.35, 0)
    success, encoded = cv2.imencode(
        ".jpg", overlay, [cv2.IMWRITE_JPEG_QUALITY, 90]
    )
    if not success:
        raise RuntimeError("No se pudo codificar el mapa de saliencia")

    if was_training:
        model.train()
    return f"data:image/jpeg;base64,{base64.b64encode(encoded.tobytes()).decode('ascii')}"
