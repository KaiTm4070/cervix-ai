import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface Props { onClose: () => void; width?: number; labelledBy: string; children: ReactNode }

export default function ModalShell({ onClose, width = 420, labelledBy, children }: Props) {
    const boxRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        const previousFocus = document.activeElement as HTMLElement | null
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
            if (e.key !== 'Tab') return
            const controls = boxRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], textarea:not(:disabled)')
            if (!controls?.length) return
            const first = controls[0], last = controls[controls.length - 1]
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
        }
        window.addEventListener('keydown', onKey)
        boxRef.current?.querySelector<HTMLElement>('input, select, button.opt')?.focus()
        return () => {
            document.body.style.overflow = prev
            window.removeEventListener('keydown', onKey)
            previousFocus?.focus()
        }
    }, [onClose])

    return createPortal(
        <div className="auth-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div ref={boxRef} className="auth-card" style={{ width }} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
                <div className="auth-top">
                <img src="/landing/logo2.png" alt="CervixAI" className="auth-logo" />
                <button type="button" className="auth-x" onClick={onClose} aria-label="Cerrar"><X size={16} /></button>
                </div>
                {children}
            </div>
        </div>,
        document.body,
    )
}
