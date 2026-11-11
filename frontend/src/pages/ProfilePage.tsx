import { useRef, useState, type FormEvent } from 'react'
import { Camera, Check, Info } from 'lucide-react'
import type { User } from '../services/authService'
const objectives: Record<string, string> = {
  deteccion: 'Explorar patrones visuales como apoyo a la detección temprana de lesiones cervicales.',
  investigacion: 'Estudiar imágenes cervicales y organizar análisis con fines de investigación académica.',
  apoyo: 'Explorar la evaluación asistida de imágenes cervicales y apoyar la revisión profesional.',
}
export default function ProfilePage({ user, onSave }: { user: User; onSave: (user: User) => void }) {
  const [form, setForm] = useState(() => ({ ...user, nombreVisible: user.nombreVisible || `${user.nombre} ${user.apellidos}`, especialidad: user.especialidad || '', objetivoTexto: user.objetivoTexto ?? objectives[user.objetivo || ''] ?? '', avatar: user.avatar || '' }))
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const upload = useRef<HTMLInputElement>(null)
  const initials = `${user.nombre[0] || ''}${user.apellidos[0] || ''}`.toUpperCase()
  function change(key: keyof typeof form, value: string) { setForm(previous => ({ ...previous, [key]: value })); setMessage(''); setError('') }
  function avatar(file?: File) {
    if (!file) return
    setError('')
    if (!['image/jpeg', 'image/png'].includes(file.type)) { setError('Selecciona un avatar JPG o PNG.'); return }
    if (file.size > 2 * 1024 * 1024) { setError('El avatar debe pesar como máximo 2 MB.'); return }
    const reader = new FileReader()
    reader.onerror = () => setError('No se pudo leer la imagen.')
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => setError('El archivo no contiene una imagen válida.')
      image.onload = () => change('avatar', String(reader.result))
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  }
  function cancel() {
    setForm({ ...user, nombreVisible: user.nombreVisible || `${user.nombre} ${user.apellidos}`, especialidad: user.especialidad || '', objetivoTexto: user.objetivoTexto ?? objectives[user.objetivo || ''] ?? '', avatar: user.avatar || '' })
    setMessage('Cambios descartados.'); setError('')
    if (upload.current) upload.current.value = ''
  }
  function save(event: FormEvent) {
    event.preventDefault()
    const updated = { ...form, nombreVisible: form.nombreVisible.trim(), profesion: form.profesion.trim(), institucion: form.institucion.trim(), email: form.email.trim(), especialidad: form.especialidad.trim(), objetivoTexto: form.objetivoTexto.trim() }
    if (!updated.nombreVisible || !updated.profesion || !updated.institucion) { setError('Completa el nombre para mostrar, el rol profesional y la institución.'); return }
    const previousProfile = localStorage.getItem('cervix.user')
    try {
      localStorage.setItem('cervix.user', JSON.stringify(updated))
      sessionStorage.setItem('cervix.session', JSON.stringify(updated))
    } catch {
      if (previousProfile !== null) localStorage.setItem('cervix.user', previousProfile)
      else localStorage.removeItem('cervix.user')
      setError('No se pudo guardar el perfil. El almacenamiento puede estar lleno; prueba con un avatar más pequeño.'); return
    }
    onSave(updated); setMessage('Cambios guardados en este navegador.'); setError('')
  }
  return <>
    <div className="clinic-heading"><div><h1>Mi perfil</h1><p>Personaliza tu información profesional y el propósito de tu espacio.</p></div><span className="clinic-badge">• Perfil de demostración</span></div>
    <form className="profile-layout" onSubmit={save}>
      <aside className="clinic-stack profile-summary">
        <section className="clinic-panel profile-identity">
          {form.avatar ? <img className="profile-photo" src={form.avatar} alt="Avatar del perfil" /> : <span className="profile-initials">{initials}</span>}
          <h2>{user.nombreVisible || `${user.nombre} ${user.apellidos}`}</h2>
          <span className="clinic-badge">• Datos locales</span>
          <p>{user.profesion} · {user.institucion || 'Mi consulta'}</p>
          <button type="button" className="clinic-btn" onClick={() => upload.current?.click()}><Camera size={17} />Cambiar avatar</button>
          <input ref={upload} type="file" hidden accept="image/jpeg,image/png" aria-label="Seleccionar avatar" onChange={event => avatar(event.target.files?.[0])} />
          <small>{form.avatar ? 'Vista previa del avatar. Guarda los cambios para conservarlo.' : 'Se muestran tus iniciales. Puedes añadir una imagen JPG o PNG de hasta 2 MB.'}</small>
          {form.avatar && <button type="button" className="clinic-text-button" onClick={() => { change('avatar', ''); if (upload.current) upload.current.value = '' }}>Usar iniciales</button>}
        </section>
        <section className="clinic-panel tint-panel profile-note"><Info size={20} className="accent" /><h2>Un perfil ilustrativo</h2><p>Tu información se utiliza en este espacio de demostración y se guarda en el navegador. No representa una verificación de identidad ni de credenciales profesionales.</p></section>
      </aside>
      <div className="clinic-stack profile-editor">
        <section className="clinic-panel"><h2>Información profesional</h2><p className="profile-section-description">Estos datos se muestran únicamente en tu espacio de demostración.</p>
          <div className="profile-fields">
            <label className="clinic-field">Nombre para mostrar<input required maxLength={100} value={form.nombreVisible} onChange={e => change('nombreVisible', e.target.value)} autoComplete="name" /></label>
            <label className="clinic-field">Rol profesional<input required maxLength={100} value={form.profesion} onChange={e => change('profesion', e.target.value)} placeholder="Profesional de salud" /></label>
          </div>
          <label className="clinic-field">Especialidad<input maxLength={100} value={form.especialidad} onChange={e => change('especialidad', e.target.value)} placeholder="Ej. Ginecología" /></label>
          <label className="clinic-field">Institución / consulta<input required maxLength={160} value={form.institucion} onChange={e => change('institucion', e.target.value)} autoComplete="organization" /><small>Indica la institución o consulta de tu entorno autorizado.</small></label>
          <label className="clinic-field">Correo profesional<input required type="email" value={form.email} onChange={e => change('email', e.target.value)} autoComplete="email" /><small>No se envían comunicaciones desde esta demostración.</small></label>
        </section>
        <section className="clinic-panel"><h2>Objetivo profesional</h2><label className="clinic-field">¿Cómo quieres utilizar Cérvix-AI?<textarea rows={3} maxLength={1200} value={form.objetivoTexto} onChange={e => change('objetivoTexto', e.target.value)} placeholder="Describe el propósito de tu espacio de trabajo…" /><small>Evita incluir información personal de pacientes o identificadores clínicos.</small></label></section>
        {error && <p className="clinic-error" role="alert">{error}</p>}
        {message && <p className="success-message" role="status">{message}</p>}
        <div className="profile-save-row"><small>Los datos pueden editarse. Los cambios se guardan de forma local.</small><div className="clinic-actions"><button type="button" className="clinic-btn" onClick={cancel}>Cancelar</button><button className="clinic-btn primary" type="submit"><Check size={17} />Guardar cambios</button></div></div>
      </div>
    </form>
    <div className="clinic-notice"><Info size={16} /><span>Entorno de demostración. Completa solo información apropiada para este prototipo; no incluyas datos de pacientes.</span></div>
  </>
}
