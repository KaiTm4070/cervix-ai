
import os
from io import BytesIO

from PIL import Image

# Protección: exigir una base temporal de pruebas.
database_url = os.environ.get("DATABASE_URL", "")

if not (
    database_url.startswith("sqlite:///")
    and "cervix_tester_" in database_url
):
    raise RuntimeError(
        "Configura DATABASE_URL con la base "
        "temporal de Cérvix-AI antes de ejecutar."
    )

from fastapi.testclient import TestClient
from src.api.main import app


def test_analisis_sin_autenticacion():
    """Un usuario sin sesión no puede analizar imágenes."""

    imagen = Image.new("RGB", (224, 224), "gray")

    archivo = BytesIO()
    imagen.save(archivo, format="PNG")
    archivo.seek(0)

    with TestClient(app) as client:
        respuesta = client.post(
            "/api/analysis",
            data={"modality": "Colposcopia"},
            files={
                "image": (
                    "prueba_sintetica.png",
                    archivo,
                    "image/png"
                )
            }
        )

    assert respuesta.status_code == 401
    assert respuesta.json()["detail"] == "Sesión no válida"



def test_analisis_con_sesion_invalida():
    """Rechaza una cookie de sesión que no existe en la BD."""

    imagen = Image.new("RGB", (224, 224), "gray")
    archivo = BytesIO()
    imagen.save(archivo, format="PNG")
    archivo.seek(0)

    with TestClient(app) as client:
        client.cookies.set(
            "cervix_session",
            "token-invalido-solo-para-pruebas"
        )

        respuesta = client.post(
            "/api/analysis",
            data={"modality": "Colposcopia"},
            files={
                "image": (
                    "prueba.png",
                    archivo,
                    "image/png"
                )
            }
        )

    assert respuesta.status_code == 401
    assert respuesta.json()["detail"] == "Sesión expirada"





def test_analisis_con_sesion_expirada():
    """Rechaza una sesión existente cuya fecha ya venció."""

    from datetime import datetime, timedelta, timezone
    from uuid import uuid4

    from src.common.database import SessionLocal
    from src.common.db_models import Usuario, Sesion
    from src.common.security import hash_session_token

    token = f"test-expirado-{uuid4().hex}"

    imagen = Image.new("RGB", (224, 224), "gray")
    archivo = BytesIO()
    imagen.save(archivo, format="PNG")
    archivo.seek(0)

    with TestClient(app) as client:
        # Crear usuario y sesión en la BD temporal.
        with SessionLocal() as db:
            usuario = Usuario(
                nombre="Usuario",
                apellidos="Prueba Expirada",
                email=f"expired_{uuid4().hex}@example.invalid",
                profesion="Tester",
                institucion="Cervix-AI",
                password_hash="solo-pruebas",
                rol="profesional",
            )
            db.add(usuario)
            db.flush()

            sesion = Sesion(
                id_usuario=usuario.id_usuario,
                token_hash=hash_session_token(token),
                expira_en=(
                    datetime.now(timezone.utc)
                    .replace(tzinfo=None)
                    - timedelta(minutes=5)
                ),
            )
            db.add(sesion)
            db.commit()

        # Utilizar el token existente pero vencido.
        client.cookies.set("cervix_session", token)

        respuesta = client.post(
            "/api/analysis",
            data={"modality": "Colposcopia"},
            files={
                "image": (
                    "prueba.png",
                    archivo,
                    "image/png",
                )
            },
        )

    assert respuesta.status_code == 401
    assert respuesta.json()["detail"] == "Sesión expirada"
