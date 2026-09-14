import { useEffect } from 'react'
import { Shell } from './components/Shell'
import { useRuta } from './lib/ruta'
import { Academia } from './screens/Academia'
import { Actividad } from './screens/Actividad'
import { Biblioteca } from './screens/Biblioteca'
import { Compartir } from './screens/Compartir'
import { Constructor } from './screens/Constructor'
import { Curso } from './screens/Curso'
import { Hoy } from './screens/Hoy'
import { Login } from './screens/Login'
import { Presentar } from './screens/Presentar'
import { Registro } from './screens/Registro'
import { Stock } from './screens/Stock'
import { AcademiaProvider } from './state/academia'
import { DemoProvider } from './state/demo'
import { SesionProvider, useSesion } from './state/sesion'

function Rutas() {
  const ruta = useRuta()
  const { sesion } = useSesion()
  const pantalla = ruta.nombre === 'curso' ? `curso:${ruta.cursoId}:${ruta.leccionId ?? ''}` : ruta.nombre

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pantalla, sesion])

  // sin sesión se muestra el ingreso; la ruta pedida se conserva y se abre al entrar
  if (!sesion) return <Login />

  if (ruta.nombre === 'presentar') return <Presentar presentacionId={ruta.presentacionId} />

  return (
    <Shell ruta={ruta}>
      {ruta.nombre === 'hoy' && <Hoy />}
      {ruta.nombre === 'biblioteca' && <Biblioteca />}
      {ruta.nombre === 'constructor' && <Constructor baseId={ruta.baseId} />}
      {ruta.nombre === 'stock' && <Stock />}
      {ruta.nombre === 'compartir' && <Compartir />}
      {ruta.nombre === 'registro' && <Registro />}
      {ruta.nombre === 'academia' && <Academia />}
      {ruta.nombre === 'curso' && <Curso key={ruta.cursoId} cursoId={ruta.cursoId} leccionId={ruta.leccionId} />}
      {ruta.nombre === 'actividad' && <Actividad />}
    </Shell>
  )
}

export default function App() {
  return (
    <SesionProvider>
      <DemoProvider>
        <AcademiaProvider>
          <Rutas />
        </AcademiaProvider>
      </DemoProvider>
    </SesionProvider>
  )
}
