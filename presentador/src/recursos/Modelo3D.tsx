import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RotateCcw } from 'lucide-react'
import { Segmentado } from '../components/ui'
import { productos } from '../data/productos'
import type { Recurso } from '../data/recursos'
import { prefiereMenosMovimiento } from '../lib/tiempo'

type Modelo = Extract<Recurso, { tipo: 'modelo3d' }>

interface Escena {
  grupo: THREE.Group
  /** 0 = estado inicial, 1 = con tratamiento; se interpola en cada cuadro */
  aplicar: (progreso: number, tiempo: number) => void
}

function crearArteria(acento: number): Escena {
  const grupo = new THREE.Group()
  const pared = new THREE.Mesh(
    new THREE.CylinderGeometry(1.25, 1.25, 7, 64, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xc9646b, roughness: 0.55, transparent: true, opacity: 0.42, side: THREE.DoubleSide }),
  )
  pared.rotation.z = Math.PI / 2
  grupo.add(pared)

  const bordes = [-3.5, 3.5].map((x) => {
    const anillo = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.06, 16, 64), new THREE.MeshStandardMaterial({ color: 0x9e3f48 }))
    anillo.rotation.y = Math.PI / 2
    anillo.position.x = x
    grupo.add(anillo)
    return anillo
  })
  void bordes

  const placa = new THREE.Mesh(
    new THREE.SphereGeometry(1, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xe8c46a, roughness: 0.7 }),
  )
  // domo apoyado en la pared inferior, creciendo hacia la luz del vaso
  placa.position.y = -1.22
  grupo.add(placa)

  const luz = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.035, 12, 64), new THREE.MeshBasicMaterial({ color: acento }))
  luz.rotation.y = Math.PI / 2
  grupo.add(luz)

  const particulas: THREE.Mesh[] = []
  const matSangre = new THREE.MeshStandardMaterial({ color: 0xd23a44, roughness: 0.4 })
  for (let i = 0; i < 26; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), matSangre)
    m.userData = { fase: Math.random() * 7, r: Math.random(), a: Math.random() * Math.PI * 2 }
    grupo.add(m)
    particulas.push(m)
  }

  return {
    grupo,
    aplicar(p, tiempo) {
      placa.scale.set(1.9 - p * 0.9, 0.95 - p * 0.72, 1.25 - p * 0.35)
      const abierta = 0.45 + p * 0.6
      luz.scale.setScalar(abierta)
      for (const m of particulas) {
        const { fase, r, a } = m.userData as { fase: number; r: number; a: number }
        m.position.x = ((fase + tiempo * (0.9 + p * 1.6)) % 7) - 3.5
        m.position.y = Math.sin(a) * r * abierta * 0.8 + 0.15 * (1 - p)
        m.position.z = Math.cos(a) * r * abierta * 0.8
      }
    },
  }
}

function crearBronquios(acento: number, color: number): Escena {
  const grupo = new THREE.Group()
  const matPared = new THREE.MeshStandardMaterial({ color: 0xd98a93, roughness: 0.5, transparent: true, opacity: 0.85 })
  const matMusculo = new THREE.MeshStandardMaterial({ color: acento, roughness: 0.4 })
  const ramas: { tubo: THREE.Mesh; radio: number; bandas: THREE.Mesh[] }[] = []
  const eje = new THREE.Vector3(0, 1, 0)

  function rama(inicio: THREE.Vector3, dir: THREE.Vector3, largo: number, radio: number, nivel: number) {
    const fin = inicio.clone().add(dir.clone().multiplyScalar(largo))
    const tubo = new THREE.Mesh(new THREE.CylinderGeometry(radio * 0.82, radio, largo, 20, 1), matPared)
    tubo.position.copy(inicio.clone().add(fin).multiplyScalar(0.5))
    tubo.quaternion.setFromUnitVectors(eje, dir.clone().normalize())
    grupo.add(tubo)
    const bandas: THREE.Mesh[] = []
    for (let k = 1; k <= 2; k++) {
      const banda = new THREE.Mesh(new THREE.TorusGeometry(radio * 0.95, radio * 0.12, 8, 24), matMusculo)
      banda.position.copy(inicio.clone().lerp(fin, k / 3))
      banda.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().normalize())
      grupo.add(banda)
      bandas.push(banda)
    }
    ramas.push({ tubo, radio, bandas })
    if (nivel >= 4) return
    const giro = new THREE.Vector3(0, 0, 1).applyAxisAngle(eje, nivel * 1.1)
    for (const s of [-1, 1]) {
      const nueva = dir.clone().applyAxisAngle(giro, s * 0.55).normalize()
      rama(fin, nueva, largo * 0.72, radio * 0.7, nivel + 1)
    }
  }

  rama(new THREE.Vector3(0, 2.4, 0), new THREE.Vector3(0, -1, 0), 1.9, 0.42, 0)
  const flujo = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), new THREE.MeshBasicMaterial({ color }))
  grupo.add(flujo)

  return {
    grupo,
    aplicar(p, tiempo) {
      for (const { tubo, bandas } of ramas) {
        const s = 0.62 + p * 0.38
        tubo.scale.set(s, 1, s)
        for (const b of bandas) b.scale.setScalar(0.66 + p * 0.42)
      }
      flujo.position.set(0, 2.4 - ((tiempo * (0.6 + p)) % 3.2), 0)
    },
  }
}

export default function Modelo3D({ r }: { r: Modelo }) {
  const p = productos[r.productoId]
  const contenedor = useRef<HTMLDivElement>(null)
  const objetivo = useRef(0)
  const reiniciar = useRef<() => void>(() => {})
  const [estado, setEstado] = useState<'0' | '1'>('0')

  useEffect(() => {
    objetivo.current = estado === '1' ? 1 : 0
  }, [estado])

  useEffect(() => {
    const el = contenedor.current
    if (!el) return
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)
    renderer.domElement.style.touchAction = 'none'

    const escena = new THREE.Scene()
    const camara = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camara.position.set(0, 0.4, r.modelo === 'arteria' ? 9 : 8)
    escena.add(new THREE.HemisphereLight(0xffffff, 0x30343c, 1.6))
    const dir = new THREE.DirectionalLight(0xffffff, 2.2)
    dir.position.set(4, 6, 5)
    escena.add(dir)

    const acento = new THREE.Color(p.acento).getHex()
    const modelo = r.modelo === 'arteria' ? crearArteria(acento) : crearBronquios(acento, new THREE.Color(p.color).getHex())
    escena.add(modelo.grupo)

    const rot = { x: 0.25, y: -0.5, vx: 0, vy: 0 }
    const reducido = prefiereMenosMovimiento()
    let arrastrando = false
    let ultimo = { x: 0, y: 0 }
    let progreso = objetivo.current

    reiniciar.current = () => {
      rot.x = 0.25
      rot.y = -0.5
      rot.vx = rot.vy = 0
    }

    const abajo = (e: PointerEvent) => {
      arrastrando = true
      ultimo = { x: e.clientX, y: e.clientY }
      renderer.domElement.setPointerCapture(e.pointerId)
    }
    const mover = (e: PointerEvent) => {
      if (!arrastrando) return
      rot.vy = (e.clientX - ultimo.x) * 0.008
      rot.vx = (e.clientY - ultimo.y) * 0.008
      rot.y += rot.vy
      rot.x = Math.max(-1.2, Math.min(1.2, rot.x + rot.vx))
      ultimo = { x: e.clientX, y: e.clientY }
    }
    const arriba = () => {
      arrastrando = false
    }
    renderer.domElement.addEventListener('pointerdown', abajo)
    renderer.domElement.addEventListener('pointermove', mover)
    renderer.domElement.addEventListener('pointerup', arriba)
    renderer.domElement.addEventListener('pointercancel', arriba)

    const ajustar = () => {
      const { width, height } = el.getBoundingClientRect()
      renderer.setSize(width, height, false)
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      camara.aspect = width / Math.max(1, height)
      camara.updateProjectionMatrix()
    }
    const obs = new ResizeObserver(ajustar)
    obs.observe(el)
    ajustar()

    const reloj = new THREE.Clock()
    let raf = 0
    const cuadro = () => {
      const dt = Math.min(0.05, reloj.getDelta())
      const tiempo = reloj.elapsedTime
      // resorte críticamente amortiguado hacia el estado elegido: interrumpible en cualquier momento
      progreso += (objetivo.current - progreso) * (1 - Math.exp(-dt * 6))
      if (!arrastrando) {
        rot.vy *= 0.92
        rot.vx *= 0.92
        rot.y += rot.vy + (reducido ? 0 : dt * 0.25)
        rot.x = Math.max(-1.2, Math.min(1.2, rot.x + rot.vx))
      }
      modelo.grupo.rotation.set(rot.x, rot.y, 0)
      modelo.aplicar(progreso, reducido ? 0 : tiempo)
      renderer.render(escena, camara)
      raf = requestAnimationFrame(cuadro)
    }
    raf = requestAnimationFrame(cuadro)

    return () => {
      cancelAnimationFrame(raf)
      obs.disconnect()
      renderer.domElement.removeEventListener('pointerdown', abajo)
      renderer.domElement.removeEventListener('pointermove', mover)
      renderer.domElement.removeEventListener('pointerup', arriba)
      renderer.domElement.removeEventListener('pointercancel', arriba)
      escena.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose()
          const mats = Array.isArray(o.material) ? o.material : [o.material]
          mats.forEach((m) => m.dispose())
        }
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [r.modelo, p.acento, p.color])

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[14px] leading-relaxed text-ink-2">{r.descripcion}</p>
      <div className="relative overflow-hidden rounded-2xl bg-stage">
        <div ref={contenedor} role="img" aria-label={`${r.titulo}: ${r.estados[estado === '1' ? 1 : 0]}`} className="aspect-square w-full cursor-grab active:cursor-grabbing sm:aspect-[4/3]" />
        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/10 px-3 py-1 text-[12px] text-white/80">Arrastrá para girar</span>
        <button type="button" onClick={() => reiniciar.current()} className="press absolute top-2 right-2 flex size-11 cursor-pointer items-center justify-center rounded-full text-white/80 hover:bg-white/10" aria-label="Volver a la vista inicial">
          <RotateCcw size={18} aria-hidden="true" />
        </button>
      </div>
      <Segmentado<'0' | '1'>
        etiqueta="Estado del modelo"
        valor={estado}
        onCambio={setEstado}
        opciones={[
          { valor: '0', texto: r.estados[0] },
          { valor: '1', texto: r.estados[1] },
        ]}
      />
      <p className="text-[12px] text-ink-3">Modelo ilustrativo de demostración, no a escala anatómica.</p>
    </div>
  )
}
