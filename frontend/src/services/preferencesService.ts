export type Theme = 'light' | 'dark' | 'system'
export interface Preferences { completed: boolean; reminders: boolean; hideDetails: boolean }
export function readPreferences(): Preferences {
  try { return { completed: true, reminders: true, hideDetails: true, ...JSON.parse(localStorage.getItem('cervix.preferences') || '{}') } } catch { return { completed: true, reminders: true, hideDetails: true } }
}
