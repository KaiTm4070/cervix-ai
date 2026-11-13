export type Modality = 'Citología' | 'Colposcopia'
export interface Analysis {
  id: string; date: string; modality: Modality; fileName: string; image: string;
  classification: 'NORMAL' | 'ANORMAL'; confidence: number; reviewed: boolean; notes: string;
}
const KEY = 'cervix.demo.analyses.v1'
export const sample: Analysis = { id: 'DEMO-001', date: '2026-11-09T10:30:00', modality: 'Citología', fileName: 'Citologia-ilustrativa.png', image: '/landing/citologia-ejemplo.png', classification: 'ANORMAL', confidence: 87, reviewed: false, notes: '' }
export const analysisService = {
  list(): Analysis[] { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } },
  save(item: Analysis) { const items = this.list(); const next = [item, ...items.filter(x => x.id !== item.id)]; localStorage.setItem(KEY, JSON.stringify(next)); return next },
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
    id: string; date: string; classification: Analysis['classification']; confidence: number
  }
  return {
    id: result.id, date: result.date, modality, fileName: file.name, image: preview,
    classification: result.classification, confidence: result.confidence, reviewed: false, notes: '',
  }
}

export async function simulateAnalysis(fileName: string, image: string, modality: Modality): Promise<Analysis> {
  if (!image.startsWith('data:')) {
    return { ...sample, id: `DEMO-${Date.now().toString(36).toUpperCase()}`, date: new Date().toISOString(), fileName, image, modality }
  }
  const [header, encoded] = image.split(',', 2)
  const mime = header.match(/^data:(.*?);base64$/)?.[1] || 'image/png'
  const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0))
  return analyzeImage(new File([bytes], fileName, { type: mime }), image, modality)
}
