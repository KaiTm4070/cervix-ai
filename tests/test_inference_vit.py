
from pathlib import Path

import pytest
import torch
from PIL import Image

from src.models.Factory import load_package
from src.preprocessing.Transform import eval_transform


MODEL_DIR = Path(__file__).resolve().parents[1] / "models" / "vigente"


@pytest.fixture(scope="module")
def modelo_vit():
    """Carga los pesos entrenados una sola vez."""
    modelo, metadata = load_package(MODEL_DIR)
    return modelo, metadata


@pytest.fixture(scope="module")
def salida_inferencia(modelo_vit):
    """Ejecuta el modelo con una imagen sintética."""
    modelo, metadata = modelo_vit

    imagen = Image.new(
        "RGB",
        (320, 240),
        color=(128, 64, 32)
    )

    tensor = eval_transform(
        metadata["img_size"]
    )(imagen).unsqueeze(0)

    with torch.inference_mode():
        logits = modelo(tensor)

    return logits, metadata


def test_modo_evaluacion(modelo_vit):
    modelo, _ = modelo_vit
    assert not modelo.training


def test_salida_dos_clases(salida_inferencia):
    logits, metadata = salida_inferencia

    assert logits.shape == (
        1,
        len(metadata["classes"])
    )


def test_salida_sin_valores_invalidos(salida_inferencia):
    logits, _ = salida_inferencia

    assert torch.isfinite(logits).all()


def test_probabilidades_validas(salida_inferencia):
    logits, metadata = salida_inferencia

    probabilidades = torch.softmax(logits, dim=1)[0]

    assert torch.isclose(
        probabilidades.sum(),
        torch.tensor(1.0),
        atol=1e-5
    ).item()

    indice = int(probabilidades.argmax())
    categoria = metadata["classes"][indice]
    confianza = float(probabilidades[indice])

    assert categoria in {"NORMAL", "ANORMAL"}
    assert 0.0 <= confianza <= 1.0


# El modelo entrenado puede ejecutar una inferencia.
# La salida corresponde a las dos clases configuradas.
# Las probabilidades son válidas matemáticamente.
# No aparecen valores NaN ni infinitos.