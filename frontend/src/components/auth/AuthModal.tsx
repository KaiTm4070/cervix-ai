import { useState } from 'react'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'
import ObjectiveModal from './ObjetiveModal'
import type { User } from '../../services/authService'
import './auth.css'

type View = 'login' | 'register' | 'objetivo'

interface AuthModalProps {
    initialView?: 'login' | 'register'
    onClose: () => void
    onFinish: (user: User) => void
}

export default function AuthModal({ initialView = 'login', onClose, onFinish }: AuthModalProps) {
    const [view, setView] = useState<View>(initialView)
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

    return <ObjectiveModal user={user} onClose={onClose} onFinish={onFinish} />
}