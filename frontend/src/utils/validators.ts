export const isEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())

export const passwordIssues = (v: string): string[] => {
    const issues: string[] = []
    if (v.length < 8) issues.push('al menos 8 caracteres')
    if (!/[A-ZÁÉÍÓÚÑ]/.test(v)) issues.push('una mayúscula')
    if (!/\d/.test(v)) issues.push('un número')
    return issues
}