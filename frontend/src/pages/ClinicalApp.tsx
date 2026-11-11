
import { readPreferences, type Theme } from '../services/preferencesService'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChartNoAxesCombined, History, House, LogOut, Menu, Moon, ScanLine, Settings, ShieldCheck, Sun, UserRound, CircleHelp, Building2 } from 'lucide-react'
import { getSession, logout, type User } from '../services/authService'
import { analysisService, sample, type Analysis } from '../services/analysisService'
import '../styles/clinical.css'
const nav = [ ['', 'Inicio', House], ['analizar', 'Analizar imagen', ScanLine], ['resultados', 'Resultados', ChartNoAxesCombined], ['historial', 'Historial', History], ['perfil', 'Perfil', UserRound], ['configuracion', 'Configuración', Settings], ['ayuda', 'Ayuda', CircleHelp] ] as const
function Heading({title, subtitle, children}: {title: string; subtitle: string; children?: ReactNode}) { return <div className="clinic-heading"><div><h1>{title}</h1><p>{subtitle}</p></div>{children}</div> }
function Badge({children, green = false}: {children: ReactNode; green?: boolean}) { return <span className={`clinic-badge ${green?'green':''}`}>{children}</span> }
export default function ClinicalApp() {
 const navigate=useNavigate(), location=useLocation()
 const [user,setUser]=useState<User|null>(getSession)
 const [items,setItems]=useState<Analysis[]>(()=>analysisService.list())
 const [theme,setTheme]=useState<Theme>(()=>{const saved=localStorage.getItem('cervix.theme');return saved==='dark'||saved==='system'?saved:'light'})
 const [preferences,setPreferences]=useState(readPreferences)
 const [systemDark,setSystemDark]=useState(()=>window.matchMedia('(prefers-color-scheme: dark)').matches)
 const dark=theme==='dark'||(theme==='system'&&systemDark)
 useEffect(()=>{const media=window.matchMedia('(prefers-color-scheme: dark)');const change=()=>setSystemDark(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change)},[])
 const [menu,setMenu]=useState(false),[notification,setNotification]=useState(false)
 const save=(item:Analysis)=>setItems(analysisService.save(item))
 useEffect(()=>{localStorage.setItem('cervix.theme',theme)},[theme])
 if(!user)return <Navigate to="/" replace/>
 const active=nav.find(([p])=>p&&location.pathname.includes(p))?.[1]||'Inicio'
 return <div className={`clinic ${dark?'clinic-dark':''}`}><a href="#clinical-content" className="skip-link">Saltar al contenido</a>{menu&&<button className="sidebar-scrim" aria-label="Cerrar menú" onClick={()=>setMenu(false)}/>}
 <aside className={`clinic-sidebar ${menu?'is-open':''}`}><Link to="/app" className="clinic-logo"><img src="/landing/logo-proporcionado.png" alt="CervixAI"/></Link><small className="sidebar-label">ESPACIO CLÍNICO</small><div className="clinic-workspace"><Building2 size={18}/><div><strong>Mi consulta</strong><small>Entorno de demostración</small></div></div><nav aria-label="Espacio clínico">{nav.map(([p,label,Icon])=><NavLink key={p} to={`/app/${p}`} end={!p} onClick={()=>setMenu(false)}><Icon size={18}/>{label}</NavLink>)}</nav><div className="sidebar-bottom"><div className="sidebar-advice"><ShieldCheck size={20}/><strong>Tu criterio es esencial</strong><p>La IA acompaña la evaluación. No reemplaza el diagnóstico médico.</p></div><div className="clinic-account"><span className="avatar">{user.nombre[0]}{user.apellidos[0]}</span><div><strong>{user.nombreVisible || `${user.nombre} ${user.apellidos}`}</strong><small>{user.profesion}</small></div><button aria-label="Cerrar sesión" onClick={()=>{logout();navigate('/')}}><LogOut size={17}/></button></div></div></aside>
 <div className="clinic-body"><header className="clinic-topbar"><button className="mobile-menu icon-btn" aria-label="Abrir menú" onClick={()=>setMenu(true)}><Menu/></button><span>Espacio clínico <span className="breadcrumb">›</span> <b>{active}</b></span><div className="topbar-actions"><Badge>• Modo demostración</Badge><button className="icon-btn" aria-label={dark?'Activar tema claro':'Activar tema oscuro'} onClick={()=>setTheme(dark?'light':'dark')}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button><button className="icon-btn" aria-label="Notificaciones" aria-expanded={notification} onClick={()=>setNotification(!notification)}><Bell size={18}/></button><time>{new Date().toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'})}</time></div>{notification&&<div className="clinic-notifications"><strong>Notificaciones de demostración</strong>{preferences.reminders&&items.some(x=>!x.reviewed)?<p>{items.filter(x=>!x.reviewed).length} análisis pendientes de revisión. <Link to="/app/resultados" onClick={()=>setNotification(false)}>Consultar resultados →</Link></p>:null}{preferences.completed&&items[0]?<p>Última simulación completada: <Link to={`/app/resultados/${items[0].id}`} onClick={()=>setNotification(false)}>{items[0].id}</Link>{!preferences.hideDetails&&` · ${items[0].modality} · ${items[0].fileName}`}</p>:null}{(!preferences.completed||!items.length)&&(!preferences.reminders||!items.some(x=>!x.reviewed))?<p>No hay avisos activos según tus preferencias.</p>:null}</div>}</header>
 <main id="clinical-content" className="clinic-main"><Routes><Route index element={<Dashboard user={user} items={items} onExample={()=>{save({...sample,date:new Date().toISOString()});navigate('/app/resultados/DEMO-001')}}/>}/><Route path="analizar" element={<Upload onSave={save}/>}/><Route path="resultados" element={<Results items={items}/>}/><Route path="resultados/:id/*" element={<Result items={items} onSave={save} user={user}/>}/><Route path="historial" element={<HistoryPage items={items}/>}/><Route path="perfil" element={<Profile user={user} onSave={setUser}/>}/><Route path="configuracion" element={<SettingsPage user={user} theme={theme} onTheme={setTheme} preferences={preferences} onPreferences={setPreferences} onClear={()=>{analysisService.clear();setItems([])}}/>}/><Route path="ayuda" element={<Help/>}/><Route path="*" element={<div><Heading title="Página no encontrada" subtitle="Esta sección no está disponible."/><Link className="clinic-btn primary" to="/app">Volver al inicio</Link></div>}/></Routes></main></div></div>
}
function Dashboard(_props: Record<string, unknown>){return <section><h1>Módulo en preparación</h1></section>}

function Upload(_props: Record<string, unknown>){return <section><h1>Módulo en preparación</h1></section>}

function Results(_props: Record<string, unknown>){return <section><h1>Módulo en preparación</h1></section>}

function Result(_props: Record<string, unknown>){return <section><h1>Módulo en preparación</h1></section>}

function HistoryPage(_props: Record<string, unknown>){return <section><h1>Módulo en preparación</h1></section>}

export function Help(){return <h1>Centro de ayuda</h1>}


function Profile(_props:Record<string,unknown>){return <h1>Perfil en preparación</h1>}

function SettingsPage(_props:Record<string,unknown>){return <h1>Configuración en preparación</h1>}
