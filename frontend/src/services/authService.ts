export interface User {
    nombre: string; apellidos: string; email: string
    profesion: string; institucion: string
    objetivo: string | null
}
export type RegisterData = Omit<User, 'objetivo'> & { password: string; terminos: boolean }

const USER_KEY = 'cervix.user'
const SESSION_KEY = 'cervix.session'
const read = (s: Storage, k: string): User | null => {
    try { return JSON.parse(s.getItem(k) ?? 'null') } catch { return null }
}

export async function register({ password, terminos, ...profile }: RegisterData): Promise<User> {
    void password
    void terminos
    const user: User = { ...profile, objetivo: null }
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
}

export async function login({ email }: { email: string }): Promise<User> {
    const user = read(localStorage, USER_KEY)
    if (!user || user.email.toLowerCase() !== email.trim().toLowerCase())
        throw new Error('No encontramos una cuenta con ese correo. Regístrate primero.')
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
}

export async function saveObjective(objetivo: string): Promise<User> {
    const current = read(sessionStorage, SESSION_KEY)
    if (!current) throw new Error('No hay una sesión activa.')
    const user = { ...current, objetivo }
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
}

export const getSession = () => read(sessionStorage, SESSION_KEY)
export const logout = () => sessionStorage.removeItem(SESSION_KEY)