from pydantic import BaseModel, Field, field_validator


class RegisterRequest(BaseModel):
    nombre: str = Field(min_length=1, max_length=80)
    apellidos: str = Field(min_length=1, max_length=80)
    email: str = Field(min_length=3, max_length=160)
    profesion: str = Field(min_length=1, max_length=60)
    institucion: str = Field(min_length=1, max_length=120)
    password: str = Field(min_length=8, max_length=128)
    terminos: bool

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        value = value.strip().lower()
        if "@" not in value or "." not in value.rsplit("@", 1)[-1]:
            raise ValueError("El correo no es válido")
        return value

    @field_validator("nombre", "apellidos", "profesion", "institucion")
    @classmethod
    def strip_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("El campo es obligatorio")
        return value


class LoginRequest(BaseModel):
    email: str
    password: str


class ObjectiveRequest(BaseModel):
    objetivo: str = Field(min_length=1, max_length=80)


class UserResponse(BaseModel):
    nombre: str
    apellidos: str
    email: str
    profesion: str
    institucion: str
    objetivo: str | None
    rol: str


class AuthResponse(BaseModel):
    user: UserResponse
