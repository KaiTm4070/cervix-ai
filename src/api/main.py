from contextlib import asynccontextmanager
from datetime import date

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from src.common.config import CORS_ORIGINS
from src.common.database import Base, SessionLocal, engine
from src.common.db_models import CategoriaAnalisis, VersionModelo
from src.api.routers import auth


def seed() -> None:
    """Categorías iniciales (esquemas binario y bethesda) y un modelo simulado para poder probar."""
    with SessionLocal() as db:
        if db.scalar(select(CategoriaAnalisis.id_categoria).limit(1)) is None:
            db.add_all([
                CategoriaAnalisis(codigo="NORMAL", nombre="Normal", descripcion="Sin hallazgos sugestivos de lesión (incluye cambios benignos)"),
                CategoriaAnalisis(codigo="ANORMAL", nombre="Anormal", descripcion="Hallazgos sugestivos de lesión; requiere revisión de un especialista"),
                CategoriaAnalisis(codigo="LSIL", nombre="LSIL", descripcion="Lesión intraepitelial escamosa de bajo grado"),
                CategoriaAnalisis(codigo="HSIL", nombre="HSIL", descripcion="Lesión intraepitelial escamosa de alto grado"),
                CategoriaAnalisis(codigo="CANCER", nombre="Cáncer", descripcion="Hallazgos sugestivos de carcinoma"),
            ])
        if db.scalar(select(VersionModelo.id_version).limit(1)) is None:
            db.add(VersionModelo(nombre_modelo="modelo-simulado-v0", fecha_entrenamiento=date.today(),
                                parametros="Simulado, sin entrenamiento", ruta_archivo="simulado", estado="activo"))
        db.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(engine)  # desarrollo; más adelante conviene usar Alembic
    seed()
    yield


app = FastAPI(title="Cérvix-AI API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware, allow_origins=CORS_ORIGINS, allow_methods=["*"],
    allow_headers=["*"], allow_credentials=True,
)

for r in (auth,):
    app.include_router(r.router)


@app.get("/salud", tags=["sistema"])
def salud():
    return {"estado": "ok"}