
import json
import os
from pathlib import Path

from sqlalchemy import select

# Verificar que utilizamos una base de datos temporal.
DATABASE_URL = os.environ.get("DATABASE_URL", "")

from fastapi.testclient import TestClient
from src.api.main import app

if not (
    DATABASE_URL.startswith("sqlite:///")
    and "cervix_tester_" in DATABASE_URL
):
    raise RuntimeError(
        "Debes configurar una base temporal de pruebas."
    )

from src.analysis.inference import es_simulado
from src.common.database import SessionLocal
from src.common.db_models import VersionModelo


def test_trazabilidad_modelo_activo():
    # Inicializar la API y preparar la base temporal.
    with TestClient(app) as client:
        respuesta = client.get("/salud")
        assert respuesta.status_code == 200
    """Verifica la trazabilidad de la versión real del modelo."""

    # 1. Comprobar que la inferencia no sea simulada.
    assert es_simulado() is False

    # 2. Leer los metadatos del modelo.
    ruta = (
        Path(__file__).resolve().parents[1]
        / "models"
        / "vigente"
        / "package.json"
    )

    metadatos = json.loads(
        ruta.read_text(encoding="utf-8")
    )

    version_esperada = metadatos["run_name"]
    arquitectura_esperada = metadatos["model_name"]

    # 3. Consultar el modelo activo en la base de datos.
    with SessionLocal() as db:
        modelos = db.scalars(
            select(VersionModelo).where(
                VersionModelo.estado == "activo"
            )
        ).all()

        assert len(modelos) == 1, (
            "Debe existir exactamente un modelo activo."
        )

        modelo_activo = modelos[0]

        # 4. Comprobar el identificador de la versión.
        assert modelo_activo.nombre_modelo == version_esperada, (
            f"Versión registrada: {modelo_activo.nombre_modelo}. "
            f"Versión esperada: {version_esperada}"
        )

        # 5. Comprobar que no sea un registro simulado.
        assert modelo_activo.ruta_archivo != "simulado"

        # 6. Verificar la arquitectura del modelo.
        assert modelo_activo.parametros is not None

        parametros = json.loads(modelo_activo.parametros)

        assert parametros["model_name"] == arquitectura_esperada, (
            "La arquitectura registrada no coincide "
            "con la arquitectura del paquete."
        )
