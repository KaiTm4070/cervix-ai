from contextlib import asynccontextmanager
from datetime import date
import json
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from src.common.config import CORS_ORIGINS, MODEL_DIR
from src.common.database import Base, SessionLocal, engine
from src.common.db_models import CategoriaAnalisis, ResultadoPrueba, VersionModelo
from src.api.routers import analysis, auth


def seed() -> None:
    """Categorías iniciales y sincronización de la versión del modelo activo."""
    with SessionLocal() as db:
        if db.scalar(select(CategoriaAnalisis.id_categoria).limit(1)) is None:
            db.add_all([
                CategoriaAnalisis(codigo="NORMAL", nombre="Normal", descripcion="Sin hallazgos sugestivos de lesión (incluye cambios benignos)"),
                CategoriaAnalisis(codigo="ANORMAL", nombre="Anormal", descripcion="Hallazgos sugestivos de lesión; requiere revisión de un especialista"),
                CategoriaAnalisis(codigo="LSIL", nombre="LSIL", descripcion="Lesión intraepitelial escamosa de bajo grado"),
                CategoriaAnalisis(codigo="HSIL", nombre="HSIL", descripcion="Lesión intraepitelial escamosa de alto grado"),
                CategoriaAnalisis(codigo="CANCER", nombre="Cáncer", descripcion="Hallazgos sugestivos de carcinoma"),
            ])

        package_dir = Path(MODEL_DIR)
        package_file = package_dir / "package.json"
        versions = list(db.scalars(select(VersionModelo).order_by(VersionModelo.id_version)))

        if package_file.exists():
            package = json.loads(package_file.read_text(encoding="utf-8"))
            nombre_modelo = str(package.get("run_name") or package.get("model_name") or "modelo-real")
            simulated_ids = [
                version.id_version for version in versions
                if version.nombre_modelo.startswith("modelo-simulado")
                or version.ruta_archivo == "simulado"
            ]
            parametros = json.dumps(
                {
                    "model_name": package.get("model_name"),
                    "dataset_version": package.get("dataset_version"),
                    "params": package.get("params"),
                    "best_val_f1": package.get("best_val_f1"),
                },
                ensure_ascii=False,
            )
            ruta_archivo = str(package_dir)

            matching = next(
                (
                    version for version in versions
                    if version.ruta_archivo == ruta_archivo
                    or version.nombre_modelo == nombre_modelo
                ),
                None,
            )
            if matching is None:
                matching = next(
                    (
                        version for version in versions
                        if version.nombre_modelo.startswith("modelo-simulado")
                        or version.ruta_archivo == "simulado"
                    ),
                    None,
                )
            if matching is None:
                matching = VersionModelo(
                    nombre_modelo=nombre_modelo,
                    fecha_entrenamiento=date.today(),
                    parametros=parametros,
                    ruta_archivo=ruta_archivo,
                    estado="activo",
                )
            for version in versions:
                version.estado = "archivado"
            db.flush()
            if matching not in versions:
                db.add(matching)
            matching.nombre_modelo = nombre_modelo
            matching.fecha_entrenamiento = date.today()
            matching.parametros = parametros
            matching.ruta_archivo = ruta_archivo
            matching.estado = "activo"
            if simulated_ids:
                db.flush()
                for result in db.scalars(
                    select(ResultadoPrueba).where(ResultadoPrueba.id_version.in_(simulated_ids))
                ):
                    result.id_version = matching.id_version
        elif not versions:
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

for r in (auth, analysis):
    app.include_router(r.router)


@app.get("/salud", tags=["sistema"])
def salud():
    return {"estado": "ok"}