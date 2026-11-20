
from fastapi.testclient import TestClient
from src.api.main import app


def test_api_salud():
    """Comprueba que la API inicia y responde correctamente."""

    with TestClient(app) as client:
        respuesta = client.get("/salud")

    assert respuesta.status_code == 200
    assert respuesta.json() == {"estado": "ok"}
