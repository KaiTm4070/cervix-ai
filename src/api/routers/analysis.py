from io import BytesIO
from time import perf_counter

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from PIL import Image, UnidentifiedImageError
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.analysis.inference import predict
from src.api.dependencies import get_current_user
from src.api.schemas_analysis import AnalysisResponse
from src.common.database import get_db
from src.common.db_models import (
    CategoriaAnalisis,
    MuestraAnalisis,
    ResultadoPrueba,
    Usuario,
    VersionModelo,
)

router = APIRouter(prefix="/api/analysis", tags=["análisis"])
MAX_IMAGE_BYTES = 10 * 1024 * 1024
ALLOWED_TYPES = {"image/jpeg", "image/png"}


@router.post("", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
async def analyze(
    image: UploadFile = File(...),
    modality: str = Form(...),
    user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AnalysisResponse:
    if modality not in {"Citología", "Colposcopia"}:
        raise HTTPException(status_code=400, detail="La modalidad no es válida")
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Solo se permiten imágenes JPG o PNG")

    contents = await image.read(MAX_IMAGE_BYTES + 1)
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="El archivo supera el límite de 10 MB")
    try:
        pil_image = Image.open(BytesIO(contents))
        pil_image.load()
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(status_code=400, detail="El archivo no contiene una imagen válida") from exc

    version = db.scalar(select(VersionModelo).where(VersionModelo.estado == "activo"))
    if version is None:
        raise HTTPException(status_code=503, detail="No hay un modelo activo configurado")

    started_at = perf_counter()
    category_code, confidence = predict(pil_image)
    category = db.scalar(select(CategoriaAnalisis).where(CategoriaAnalisis.codigo == category_code))
    if category is None:
        raise HTTPException(status_code=500, detail=f"La categoría {category_code} no está configurada")

    elapsed_ms = int((perf_counter() - started_at) * 1000)
    result = ResultadoPrueba(
        id_usuario=user.id_usuario,
        id_version=version.id_version,
        id_categoria=category.id_categoria,
        confianza=confidence,
        tiempo_respuesta_ms=elapsed_ms,
    )
    db.add(result)
    db.flush()
    db.add(MuestraAnalisis(
        id_resultado=result.id_resultado,
        nombre_archivo=image.filename or "imagen-sin-nombre",
        modalidad=modality,
    ))
    db.commit()
    db.refresh(result)
    return AnalysisResponse(
        id=f"ANALISIS-{result.id_resultado:06d}",
        date=result.fecha_prueba,
        classification=category_code,
        confidence=round(confidence * 100, 2),
        model=version.nombre_modelo,
    )
