from datetime import datetime, timedelta, timezone
import secrets

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from src.api.dependencies import get_current_user
from src.api.schemas import AuthResponse, LoginRequest, ObjectiveRequest, RegisterRequest, UserResponse
from src.common.config import COOKIE_SECURE, SESSION_DAYS
from src.common.database import get_db
from src.common.db_models import Sesion, Usuario
from src.common.security import hash_password, hash_session_token, verify_password

router = APIRouter(prefix="/api/auth", tags=["autenticación"])


def to_response(user: Usuario) -> UserResponse:
    return UserResponse(
        nombre=user.nombre, apellidos=user.apellidos, email=user.email,
        profesion=user.profesion, institucion=user.institucion,
        objetivo=user.objetivo, rol=user.rol,
    )


def create_session(user: Usuario, db: Session, response: Response) -> None:
    raw_token = secrets.token_urlsafe(32)
    db.add(Sesion(
        id_usuario=user.id_usuario,
        token_hash=hash_session_token(raw_token),
        expira_en=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=SESSION_DAYS),
    ))
    response.set_cookie("cervix_session", raw_token, max_age=SESSION_DAYS * 86400,
                        httponly=True, samesite="lax", secure=COOKIE_SECURE)


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, response: Response, db: Session = Depends(get_db)) -> AuthResponse:
    if not payload.terminos:
        raise HTTPException(status_code=400, detail="Debes aceptar los términos para registrarte")
    user = Usuario(
        nombre=payload.nombre, apellidos=payload.apellidos, email=payload.email,
        profesion=payload.profesion, institucion=payload.institucion,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Ya existe una cuenta con ese correo") from None
    create_session(user, db, response)
    db.commit()
    return AuthResponse(user=to_response(user))


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> AuthResponse:
    user = db.scalar(select(Usuario).where(Usuario.email == payload.email.strip().lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
    create_session(user, db, response)
    db.commit()
    return AuthResponse(user=to_response(user))


@router.get("/me", response_model=AuthResponse)
def me(user: Usuario = Depends(get_current_user)) -> AuthResponse:
    return AuthResponse(user=to_response(user))


@router.patch("/objective", response_model=AuthResponse)
def update_objective(payload: ObjectiveRequest, user: Usuario = Depends(get_current_user),
                     db: Session = Depends(get_db)) -> AuthResponse:
    user.objetivo = payload.objetivo.strip()
    db.commit()
    return AuthResponse(user=to_response(user))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response, user: Usuario = Depends(get_current_user),
           cervix_session: str | None = Cookie(default=None),
           db: Session = Depends(get_db)) -> Response:
    if cervix_session:
        session = db.scalar(select(Sesion).where(Sesion.token_hash == hash_session_token(cervix_session)))
        if session:
            db.delete(session)
            db.commit()
    response.delete_cookie("cervix_session")
    return response
