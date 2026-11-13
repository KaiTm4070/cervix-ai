from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.common.database import Base


class Usuario(Base):
    __tablename__ = "usuario"

    id_usuario: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(80), nullable=False)
    apellidos: Mapped[str] = mapped_column(String(80), nullable=False)
    email: Mapped[str] = mapped_column(String(160), unique=True, index=True, nullable=False)
    profesion: Mapped[str] = mapped_column(String(60), nullable=False)
    institucion: Mapped[str] = mapped_column(String(120), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    rol: Mapped[str] = mapped_column(String(20), default="profesional", nullable=False)
    objetivo: Mapped[str | None] = mapped_column(String(80), nullable=True)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Sesion(Base):
    __tablename__ = "sesion"

    id_sesion: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_usuario: Mapped[int] = mapped_column(ForeignKey("usuario.id_usuario", ondelete="CASCADE"), nullable=False, index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    expira_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    creada_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    usuario: Mapped[Usuario] = relationship()


class CategoriaAnalisis(Base):
    __tablename__ = "categoria_analisis"

    id_categoria: Mapped[int] = mapped_column(Integer, primary_key=True)
    codigo: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    nombre: Mapped[str] = mapped_column(String(80), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text)


class VersionModelo(Base):
    __tablename__ = "version_modelo"

    id_version: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre_modelo: Mapped[str] = mapped_column(String(80), nullable=False)
    fecha_entrenamiento: Mapped[date] = mapped_column(Date, nullable=False)
    parametros: Mapped[str | None] = mapped_column(Text)
    ruta_archivo: Mapped[str] = mapped_column(String(255), nullable=False)
    estado: Mapped[str] = mapped_column(String(10), default="activo", nullable=False)


class ResultadoPrueba(Base):
    __tablename__ = "resultado_prueba"

    id_resultado: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_usuario: Mapped[int] = mapped_column(ForeignKey("usuario.id_usuario"), nullable=False, index=True)
    id_version: Mapped[int] = mapped_column(ForeignKey("version_modelo.id_version"), nullable=False)
    id_categoria: Mapped[int] = mapped_column(ForeignKey("categoria_analisis.id_categoria"), nullable=False)
    fecha_prueba: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    confianza: Mapped[float] = mapped_column(Float, nullable=False)
    tiempo_respuesta_ms: Mapped[int] = mapped_column(Integer, nullable=False)


class MuestraAnalisis(Base):
    __tablename__ = "muestra_analisis"

    id_muestra: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_resultado: Mapped[int] = mapped_column(
        ForeignKey("resultado_prueba.id_resultado", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    nombre_archivo: Mapped[str] = mapped_column(String(255), nullable=False)
    modalidad: Mapped[str] = mapped_column(String(20), nullable=False)


class MetricaEvaluacion(Base):
    __tablename__ = "metrica_evaluacion"

    id_metrica: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_version: Mapped[int] = mapped_column(ForeignKey("version_modelo.id_version"), nullable=False)
    exactitud: Mapped[float] = mapped_column(Float, nullable=False)
    sensibilidad: Mapped[float] = mapped_column(Float, nullable=False)
    especificidad: Mapped[float] = mapped_column(Float, nullable=False)
    f1: Mapped[float] = mapped_column(Float, nullable=False)
    fecha_calculo: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
