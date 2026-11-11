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
// Adaptador local de demostración. Reemplazar por HTTP cuando exista el contrato de FastAPI.
// No se ejecuta inferencia ni se deduce una clase a partir del archivo cargado.
export async function simulateAnalysis(fileName: string, image: string, modality: Modality): Promise<Analysis> {
  return { ...sample, id: `DEMO-${Date.now().toString(36).toUpperCase()}`, date: new Date().toISOString(), fileName, image, modality }
}
