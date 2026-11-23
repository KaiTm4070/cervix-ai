
import os
from types import SimpleNamespace

from io import BytesIO
from PIL import Image

import pytest
from fastapi.testclient import TestClient

# Exigir una base de datos temporal.
database_url = os.environ.get("DATABASE_URL", "")

if not (
    database_url.startswith("sqlite:///")
    and "cervix_tester_" in database_url
):
    raise RuntimeError(
        "Configura primero la base de datos temporal."
    )

from src.api.main import app
from src.api.dependencies import get_current_user
from src.common.database import get_db


@pytest.fixture
def client():
    """Crea un cliente aislado para validar entradas."""

    overrides_anteriores = app.dependency_overrides.copy()

    app.dependency_overrides[get_current_user] = (
        lambda: SimpleNamespace(id_usuario=1)
    )
    app.dependency_overrides[get_db] = lambda: None

    try:
        with TestClient(app) as cliente:
            yield cliente
    finally:
        app.dependency_overrides = overrides_anteriores


def test_rechaza_formato_txt(client):
    respuesta = client.post(
        "/api/analysis",
        data={"modality": "Colposcopia"},
        files={
            "image": (
                "archivo.txt",
                b"contenido de prueba",
                "text/plain"
            )
        }
    )

    assert respuesta.status_code == 400


def test_rechaza_archivo_mayor_10mib(client):
    archivo_grande = b"0" * (10 * 1024 * 1024 + 1)

    respuesta = client.post(
        "/api/analysis",
        data={"modality": "Colposcopia"},
        files={
            "image": (
                "imagen_grande.png",
                archivo_grande,
                "image/png"
            )
        }
    )

    assert respuesta.status_code == 413


def test_rechaza_imagen_danada(client):
    respuesta = client.post(
        "/api/analysis",
        data={"modality": "Colposcopia"},
        files={
            "image": (
                "imagen_danada.png",
                b"esto no es una imagen real",
                "image/png"
            )
        }
    )

    assert respuesta.status_code == 400


# Prueba	Resultado esperado
# Archivo TXT	HTTP 400 — formato no permitido
# Imagen superior a 10 MiB	HTTP 413 — archivo demasiado grande
# Archivo PNG dañado	HTTP 400 — imagen inválida



def test_rechaza_modalidad_invalida(client):
    """Rechaza una modalidad no admitida."""

    respuesta = client.post(
        "/api/analysis",
        data={"modality": "Radiografía"},
        files={
            "image": (
                "prueba.png",
                b"contenido de prueba",
                "image/png",
            )
        },
    )

    assert respuesta.status_code == 400, respuesta.text



def test_rechaza_solicitud_sin_imagen(client):
    """La API debe exigir una imagen."""

    respuesta = client.post(
        "/api/analysis",
        data={"modality": "Colposcopia"},
    )

    assert respuesta.status_code == 422

    errores = respuesta.json()["detail"]

    assert any(
        error["loc"][-1] == "image"
        for error in errores
    )


def test_rechaza_solicitud_sin_modalidad(client):
    """La API debe exigir la modalidad."""

    imagen = Image.new("RGB", (224, 224), "gray")

    archivo = BytesIO()
    imagen.save(archivo, format="PNG")
    archivo.seek(0)

    respuesta = client.post(
        "/api/analysis",
        files={
            "image": (
                "prueba.png",
                archivo,
                "image/png",
            )
        },
    )

    assert respuesta.status_code == 422

    errores = respuesta.json()["detail"]

    assert any(
        error["loc"][-1] == "modality"
        for error in errores
    )
