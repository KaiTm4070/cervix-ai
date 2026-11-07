import { useState } from 'react'
import { ArrowRight, GraduationCap, ScanLine, Stethoscope, type LucideIcon } from 'lucide-react'
import ModalShell from './ModalShell'
import { saveObjective, type User } from '../../services/authService'

interface Objetivo {
    id: string
    icon: LucideIcon
    titulo: string
    desc: string
}

const OBJETIVOS: Objetivo[] = [
    { id: 'deteccion', icon: ScanLine, titulo: 'Detección temprana', desc: 'Explorar patrones visuales como apoyo a la identificación de lesiones.' },
    { id: 'investigacion', icon: GraduationCap, titulo: 'Investigación académica', desc: 'Estudiar imágenes y organizar análisis con fines de investigación.' },
    { id: 'apoyo', icon: Stethoscope, titulo: 'Apoyo al diagnóstico médico', desc: 'Complementar la interpretación de imágenes con tu evaluación clínica.' },
]

interface ObjectiveModalProps {
    user: User | null
    onClose: () => void
    onFinish: (user: User) => void
}

export default function ObjectiveModal({ user, onClose, onFinish }: ObjectiveModalProps) {
    const [sel, setSel] = useState<string>('deteccion')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const saludo = user?.apellidos ? `Dr. ${user.apellidos}` : 'profesional'

    const next = async () => {
        setLoading(true)
        setError('')
        try {
        onFinish(await saveObjective(sel))
        } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo guardar tu objetivo. Intenta de nuevo.')
        setLoading(false)
        }
    }

    return (
        <ModalShell onClose={onClose} width={452} labelledBy="obj-title">
        <span className="chip-tag"><i />PERSONALIZA TU EXPERIENCIA</span>
        <h2 id="obj-title" className="auth-title">¿Cómo quieres usar Cérvix-AI?</h2>
        <p className="auth-sub">
            Hola, {saludo}. Elige tu objetivo principal. Puedes cambiarlo después desde tu perfil.
        </p>

        <div className="opts" role="radiogroup" aria-label="Objetivo principal">
            {OBJETIVOS.map(({ id, icon: Icon, titulo, desc }) => (
            <button
                key={id}
                type="button"
                role="radio"
                aria-checked={sel === id}
                className={`opt ${sel === id ? 'on' : ''}`}
                onClick={() => setSel(id)}
            >
                <Icon size={20} className="opt-ico" />
                <span className="opt-txt"><b>{titulo}</b><small>{desc}</small></span>
                <span className="radio" />
            </button>
            ))}
        </div>

        {error && <p className="auth-error" role="alert">{error}</p>}

        <button className="btn-primary" onClick={next} disabled={loading}>
            <ArrowRight size={16} />
            {loading ? 'Guardando…' : 'Continuar al espacio clínico'}
        </button>
        <p className="auth-foot">
            Tu objetivo personaliza el espacio. Los resultados siempre requieren revisión profesional.
        </p>
        </ModalShell>
    )
}