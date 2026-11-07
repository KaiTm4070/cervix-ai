import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { ArrowRight, Building2, Mail, Stethoscope, User } from 'lucide-react';
import ModalShell from './ModalShell';
import { TextField, PasswordField, SelectField } from './Fields';
import { isEmail, passwordIssues } from '../../utils/validators';
import { register } from '../../services/authService';

const PROFESIONES: string[] = ['Ginecólogo/a', 'Patólogo/a', 'Citotecnólogo/a', 'Médico/a general', 'Investigador/a', 'Estudiante', 'Otro'];

interface RegisterForm {
    nombre: string;
    apellidos: string;
    email: string;
    profesion: string;
    institucion: string;
    password: string;
    terminos: boolean;
}

type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;

interface RegisterModalProps {
    onClose: () => void;
    onSwitch: () => void;
    onSuccess: (result: Awaited<ReturnType<typeof register>>) => void;
}

export default function RegisterModal({ onClose, onSwitch, onSuccess }: RegisterModalProps) {
    const [f, setF] = useState<RegisterForm>({ nombre: '', apellidos: '', email: '', profesion: '', institucion: '', password: '', terminos: false });
    const [errors, setErrors] = useState<RegisterErrors>({});
    const [loading, setLoading] = useState(false);

    const set = (k: keyof RegisterForm) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const t = e.target;
        const value = t instanceof HTMLInputElement && t.type === 'checkbox' ? t.checked : t.value;
        setF((prev) => ({ ...prev, [k]: value }));
    };

    const submit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const er: RegisterErrors = {};
        if (!f.nombre.trim()) er.nombre = 'Requerido.';
        if (!f.apellidos.trim()) er.apellidos = 'Requerido.';
        if (!isEmail(f.email)) er.email = 'Ingresa un correo válido.';
        if (!f.profesion) er.profesion = 'Selecciona tu profesión.';
        if (!f.institucion.trim()) er.institucion = 'Indica tu institución.';
        const issues = passwordIssues(f.password);
        if (issues.length) er.password = `La contraseña necesita ${issues.join(', ')}.`;
        if (!f.terminos) er.terminos = 'Debes aceptar los términos para continuar.';
        setErrors(er);
        if (Object.keys(er).length) return;
        setLoading(true);
        try { onSuccess(await register(f)); } finally { setLoading(false); }
    };

    return (
        <ModalShell onClose={onClose} width={452} labelledBy="reg-title">
            <h2 id="reg-title" className="auth-title">Crea tu cuenta profesional</h2>
            <p className="auth-sub">Da el primer paso hacia una nueva perspectiva.</p>
            <form onSubmit={submit} noValidate className="auth-form">
                <div className="two">
                    <TextField label="Nombre" icon={User} placeholder="Juan" autoComplete="given-name" value={f.nombre} onChange={set('nombre')} error={errors.nombre} />
                    <TextField label="Apellidos" icon={User} placeholder="Pérez" autoComplete="family-name" value={f.apellidos} onChange={set('apellidos')} error={errors.apellidos} />
                </div>
                <TextField label="Correo institucional" icon={Mail} type="email" autoComplete="email" placeholder="nombre@institucion.com" value={f.email} onChange={set('email')} error={errors.email} />
                <SelectField label="Profesión" icon={Stethoscope} placeholder="Selecciona tu profesión" options={PROFESIONES} value={f.profesion} onChange={set('profesion')} error={errors.profesion} />
                <TextField label="Institución" icon={Building2} placeholder="Hospital, clínica o universidad" value={f.institucion} onChange={set('institucion')} error={errors.institucion} />
                <PasswordField label="Contraseña" autoComplete="new-password" placeholder="Crea una contraseña" value={f.password} onChange={set('password')} error={errors.password} />
                <p className="hint">Usa al menos 8 caracteres, una mayúscula y un número.</p>
                <label className="check top">
                    <input type="checkbox" checked={f.terminos} onChange={set('terminos')} />
                    <span>Acepto los Términos de uso y la Política de privacidad. Entiendo que Cérvix-AI no sustituye el diagnóstico profesional.</span>
                </label>
                {errors.terminos && <p className="f-err" role="alert">{errors.terminos}</p>}
                <button className="btn-primary" disabled={loading}><ArrowRight size={16} />{loading ? 'Creando cuenta…' : 'Registrarse'}</button>
            </form>
            <p className="auth-switch">¿Ya tienes cuenta? <button type="button" className="link" onClick={onSwitch}>Iniciar sesión</button></p>
        </ModalShell>
    );
}