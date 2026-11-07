import {
    useId,
    useState,
    type InputHTMLAttributes,
    type ReactNode,
    type SelectHTMLAttributes,
} from 'react'
import { Eye, EyeOff, Lock, type LucideIcon } from 'lucide-react'

interface FieldProps {
    label: string
    icon?: LucideIcon
    error?: string
    id: string
    children: ReactNode
    trailing?: ReactNode
}

function Field({ label, icon: Icon, error, id, children, trailing }: FieldProps) {
    return (
        <div className="f">
        <label htmlFor={id} className="f-label">{label}</label>
        <div className={`f-box ${error ? 'bad' : ''}`}>
            {Icon && <Icon size={16} className="f-ico" />}
            {children}
            {trailing}
        </div>
        {error && <p className="f-err" role="alert">{error}</p>}
        </div>
    )
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string
    icon?: LucideIcon
    error?: string
}

export function TextField({ label, icon, error, ...props }: TextFieldProps) {
    const id = useId()
    return (
        <Field label={label} icon={icon} error={error} id={id}>
        <input id={id} className="f-input" aria-invalid={!!error} {...props} />
        </Field>
    )
}

type PasswordFieldProps = Omit<TextFieldProps, 'icon' | 'type'>

export function PasswordField({ label, error, ...props }: PasswordFieldProps) {
    const id = useId()
    const [show, setShow] = useState(false)
    return (
        <Field
        label={label}
        icon={Lock}
        error={error}
        id={id}
        trailing={
            <button
            type="button"
            className="f-eye"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        }
        >
        <input
            id={id}
            className="f-input"
            type={show ? 'text' : 'password'}
            aria-invalid={!!error}
            {...props}
        />
        </Field>
    )
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
    label: string
    icon?: LucideIcon
    error?: string
    placeholder: string
    options: string[]
}

export function SelectField({ label, icon, error, placeholder, options, ...props }: SelectFieldProps) {
    const id = useId()
    return (
        <Field label={label} icon={icon} error={error} id={id}>
        <select id={id} className="f-input" aria-invalid={!!error} {...props}>
            <option value="">{placeholder}</option>
            {options.map((o) => (
            <option key={o} value={o}>{o}</option>
            ))}
        </select>
        </Field>
    )
}