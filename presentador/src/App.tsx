import { useEffect } from 'react'
import { Shell } from './components/Shell'
import { useRuta } from './lib/ruta'
import { Actividad } from './screens/Actividad'
import { Biblioteca } from './screens/Biblioteca'
import { Compartir } from './screens/Compartir'
import { Constructor } from './screens/Constructor'
import { Hoy } from './screens/Hoy'
import { Presentar } from './screens/Presentar'
import { Registro } from './screens/Registro'
import { Stock } from './screens/Stock'
import { DemoProvider } from './state/demo'

function Rutas() {
  const ruta = useRuta()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [ruta.nombre])

  if (ruta.nombre === 'presentar') return <Presentar presentacionId={ruta.presentacionId} />

  return (
    <Shell ruta={ruta}>
      {ruta.nombre === 'hoy' && <Hoy />}
      {ruta.nombre === 'biblioteca' && <Biblioteca />}
      {ruta.nombre === 'constructor' && <Constructor baseId={ruta.baseId} />}
      {ruta.nombre === 'stock' && <Stock />}
      {ruta.nombre === 'compartir' && <Compartir />}
      {ruta.nombre === 'registro' && <Registro />}
      {ruta.nombre === 'actividad' && <Actividad />}
    </Shell>
  )
}

export default function App() {
  return (
    <DemoProvider>
      <Rutas />
    </DemoProvider>
  )
}
