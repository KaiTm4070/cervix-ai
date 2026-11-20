
import os
from io import BytesIO
from uuid import uuid4
from types import SimpleNamespace

import pytest
from PIL import Image
from fastapi.testclient import TestClient
from sqlalchemy import select

# Seguridad: únicamente usar base temporal.
database_url = os.environ.get("DATABASE_URL", "")

if not (
    database_url.startswith("sqlite:///")
    and "cervix_tester_" in database_url
):
    raise RuntimeError(
        "Configura DATABASE_URL con una base temporal de pruebas."
    )

from src.api.main import app
from src.api.dependencies import get_current_user
from src.api.routers import analysis as analysis_router
from src.common.database import SessionLocal
from src.common.db_models import (
    Usuario,
    ResultadoPrueba,
    MuestraAnalisis,
)


@pytest.mark.parametrize(
    "formato,mime",
    [
        ("PNG", "image/png"),
        ("JPEG", "image/jpeg"),
    ],
)
def test_analisis_imagen_valida(formato, mime, monkeypatch):
    """Comprueba carga, respuesta HTTP y persistencia."""

    # Controlamos la salida de IA para aislar la API.
    monkeypatch.setattr(
        analysis_router,
        "predict_with_interpretability",
        lambda imagen: ("NORMAL", 0.85, None),
    )

    imagen = Image.new("RGB", (224, 224), (100, 120, 140))
    archivo = BytesIO()
    imagen.save(archivo, format=formato)
    archivo.seek(0)

    anteriores = app.dependency_overrides.copy()

    try:
        with TestClient(app) as client:

            # Crear usuario únicamente en la BD temporal.
            with SessionLocal() as db:
                usuario = Usuario(
                    nombre="Usuario",
                    apellidos="Pruebas",
                    email=f"test_{uuid4().hex}@example.invalid",
                    profesion="Tester",
                    institucion="Cervix-AI",
                    password_hash="solo-pruebas",
                    rol="profesional",
                )
                db.add(usuario)
                db.commit()
                db.refresh(usuario)
                usuario_id = usuario.id_usuario

            app.dependency_overrides[get_current_user] = (
                lambda: SimpleNamespace(id_usuario=usuario_id)
            )

            respuesta = client.post(
                "/api/analysis",
                data={"modality": "Colposcopia"},
                files={
                    "image": (
                        f"prueba.{formato.lower()}",
                        archivo,
                        mime,
                    )
                },
            )

            assert respuesta.status_code == 201, respuesta.text

            datos = respuesta.json()
            assert datos["classification"] == "NORMAL"
            assert datos["confidence"] == 85.0
            assert datos["id"].startswith("ANALISIS-")
            assert datos["date"]
            assert datos["model"]

            # Verificar que la API guardó el análisis.
            resultado_id = int(datos["id"].split("-")[-1])

            with SessionLocal() as db:
                resultado = db.get(ResultadoPrueba, resultado_id)
                assert resultado is not None
                assert resultado.id_usuario == usuario_id
                assert resultado.confianza == pytest.approx(0.85)

                muestra = db.scalar(
                    select(MuestraAnalisis).where(
                        MuestraAnalisis.id_resultado == resultado_id
                    )
                )
                assert muestra is not None
                assert muestra.modalidad == "Colposcopia"

    finally:
        app.dependency_overrides.clear()
        app.dependency_overrides.update(anteriores)


# Prueba	Resultado esperado
# Imagen PNG válida	HTTP 201
# Imagen JPG válida	HTTP 201
# Clasificación	NORMAL
# Confianza	85 %
# Base de datos	Registro del resultado y de la muestra