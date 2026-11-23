
import torch
from PIL import Image

from src.preprocessing.Transform import (
    eval_transform,
    train_transform,
    MEAN,
    STD,
)


def test_dimensiones_imagen():
    """Verifica que la imagen quede en 224x224."""
    imagen = Image.new("RGB", (500, 300), color="red")

    resultado = eval_transform()(imagen)

    assert resultado.shape == (3, 224, 224)


def test_normalizacion():
    """Verifica los valores normalizados de cada canal."""
    color = (128, 64, 32)
    imagen = Image.new("RGB", (224, 224), color=color)

    resultado = eval_transform()(imagen)

    esperado = torch.tensor([
        ((color[i] / 255.0) - MEAN[i]) / STD[i]
        for i in range(3)
    ])

    promedio = resultado.mean(dim=(1, 2))

    assert torch.allclose(promedio, esperado, atol=1e-5)


def test_consistencia_evaluacion():
    """La evaluación no debe generar resultados aleatorios."""
    imagen = Image.new("RGB", (400, 300), color="blue")

    resultado1 = eval_transform()(imagen)
    resultado2 = eval_transform()(imagen)

    assert torch.equal(resultado1, resultado2)


def test_transformacion_entrenamiento():
    """Verifica que el aumento de datos produzca un tensor válido."""
    imagen = Image.new("RGB", (500, 300), color="green")

    resultado = train_transform()(imagen)

    assert resultado.shape == (3, 224, 224)
    assert torch.isfinite(resultado).all()



# El redimensionamiento a 224 × 224 píxeles.
# La conversión a tensores RGB.
# La normalización de imágenes.
# La consistencia del preprocesamiento utilizado por el modelo ViT.