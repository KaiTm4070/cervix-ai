import { useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Mail, ShieldCheck } from 'lucide-react'
import ModalShell from './ModalShell'
import { TextField } from './Fields'
import { isEmail } from '../../utils/validators'
import { requestPasswordReset } from '../../services/authService'

interface Props { onClose: () => void; onBack: () => void }

export default function PasswordRecoveryModal({ onClose, onBack }: Props) {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!isEmail(email)) { setError('Ingresa un correo válido.'); return }
        setError('')
        setLoading(true)
        try { setMessage(await requestPasswordReset(email)) }
        catch (err) { setError(err instanceof Error ? err.message : 'No se pudo enviar el correo.') }
        finally { setLoading(false) }
    }

    return <ModalShell onClose={onClose} width={424} labelledBy="recovery-title">
        <button type="button" className="link" onClick={onBack}><ArrowLeft size={14} /> Volver al inicio de sesión</button>
        <h2 id="recovery-title" className="auth-title">Recupera tu contraseña</h2>
        <p className="auth-sub">Te enviaremos un enlace para crear una nueva contraseña.</p>
        {message ? <p className="auth-note" role="status">{message}</p> : <form onSubmit={submit} noValidate className="auth-form">
            <TextField label="Correo electrónico" icon={Mail} type="email" autoComplete="email"
                placeholder="nombre@institucion.com" value={email} onChange={event => setEmail(event.target.value)} error={error} />
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="btn-primary" disabled={loading}><ArrowRight size={16} />{loading ? 'Enviando…' : 'Enviar enlace'}</button>
        </form>}
        <div className="auth-note"><ShieldCheck size={15} />El enlace es de un solo uso y expira por seguridad.</div>
    </ModalShell>
}
