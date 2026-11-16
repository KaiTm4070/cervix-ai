import { useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import ModalShell from './ModalShell'
import { PasswordField } from './Fields'
import { passwordIssues } from '../../utils/validators'
import { resetPassword } from '../../services/authService'

interface Props { token: string; onClose: () => void; onBack: () => void }

export default function ResetPasswordModal({ token, onClose, onBack }: Props) {
    const [password, setPassword] = useState('')
    const [confirmation, setConfirmation] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const issues = passwordIssues(password)
        if (issues.length) { setError(issues[0]); return }
        if (password !== confirmation) { setError('Las contraseñas no coinciden.'); return }
        setError('')
        setLoading(true)
        try { setMessage(await resetPassword(token, password)) }
        catch (err) { setError(err instanceof Error ? err.message : 'No se pudo cambiar la contraseña.') }
        finally { setLoading(false) }
    }

    return <ModalShell onClose={onClose} width={424} labelledBy="reset-title">
        <button type="button" className="link" onClick={onBack}><ArrowLeft size={14} /> Volver al inicio de sesión</button>
        <h2 id="reset-title" className="auth-title">Crea una nueva contraseña</h2>
        {message ? <><p className="auth-note" role="status">{message}</p><button className="btn-primary" onClick={onBack}>Iniciar sesión</button></> : <form onSubmit={submit} noValidate className="auth-form">
            <PasswordField label="Nueva contraseña" autoComplete="new-password" placeholder="Ingresa tu contraseña" value={password} onChange={event => setPassword(event.target.value)} />
            <PasswordField label="Repite la contraseña" autoComplete="new-password" placeholder="Repite tu contraseña" value={confirmation} onChange={event => setConfirmation(event.target.value)} error={error} />
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="btn-primary" disabled={loading}><ArrowRight size={16} />{loading ? 'Guardando…' : 'Cambiar contraseña'}</button>
        </form>}
        <div className="auth-note"><ShieldCheck size={15} />Tu contraseña anterior dejará de funcionar inmediatamente.</div>
    </ModalShell>
}
