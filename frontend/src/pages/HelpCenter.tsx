import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardCheck, FileText, Info, Search, UploadCloud, UserRound } from 'lucide-react'
import { getSession } from '../services/authService'

const guides = [
  {
    id: 'cargar', title: 'Cargar y analizar una imagen', short: 'Preparación, formatos y carga', icon: UploadCloud, destination: '/app/analizar', action: 'Ir a Analizar imagen',
    steps: [
      ['Abre Analizar imagen', 'En el menú lateral, selecciona Analizar imagen. También puedes pulsar Nuevo análisis desde Inicio.'],
      ['Selecciona la modalidad', 'Elige Citología para imágenes microscópicas celulares o Colposcopia para imágenes de la superficie cervical.'],
      ['Selecciona tu archivo', 'Pulsa Seleccionar archivo o arrastra una imagen al recuadro. Usa JPG o PNG de hasta 10 MB, sin datos identificables y con autorización de uso. Para practicar puedes pulsar Usar imagen de ejemplo.'],
      ['Comprueba la vista previa', 'Verifica que la imagen y la modalidad sean correctas. Usa Reemplazar imagen para cambiar el archivo o Eliminar para quitarlo.'],
      ['Inicia la demostración', 'Pulsa Iniciar análisis de demostración. Verás el progreso simulado y después el resultado. Cancelar simulación te devuelve a la carga.'],
    ], note: 'La demostración no ejecuta IA. La clase y la confianza son valores fijos y no evalúan tu imagen. DICOM todavía no está disponible.',
  },
  {
    id: 'resultados', title: 'Encontrar e interpretar resultados', short: 'Búsqueda, clasificación y confianza', icon: Search, destination: '/app/resultados', action: 'Ir a Resultados',
    steps: [
      ['Abre Resultados', 'Selecciona Resultados en el menú lateral. Si aún no hay registros, completa un análisis de demostración o abre el caso de ejemplo desde Inicio.'],
      ['Encuentra el caso', 'Busca por identificador o nombre del archivo. Puedes filtrar por modalidad y por estado: Por revisar o Revisados.'],
      ['Abre el detalle', 'Pulsa el identificador del caso. Comprueba la imagen, la modalidad y los detalles del análisis. Usa Ampliar imagen si necesitas verla con mayor tamaño.'],
      ['Lee la clasificación y la confianza', 'El modelo del repositorio contempla NORMAL y ANORMAL. En esta versión se muestran ANORMAL y 87% como ejemplo fijo; no representan una predicción real ni probabilidad de enfermedad.'],
      ['Continúa la revisión', 'Pulsa Iniciar revisión profesional para registrar tus observaciones. Si el caso ya fue revisado, verás Editar valoración.'],
    ], note: 'La clasificación de IA requiere interpretación profesional. Esta versión de demostración no permite extraer conclusiones clínicas.',
  },
  {
    id: 'revision', title: 'Registrar una revisión profesional', short: 'Observaciones y estado de revisión', icon: ClipboardCheck, destination: '/app/resultados', action: 'Elegir un caso para revisar',
    steps: [
      ['Selecciona un caso', 'En Resultados, abre el identificador del análisis que quieres revisar.'],
      ['Entra a la revisión', 'Pulsa Iniciar revisión profesional o Editar valoración. Verás el informe de demostración y el formulario Tu valoración.'],
      ['Escribe tus observaciones', 'En Observaciones, documenta lo que deseas registrar y las limitaciones de la muestra. No incluyas nombres, documentos ni otros datos identificables.'],
      ['Confirma la revisión', 'Marca He revisado la imagen y comprendo que el resultado es una simulación. Debes escribir observaciones y marcar la casilla para habilitar el guardado.'],
      ['Guarda la valoración', 'Pulsa Guardar valoración y comprueba el mensaje de confirmación. El caso pasa a Revisado. Puedes regresar después para editar las observaciones.'],
    ], note: 'Guardar una revisión en este prototipo no equivale a validar un diagnóstico. La valoración se conserva únicamente en este navegador.',
  },
  {
    id: 'informes', title: 'Guardar un informe como PDF', short: 'Informe, impresión y borradores', icon: FileText, destination: '/app/resultados', action: 'Elegir un caso para el informe',
    steps: [
      ['Abre el análisis', 'Ve a Resultados y pulsa el identificador del caso que necesitas exportar.'],
      ['Comprueba su revisión', 'Si quieres incluir tus observaciones, entra a la revisión y pulsa Guardar valoración antes de exportar. Sin revisión guardada, el informe se identifica como borrador.'],
      ['Abre el informe imprimible', 'Desde el detalle pulsa Informe imprimible, o desde la revisión pulsa Imprimir / Guardar PDF. Se abrirá una ventana con el documento. Si no aparece, permite las ventanas emergentes para este sitio e inténtalo de nuevo.'],
      ['Abre la impresión', 'Dentro del documento, pulsa Imprimir / Guardar como PDF. En el diálogo del navegador selecciona Guardar como PDF como destino.'],
      ['Guarda el archivo', 'Revisa las páginas, pulsa Guardar y selecciona una carpeta. El documento incluye el estado de revisión y la advertencia de demostración.'],
    ], note: 'La aplicación ofrece una vista imprimible; la creación del PDF se realiza mediante el navegador. El documento no constituye evidencia clínica.',
  },
  {
    id: 'perfil', title: 'Actualizar tu perfil y preferencias', short: 'Datos profesionales y apariencia', icon: UserRound, destination: '/app/perfil', action: 'Ir a Perfil',
    steps: [
      ['Abre Perfil', 'Selecciona Perfil en el menú lateral para consultar tu información profesional.'],
      ['Edita tus datos', 'Actualiza nombre, apellidos, correo, profesión, institución u objetivo profesional. Completa todos los campos obligatorios y utiliza un correo con formato válido.'],
      ['Guarda los cambios', 'Pulsa Guardar cambios y espera el mensaje Perfil actualizado en este navegador.'],
      ['Personaliza la apariencia', 'En Configuración puedes activar Usar tema oscuro. También puedes alternar el tema desde el icono de la cabecera. La preferencia se guarda automáticamente.'],
      ['Consulta la actividad', 'En Historial encontrarás los análisis guardados. Abre un registro mediante Abrir análisis para continuar su revisión.'],
    ], note: 'La recuperación y el cambio de contraseña requieren el backend. Los datos actuales son locales y no se sincronizan entre dispositivos.',
  },
]
const faqs = [
  ['¿Por qué no puedo iniciar el análisis?', 'Primero selecciona una imagen válida. Se aceptan JPG y PNG de hasta 10 MB. Comprueba la vista previa; si el archivo está dañado, prueba otro.'],
  ['¿Por qué no se habilita Guardar valoración?', 'Escribe al menos una observación y marca la casilla de confirmación de revisión.'],
  ['¿Por qué no encuentro mis análisis?', 'Los registros están en el navegador donde los creaste. No se sincronizan entre dispositivos. Borrar los datos del sitio o eliminar los análisis desde Configuración los quita del historial.'],
  ['¿Qué hago si no se abre el informe?', 'Permite ventanas emergentes para este sitio y vuelve a pulsar Informe imprimible. En la nueva ventana utiliza Imprimir / Guardar como PDF.'],
  ['¿Qué significa la confianza del modelo?', 'No equivale a certeza clínica ni a probabilidad de enfermedad. El 87% de la demostración es un valor ilustrativo fijo.'],
  ['¿Puedo usar DICOM o recuperar mi contraseña?', 'Estas funciones están pendientes de integración con el backend. Por ahora utiliza JPG o PNG y un perfil de demostración.'],
]
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export default function HelpCenter() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState('cargar')
  const [support, setSupport] = useState(false)
  const [copied, setCopied] = useState(false)
  const signedIn = Boolean(getSession())
  const needle = normalize(query.trim())
  const visible = guides.filter(g => normalize(`${g.title} ${g.short} ${g.steps.flat().join(' ')} ${g.note}`).includes(needle))
  const active = visible.find(g => g.id === selected) || visible[0]
  const questions = faqs.filter(f => normalize(f.join(' ')).includes(needle))
  const draft = 'Módulo o caso (solo identificador de demostración):\n\n¿Qué intentabas hacer?\n\n¿Qué pasos seguiste?\n\n¿Qué ocurrió o qué mensaje apareció?\n\nFormato y tamaño del archivo, si aplica:\n\nNavegador utilizado:\n'
  return <>
    <div className="clinic-heading"><div><h1>¿En qué podemos ayudarte?</h1><p>Encuentra lo que buscas y sigue las instrucciones paso a paso.</p></div><span className="clinic-badge">Centro de ayuda</span></div>
    <section className="clinic-panel help-search-panel" aria-label="Buscar ayuda">
      <h2>Encuentra una respuesta</h2>
      <label className="help-search"><Search size={18}/><input type="search" aria-label="Buscar guías o preguntas" placeholder="Buscar: cargar imagen, revisar, PDF, perfil…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
      <small>Busca una tarea, el nombre de un botón o el problema que necesitas resolver.</small>
    </section>
    <div className="help-guide-grid" aria-label="Guías disponibles">{visible.map(g=><button key={g.id} className={`clinic-panel help-guide-card ${active?.id===g.id?'selected':''}`} aria-pressed={active?.id===g.id} aria-controls="help-guide-detail" onClick={()=>setSelected(g.id)}><g.icon size={22}/><strong>{g.title}</strong><span>{g.short}</span><span className="help-guide-link">Ver paso a paso <ArrowRight size={14}/></span></button>)}</div>
    {!visible.length && !questions.length && <section className="clinic-panel clinic-empty" role="status"><Search size={28}/><h2>No encontramos una respuesta</h2><p>Prueba con palabras como imagen, revisión, informe o perfil.</p><button className="clinic-btn" onClick={()=>setQuery('')}>Mostrar todas las guías</button></section>}
    <div className="help-content-grid"><div className="clinic-stack">
      {active && <section id="help-guide-detail" className="clinic-panel" aria-labelledby="guide-title"><span className="clinic-badge">GUÍA PASO A PASO</span><h2 id="guide-title" className="help-detail-title">{active.title}</h2><ol className="help-steps">{active.steps.map(([title,body],i)=><li key={title}><span className="help-step-number" aria-hidden="true">{i+1}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol><div className="clinic-notice"><Info size={16}/><span>{active.note}</span></div><Link className="clinic-btn primary" to={signedIn?active.destination:'/demo'}>{signedIn?active.action:'Entrar a la demostración'}<ArrowRight size={16}/></Link></section>}
      {questions.length>0&&<section className="clinic-panel"><h2>Preguntas frecuentes</h2>{questions.map(([q,a])=><details key={q} className="help-question"><summary>{q}</summary><p>{a}</p></details>)}</section>}
    </div><aside className="clinic-stack"><section className="clinic-panel resume-panel"><CircleSupport/><h2>¿Necesitas orientación?</h2><p>Prepara una descripción del problema para compartirla con el equipo del proyecto.</p><button className="clinic-btn primary" onClick={()=>{setSupport(!support);setCopied(false)}} aria-expanded={support}>{support?'Cerrar plantilla':'Preparar consulta'}</button><small>El canal de contacto está pendiente. Esta acción no envía mensajes.</small></section>{support&&<section className="clinic-panel"><h2>Describe tu consulta</h2><label className="clinic-field">Plantilla para copiar<textarea rows={11} defaultValue={draft} id="support-draft"/></label><button className="clinic-btn" onClick={async()=>{const field=document.getElementById('support-draft') as HTMLTextAreaElement;try{await navigator.clipboard.writeText(field.value);setCopied(true)}catch{field.focus();field.select();setCopied(false)}}}>Copiar consulta</button><p role="status">{copied?'Consulta copiada. Compártela mediante el canal que indique tu equipo.':'También puedes seleccionar el texto y copiarlo manualmente.'}</p></section>}<section className="clinic-panel tint-panel"><h2>Antes de consultar</h2><ul className="help-checks"><li>Indica el módulo y el paso donde ocurrió el problema.</li><li>Copia el mensaje de error y describe lo que esperabas.</li><li>No compartas imágenes ni datos identificables de pacientes.</li></ul></section></aside></div>
  </>
}
function CircleSupport(){return <Info size={22} className="accent"/>}
