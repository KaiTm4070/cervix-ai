export interface User {
    nombre: string; apellidos: string; email: string
    profesion: string; institucion: string
    objetivo: string | null
    rol?: string
    nombreVisible?: string; especialidad?: string; objetivoTexto?: string; avatar?: string
}

export type RegisterData = Omit<User, 'objetivo' | 'rol'> & { password: string; terminos: boolean }

const SESSION_KEY = 'cervix.session'

interface AuthResponse { user: User }

async function request(path: string, init?: RequestInit): Promise<AuthResponse> {
    let response: Response
    try {
        response = await fetch(`/api/auth${path}`, {
            ...init,
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', ...init?.headers },
        })
    } catch {
        throw new Error('No se pudo conectar con el backend. Inicia la API en http://localhost:8000.')
    }
    if (!response.ok) {
        const body = await response.json().catch(() => null) as { detail?: string } | null
        throw new Error(body?.detail || 'No se pudo completar la operación.')
    }
    return response.json() as Promise<AuthResponse>
}

function saveSession(user: User): User {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
}

export async function register({ password, terminos, ...profile }: RegisterData): Promise<User> {
    const { user } = await request('/register', {
        method: 'POST',
        body: JSON.stringify({ ...profile, password, terminos }),
    })
    return saveSession(user)
}

export async function login({ email, password }: { email: string; password: string }): Promise<User> {
    const { user } = await request('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    })
    return saveSession(user)
}

export async function saveObjective(objetivo: string): Promise<User> {
    const { user } = await request('/objective', {
        method: 'PATCH',
        body: JSON.stringify({ objetivo }),
    })
    return saveSession(user)
}

export async function restoreSession(): Promise<User | null> {
    try {
        const { user } = await request('/me')
        return saveSession(user)
    } catch {
        sessionStorage.removeItem(SESSION_KEY)
        return null
    }
}

export const getSession = () => {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null') as User | null }
    catch { return null }
}

export async function logout(): Promise<void> {
    try {
        await request('/logout', { method: 'POST' })
    } finally {
        sessionStorage.removeItem(SESSION_KEY)
    }
}
