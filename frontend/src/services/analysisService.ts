export type Modality = 'Citología' | 'Colposcopia'
export interface Analysis {
  id: string; date: string; modality: Modality; fileName: string; image: string;
  classification: 'NORMAL' | 'ANORMAL'; confidence: number; reviewed: boolean; notes: string;
  interpretabilityImage?: string;
}
const KEY = 'cervix.demo.analyses.v1'
export const sample: Analysis = { id: 'DEMO-001', date: '2026-11-09T10:30:00', modality: 'Citología', fileName: 'Micrografía-citológica.png', image: '/landing/Micrografía-citológica.png', classification: 'ANORMAL', confidence: 87, reviewed: false, notes: '' }
export const analysisService = {
  list(): Analysis[] {
    try {
      const items = JSON.parse(localStorage.getItem(KEY) || '[]') as Omit<Analysis, 'image'>[]
      return items.map(item => ({ ...item, image: sample.image }))
    } catch { return [] }
  },
  save(item: Analysis) {
    const items = this.list()
    const next = [item, ...items.filter(x => x.id !== item.id)]
    localStorage.setItem(KEY, JSON.stringify(next, (key, value) => key === 'image' ? undefined : value))
    return next
  },
  clear() { localStorage.removeItem(KEY) },
}
export async function analyzeImage(file: File, preview: string, modality: Modality): Promise<Analysis> {
  const body = new FormData()
  body.append('image', file)
  body.append('modality', modality)
  let response: Response
  try {
    response = await fetch('/api/analysis', { method: 'POST', credentials: 'include', body })
  } catch {
    throw new Error('No se pudo conectar con el backend. Inicia la API en http://localhost:8000.')
  }
  if (!response.ok) {
    const error = await response.json().catch(() => null) as { detail?: string } | null
    throw new Error(error?.detail || 'No se pudo analizar la imagen.')
  }
  const result = await response.json() as {
    id: string; date: string; classification: Analysis['classification']; confidence: number;
    interpretability_image?: string
  }
  return {
    id: result.id, date: result.date, modality, fileName: file.name, image: preview,
    classification: result.classification, confidence: result.confidence, reviewed: false, notes: '',
    interpretabilityImage: result.interpretability_image,
  }
}
