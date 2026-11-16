from email.message import EmailMessage
import smtplib

from src.common.config import (
    FRONTEND_URL,
    PASSWORD_RESET_MINUTES,
    SMTP_FROM,
    SMTP_HOST,
    SMTP_PASSWORD,
    SMTP_PORT,
    SMTP_USE_TLS,
    SMTP_USERNAME,
)


def send_password_reset_email(recipient: str, token: str) -> None:
    if not SMTP_HOST or not SMTP_FROM:
        raise RuntimeError("El correo SMTP no está configurado")

    reset_url = f"{FRONTEND_URL}/login?token={token}"
    message = EmailMessage()
    message["Subject"] = "Recupera tu contraseña de CervixAI"
    message["From"] = SMTP_FROM
    message["To"] = recipient
    message.set_content(
        "Solicitaste cambiar la contraseña de tu cuenta de CervixAI.\n\n"
        f"Abre este enlace para crear una nueva contraseña (válido durante {PASSWORD_RESET_MINUTES} minutos):\n"
        f"{reset_url}\n\n"
        "Si no solicitaste este cambio, puedes ignorar este mensaje."
    )

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
        if SMTP_USE_TLS:
            server.starttls()
        if SMTP_USERNAME:
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(message)
