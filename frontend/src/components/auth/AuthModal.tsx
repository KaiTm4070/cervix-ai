import { useState } from 'react'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'
import ObjectiveModal from './ObjetiveModal'
import PasswordRecoveryModal from './PasswordRecoveryModal'
import ResetPasswordModal from './ResetPasswordModal'
import type { User } from '../../services/authService'
import './auth.css'

type View = 'login' | 'register' | 'objetivo' | 'forgot' | 'reset'

interface AuthModalProps {
    initialView?: 'login' | 'register'
    onClose: () => void
    onFinish: (user: User) => void
    resetToken?: string
}

export default function AuthModal({ initialView = 'login', onClose, onFinish, resetToken }: AuthModalProps) {
    const [view, setView] = useState<View>(resetToken ? 'reset' : initialView)
    const [user, setUser] = useState<User | null>(null)

    // Tras iniciar sesión: si ya eligió objetivo entra directo; si no, pasa a elegirlo.
    const handleLogin = (u: User) => {
        if (u.objetivo) {
        onFinish(u)
        return
        }
        setUser(u)
        setView('objetivo')
    }

    // Tras registrarse siempre elige objetivo.
    const handleRegister = (u: User) => {
        setUser(u)
        setView('objetivo')
    }

    if (view === 'login') {
        return (
        <LoginModal
            onClose={onClose}
            onSwitch={() => setView('register')}
            onForgot={() => setView('forgot')}
            onSuccess={handleLogin}
        />
        )
    }

    if (view === 'register') {
        return (
        <RegisterModal
            onClose={onClose}
            onSwitch={() => setView('login')}
            onSuccess={handleRegister}
        />
        )
    }

    if (view === 'forgot') {
        return <PasswordRecoveryModal onClose={onClose} onBack={() => setView('login')} />
    }

    if (view === 'reset') {
        return <ResetPasswordModal token={resetToken ?? ''} onClose={onClose} onBack={() => setView('login')} />
    }

    return <ObjectiveModal user={user} onClose={onClose} onFinish={onFinish} />
}