import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface Props { onClose: () => void; width?: number; labelledBy: string; children: ReactNode }

export default function ModalShell({ onClose, width = 420, labelledBy, children }: Props) {
    const boxRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
        window.addEventListener('keydown', onKey)
        boxRef.current?.querySelector<HTMLElement>('input, select, button.opt')?.focus()
        return () => {
            document.body.style.overflow = prev
            window.removeEventListener('keydown', onKey)
        }
    }, [onClose])

    return createPortal(
        <div className="auth-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div ref={boxRef} className="auth-card" style={{ width }} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
                <div className="auth-top">
                <img src="../../../public/landing/logo2.png" alt="CervixAI" className="auth-logo" />
                <button type="button" className="auth-x" onClick={onClose} aria-label="Cerrar"><X size={16} /></button>
                </div>
                {children}
            </div>
        </div>,
        document.body,
    )
}