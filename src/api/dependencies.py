from datetime import datetime, timezone

from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.common.database import get_db
from src.common.db_models import Sesion, Usuario
from src.common.security import hash_session_token


def get_current_user(
    cervix_session: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> Usuario:
    if not cervix_session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesión no válida")
    session = db.scalar(
        select(Sesion).where(
            Sesion.token_hash == hash_session_token(cervix_session),
            Sesion.expira_en > datetime.now(timezone.utc).replace(tzinfo=None),
        )
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesión expirada")
    return session.usuario
