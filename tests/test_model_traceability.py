
import json
import os
from pathlib import Path

from sqlalchemy import select

# Solo permitir pruebas con una BD temporal.
DATABASE_URL = os.environ.get("DATABASE_URL", "")

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
    """Verifica que la BD identifique al modelo real."""

    assert es_simulado() is False

    ruta = (
        Path(__file__).resolve().parents[1]
        / "models"
        / "vigente"
        / "package.json"
    )

    metadatos = json.loads(
        ruta.read_text(encoding="utf-8")
    )

    nombre_esperado = metadatos["model_name"]

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

        assert modelo_activo.nombre_modelo == nombre_esperado, (
            f"Modelo registrado: "
            f"{modelo_activo.nombre_modelo}. "
            f"Modelo real: {nombre_esperado}"
        )

        assert modelo_activo.ruta_archivo != "simulado", (
            "El modelo real está registrado como simulado."
        )
