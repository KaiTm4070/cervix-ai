import { useState, type ChangeEvent, type FormEvent } from 'react'
import { ArrowRight, Mail, ShieldCheck } from 'lucide-react'
import ModalShell from './ModalShell'
import { TextField, PasswordField } from './Fields'
import { isEmail } from '../../utils/validators'
import { login, type User } from '../../services/authService'

interface LoginModalProps {
    onClose: () => void
    onSwitch: () => void
    onSuccess: (user: User) => void
}

interface LoginForm {
    email: string
    password: string
    remember: boolean
}

type FormErrors = Partial<Record<'email' | 'password', string>>

export default function LoginModal({ onClose, onSwitch, onSuccess }: LoginModalProps) {
    const [form, setForm] = useState<LoginForm>({ email: '', password: '', remember: false })
    const [errors, setErrors] = useState<FormErrors>({})
    const [serverError, setServerError] = useState('')
    const [loading, setLoading] = useState(false)

    const set = (k: keyof LoginForm) => (e: ChangeEvent<HTMLInputElement>) =>
        setForm({
        ...form,
        [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
        })

    const submit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const errs: FormErrors = {}
        if (!isEmail(form.email)) errs.email = 'Ingresa un correo válido.'
        if (!form.password) errs.password = 'Ingresa tu contraseña.'
        setErrors(errs)
        setServerError('')
        if (Object.keys(errs).length) return

        setLoading(true)
        try {
        onSuccess(await login(form))
        } catch (err) {
        setServerError(err instanceof Error ? err.message : 'No se pudo iniciar sesión. Intenta de nuevo.')
        } finally {
        setLoading(false)
        }
    }

    return (
        <ModalShell onClose={onClose} width={424} labelledBy="login-title">
        <h2 id="login-title" className="auth-title">Bienvenido de nuevo</h2>
        <p className="auth-sub">Accede a tu espacio de análisis clínico.</p>

        <form onSubmit={submit} noValidate className="auth-form">
            <TextField
            label="Correo electrónico"
            icon={Mail}
            type="email"
            autoComplete="email"
            placeholder="nombre@institucion.com"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            />
            <PasswordField
            label="Contraseña"
            autoComplete="current-password"
            placeholder="Ingresa tu contraseña"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            />

            <div className="row-between">
            <label className="check">
                <input type="checkbox" checked={form.remember} onChange={set('remember')} /> Recordarme
            </label>
            <button
                type="button"
                className="link"
                onClick={() => setServerError('La recuperación de contraseña estará disponible cuando se conecte la autenticación del backend. Puedes crear un perfil de demostración desde Registro.')}
            >
                ¿Olvidaste tu contraseña?
            </button>
            </div>

            {serverError && <p className="auth-error" role="alert">{serverError}</p>}

            <button className="btn-primary" disabled={loading}>
            <ArrowRight size={16} />
            {loading ? 'Ingresando…' : 'Iniciar sesión'}
            </button>
        </form>

        <p className="auth-switch">
            ¿Aún no tienes cuenta?{' '}
            <button type="button" className="link" onClick={onSwitch}>Registrarse</button>
        </p>
        <div className="auth-note">
            <ShieldCheck size={15} />
            Acceso exclusivo para profesionales de salud e investigación. Utiliza datos desidentificados.
        </div>
        </ModalShell>
    )
}
