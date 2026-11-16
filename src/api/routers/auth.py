from datetime import datetime, timedelta, timezone
import secrets
import smtplib

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from src.api.dependencies import get_current_user
from src.api.schemas import (
    AuthResponse, LoginRequest, ObjectiveRequest, PasswordResetConfirm,
    PasswordResetRequest, RegisterRequest, UserResponse,
)
from src.common.config import COOKIE_SECURE, PASSWORD_RESET_MINUTES, SESSION_DAYS
from src.common.database import get_db
from src.common.db_models import Sesion, TokenRecuperacion, Usuario
from src.common.email import send_password_reset_email
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


@router.post("/forgot-password")
def forgot_password(payload: PasswordResetRequest, db: Session = Depends(get_db)) -> dict[str, str]:
    user = db.scalar(select(Usuario).where(Usuario.email == payload.email))
    if user:
        raw_token = secrets.token_urlsafe(32)
        db.query(TokenRecuperacion).filter(
            TokenRecuperacion.id_usuario == user.id_usuario,
            TokenRecuperacion.usado.is_(False),
        ).update({"usado": True})
        db.add(TokenRecuperacion(
            id_usuario=user.id_usuario,
            token_hash=hash_session_token(raw_token),
            expira_en=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=PASSWORD_RESET_MINUTES),
        ))
        try:
            send_password_reset_email(user.email, raw_token)
        except (OSError, RuntimeError, smtplib.SMTPException) as exc:
            db.rollback()
            raise HTTPException(status_code=503, detail="No fue posible enviar el correo de recuperación") from exc
        db.commit()
    return {"message": "Si el correo está registrado, recibirás un enlace para recuperar tu contraseña."}


@router.post("/reset-password")
def reset_password(payload: PasswordResetConfirm, db: Session = Depends(get_db)) -> dict[str, str]:
    reset_token = db.scalar(select(TokenRecuperacion).where(
        TokenRecuperacion.token_hash == hash_session_token(payload.token),
        TokenRecuperacion.usado.is_(False),
    ))
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if not reset_token or reset_token.expira_en <= now:
        raise HTTPException(status_code=400, detail="El enlace de recuperación no es válido o ya expiró")
    reset_token.usuario.password_hash = hash_password(payload.password)
    reset_token.usado = True
    db.query(Sesion).filter(Sesion.id_usuario == reset_token.id_usuario).delete()
    db.commit()
    return {"message": "Contraseña actualizada correctamente"}


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
