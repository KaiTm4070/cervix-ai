
import pytest
from PIL import Image

from src.analysis.inference import (
    es_simulado,
    predict_with_interpretability,
)


@pytest.fixture(scope="module")
def resultado_inferencia():
    """Ejecuta una inferencia real una sola vez."""
    imagen = Image.new(
        "RGB",
        (224, 224),
        color=(128, 128, 128)
    )

    return predict_with_interpretability(imagen)


def test_modelo_no_simulado():
    """Verifica que se utiliza el modelo real."""
    assert es_simulado() is False


def test_clasificacion_valida(resultado_inferencia):
    """Verifica que la categoría sea reconocida."""
    categoria, _, _ = resultado_inferencia

    assert categoria in {"NORMAL", "ANORMAL"}


def test_confianza_valida(resultado_inferencia):
    """Verifica que la confianza esté entre 0 y 1."""
    _, confianza, _ = resultado_inferencia

    assert isinstance(confianza, (int, float))
    assert 0.0 <= confianza <= 1.0


def test_interpretabilidad_generada(resultado_inferencia):
    """Verifica que exista una salida de interpretabilidad."""
    _, _, interpretabilidad = resultado_inferencia

    assert isinstance(interpretabilidad, str)
    assert len(interpretabilidad) > 0


# Que la API acepte imágenes JPG y PNG.
# Que rechace archivos dañados o no permitidos.
# Que respete el límite de 10 MiB.
# Que controle correctamente los errores.
# Que entregue los resultados del análisis al frontend.