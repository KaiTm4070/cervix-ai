
import json
from pathlib import Path

MODEL_DIR = Path(__file__).resolve().parents[1] / "models" / "vigente"


def obtener_metadatos():
    ruta = MODEL_DIR / "package.json"
    assert ruta.is_file(), "No existe package.json"
    return json.loads(ruta.read_text(encoding="utf-8"))


def test_arquitectura_modelo():
    datos = obtener_metadatos()
    assert datos["model_name"] == "vit_small_patch16_224"


def test_archivo_modelo_existe():
    modelo = MODEL_DIR / "model.pt"
    assert modelo.is_file(), "No existe model.pt"
    assert modelo.stat().st_size > 0, "El archivo del modelo está vacío"


def test_clases_modelo():
    datos = obtener_metadatos()
    assert datos["classes"] == ["ANORMAL", "NORMAL"]


def test_tamano_imagen():
    datos = obtener_metadatos()
    assert datos["img_size"] == 224


# Este archivo contiene cuatro pruebas automáticas que verifican:
# - Arquitectura ViT configurada.
# - Existencia del archivo de pesos del modelo.
# - Clases ANORMAL y NORMAL.
# - Tamaño de entrada de 224 píxeles.