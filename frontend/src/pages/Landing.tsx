import type { ReactElement } from 'react'
import '../styles/landing.css'

const PATHS: Record<string, ReactElement> = {
  upload: <path d="M12 15V3M7 8l5-5 5 5M4 15v4a2 2 0 002 2h12a2 2 0 002-2v-4" />,
  spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  scan: <><path d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3" /><circle cx="12" cy="12" r="3" /></>,
  doc: <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8zM14 3v5h5M9 13h6M9 17h4" />,
  shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
  check: <path d="M5 12l5 5 9-10" />,
  folder: <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />,
  sliders: <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  alert: <path d="M12 3l10 18H2zM12 10v5M12 18v.5" />,
  layers: <path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5" />,
  route: <><circle cx="6" cy="6" r="2" /><circle cx="18" cy="18" r="2" /><path d="M8 6h6a3 3 0 010 6h-4a3 3 0 000 6h6" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
}

function Icon({ n, className = '' }: { n: string; className?: string }) {
  return (
    <svg className={`i ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      {PATHS[n]}
    </svg>
  )
}

const STRIP = [
  ['layers', 'Dos modalidades de imagen'],
  ['route', 'Un flujo de análisis guiado'],
  ['doc', 'Resultados para revisar'],
  ['user', 'Decisión siempre profesional'],
]

const STEPS = [
  ['upload', 'Sube tu imagen', 'Selecciona la modalidad y carga una muestra sin datos identificables.'],
  ['spark', 'Deja que la IA procese', 'Consulta el estado de preparación y análisis de la imagen.'],
  ['scan', 'Explora los resultados', 'Revisa la clase sugerida, la confianza del modelo y el contexto.'],
  ['doc', 'Revisa y documenta', 'Añade tu valoración y descarga un informe de apoyo.'],
]

const TOOLS = [
  ['folder', 'Casos organizados', 'Consulta el historial y recupera imágenes, resultados e informes de cada análisis.'],
  ['sliders', 'Lectura con contexto', 'Distingue la clasificación sugerida de la confianza del modelo y sus limitaciones.'],
  ['doc', 'Informes revisables', 'Documenta los hallazgos e incorpora tu valoración antes de exportar.'],
]

const LIMITS = [
  ['user', 'Revisión profesional', 'Interpreta los hallazgos junto con antecedentes, exploración y protocolos locales.'],
  ['shield', 'Datos bajo tu control', 'Utiliza muestras desidentificadas y respeta el consentimiento y las políticas de tu institución.'],
  ['alert', 'Reconoce las limitaciones', 'La calidad de imagen y el contexto de la muestra pueden afectar la salida del modelo.'],
]

const CHECKS = [
  'Clase sugerida y confianza del modelo, por separado',
  'Hallazgos visuales para orientar la revisión',
  'Informe que conserva el contexto del análisis',
]

const FAQ = [
  ['¿Cérvix-AI realiza un diagnóstico?', 'No. Sugiere patrones y clasificaciones para que un profesional los revise junto con la evidencia clínica.'],
  ['¿Qué formatos de imagen puedo subir?', 'JPG, PNG y DICOM, con un máximo de 10 MB por imagen. Selecciona la modalidad correspondiente.'],
  ['¿Qué significa la confianza del modelo?', 'Expresa la seguridad de la clasificación del modelo, no certeza clínica ni probabilidad individual de enfermedad.'],
  ['¿Puedo explorar la plataforma con un caso de ejemplo?', 'Sí. Este entorno muestra un caso ilustrativo sin información identificable de pacientes.'],
]

const FOOT: [string, [string, string][]][] = [
  ['Plataforma', [['Cómo funciona', '#como-funciona'], ['Modalidades', '#plataforma'], ['Uso responsable', '#uso-responsable']]],
  ['Recursos', [['Centro de ayuda', '/ayuda'], ['Preguntas frecuentes', '/ayuda#faq'], ['Contacto', '/contacto']]],
  ['Legal', [['Privacidad', '/privacidad'], ['Términos de uso', '/terminos'], ['Política de datos', '/datos']]],
]

const Logo = () => (
  <a className="logo" href="/" aria-label="CervixAI">
    <img src="../public/landing/logo.png" alt="CervixAI" height={40} />
  </a>
)

export default function Landing() {
  return (
    <div className="landing">
      <header className="nav">
        <div className="wrap nav__in">
          <Logo />
          <nav className="nav__links" aria-label="Principal">
            <a href="#plataforma">La plataforma</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#uso-responsable">Uso responsable</a>
          </nav>
          <div className="nav__cta">
            <a className="btn btn--dark" href="/login">Iniciar sesión</a>
            <a className="btn btn--primary" href="/registro">Registrarse</a>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="wrap hero__in">
            <div className="hero__text">
              <p className="eyebrow eyebrow--teal"><Icon n="spark" />Inteligencia artificial para la salud cervical</p>
              <h1>Tecnología que apoya la detección temprana de lesiones cervicales</h1>
              <p className="lead">Una perspectiva inteligente para tus imágenes de citología y colposcopia. Más contexto para tu evaluación; el criterio clínico sigue siendo tuyo.</p>
              <div className="hero__btns">
                <a className="btn btn--primary btn--lg" href="/registro"><Icon n="arrow" />Registrarse</a>
                <a className="btn btn--dark btn--lg" href="/login">Iniciar sesión</a>
              </div>
              <p className="note"><Icon n="shield" />Diseñado como apoyo a profesionales de salud. No sustituye el diagnóstico.</p>
            </div>
            <figure className="hero__media">
              <img src="/landing/hero-celula.png" alt="Ilustración de una célula con patrones de análisis de imagen" />
              <span className="chip"><Icon n="scan" />Visión artificial · Perspectiva humana</span>
              <figcaption className="hero__card">
                <Icon n="layers" />
                <span><strong>Patrones que aportan contexto</strong><small>Análisis de imagen con revisión profesional</small></span>
              </figcaption>
            </figure>
          </div>
          <ul className="wrap strip">
            {STRIP.map(([icon, text]) => (
              <li key={text}><Icon n={icon} />{text}</li>
            ))}
          </ul>
        </section>

        <section className="sec sec--light" id="plataforma">
          <div className="wrap head">
            <div><p className="eyebrow">Dos perspectivas, un mismo propósito</p><h2>Más contexto en cada imagen.</h2></div>
            <p className="head__side">Integra distintas fuentes visuales en un espacio de trabajo pensado para la salud cervical.</p>
          </div>
        </section>

        <section className="sec sec--dark" id="como-funciona">
          <div className="wrap head">
            <div><p className="eyebrow eyebrow--teal">Del archivo a la revisión</p><h2>Un proceso claro. Paso a paso.</h2></div>
            <p className="head__side">Un recorrido guiado para mantener el foco en lo importante: la interpretación de cada caso.</p>
          </div>
          <ol className="wrap grid grid--4">
            {STEPS.map(([icon, title, text], i) => (
              <li key={title} className="card card--dark step">
                <span className="step__n">{String(i + 1).padStart(2, '0')}</span>
                <Icon n={icon} className="step__i" />
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="sec sec--light">
          <div className="wrap head head--col">
            <p className="eyebrow">Menos fricción, más contexto</p>
            <h2>Todo tu análisis, en un solo lugar.</h2>
            <p className="head__side">Herramientas que acompañan la lectura y la documentación, sin apartar al profesional del centro de la decisión.</p>
          </div>
          <div className="wrap grid grid--3">
            {TOOLS.map(([icon, title, text]) => (
              <article key={title} className="card card--light">
                <Icon n={icon} className="card__i" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="sec sec--dark">
          <div className="wrap example">
            <div className="card card--dark sample">
              <div className="sample__top"><strong>Una lectura que puedes revisar</strong><span className="tag tag--teal">Ejemplo</span></div>
              <div className="sample__img">
                <img src="/landing/citologia-ejemplo.png" alt="Citología de ejemplo con región de interés resaltada" />
                <span className="sample__label">Citología · Ilustración</span>
                <span className="sample__roi" aria-hidden="true" />
              </div>
              <div className="sample__res">
                <div><small>Clase sugerida por IA</small><strong className="sample__class">LSIL</strong></div>
                <span className="tag tag--amber">Bajo riesgo</span>
                <div className="sample__conf"><small>Confianza del modelo</small><strong className="teal">87%</strong></div>
              </div>
              <p className="sample__note">La confianza no equivale a certeza clínica ni a probabilidad de enfermedad.</p>
            </div>
            <div className="example__text">
              <p className="eyebrow eyebrow--teal">Inteligencia que acompaña, no sustituye</p>
              <h2>La IA aporta señales. Tú aportas el criterio.</h2>
              <p className="lead">Una red neuronal convolucional (CNN) identifica patrones visuales y propone una clasificación para revisión. Cada salida necesita contexto clínico.</p>
              <ul className="checks">
                {CHECKS.map((c) => (<li key={c}><Icon n="check" />{c}</li>))}
              </ul>
            </div>
          </div>
        </section>

        <section className="sec sec--light" id="uso-responsable">
          <div className="wrap head">
            <div><p className="eyebrow">Tecnología con límites claros</p><h2>La decisión clínica no se automatiza.</h2></div>
            <p className="head__side">Cérvix-AI es una herramienta de apoyo. Sus resultados no confirman ni descartan enfermedad por sí solos y deben contrastarse con estudios pertinentes.</p>
          </div>
          <div className="wrap grid grid--3">
            {LIMITS.map(([icon, title, text]) => (
              <article key={title} className="card card--light card--row">
                <Icon n={icon} className="card__i" />
                <div><h3>{title}</h3><p>{text}</p></div>
              </article>
            ))}
          </div>
          <p className="wrap legend">
            <span>Clasificación orientativa</span>
            <span className="tag tag--red">Alto riesgo</span>
            <span className="tag tag--amber">Bajo riesgo</span>
            <span className="tag tag--green">Negativo</span>
          </p>
        </section>

        <section className="sec sec--light sec--faq">
          <div className="wrap faq">
            <div>
              <p className="eyebrow">Antes de empezar</p>
              <h2>Respuestas claras.</h2>
              <p className="head__side">Lo que necesitas saber sobre el uso de Cérvix-AI.</p>
              <a className="link" href="/ayuda">Visitar el centro de ayuda <Icon n="arrow" /></a>
            </div>
            <div className="faq__list">
              {FAQ.map(([q, a]) => (
                <details key={q}><summary>{q}</summary><p>{a}</p></details>
              ))}
            </div>
          </div>
        </section>

        <section className="cta">
          <div className="wrap">
            <p className="eyebrow eyebrow--on">Una nueva perspectiva para tu práctica</p>
            <h2>Acompaña tu criterio con inteligencia.</h2>
            <p>Explora un flujo de análisis diseñado para profesionales de salud.</p>
            <div className="hero__btns">
              <a className="btn btn--white btn--lg" href="/registro">Registrarse</a>
              <a className="btn btn--dark btn--lg" href="/login">Iniciar sesión</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap foot__in">
          <div className="foot__brand">
            <Logo />
            <p>Inteligencia artificial al servicio del criterio clínico. Citología · Colposcopia</p>
          </div>
          {FOOT.map(([title, links]) => (
            <nav key={title} aria-label={title}>
              <h4>{title}</h4>
              {links.map(([label, href]) => (<a key={label} href={href}>{label}</a>))}
            </nav>
          ))}
        </div>
        <div className="wrap foot__bar">
          <span>© 2026 Cérvix-AI. Todos los derechos reservados.</span>
          <span>Entorno de demostración · No usar como único fundamento diagnóstico</span>
        </div>
      </footer>
    </div>
  )
}
