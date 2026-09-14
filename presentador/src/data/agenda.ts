import type { RegistroVisita, Visita } from '../types'

export const apm = {
  nombre: 'Lucía Romero',
  zona: 'Zona Norte · CABA',
  laboratorio: 'Laboratorio Demo S.A.',
}

// Médicos y consultorios ficticios. Contactos con dominio y numeración de ejemplo.
export const visitasDelDia: Visita[] = [
  {
    id: 'v1',
    hora: '08:30',
    medico: {
      nombre: 'Dra. Laura Méndez',
      especialidad: 'Cardiología',
      telefono: '+5491155550101',
      email: 'lmendez@ejemplo.com',
    },
    consultorio: 'Consultorios Palermo',
    direccion: 'Av. Santa Fe 3200',
    barrio: 'Palermo',
    lat: -34.5889,
    lng: -58.4103,
    productosInteres: ['cardio'],
    nota: 'Pidió datos de seguridad a largo plazo.',
  },
  {
    id: 'v2',
    hora: '09:30',
    medico: {
      nombre: 'Dr. Martín Ibarra',
      especialidad: 'Neumonología',
      telefono: '+5491155550102',
      email: 'mibarra@ejemplo.com',
    },
    consultorio: 'Clínica Recoleta',
    direccion: 'Av. Pueyrredón 1640',
    barrio: 'Recoleta',
    lat: -34.593,
    lng: -58.396,
    productosInteres: ['respira'],
    nota: 'Atiende muchos pacientes con EPOC.',
  },
  {
    id: 'v3',
    hora: '10:30',
    medico: {
      nombre: 'Dra. Sofía Guerrero',
      especialidad: 'Clínica médica',
      telefono: '+5491155550103',
      email: 'sguerrero@ejemplo.com',
    },
    consultorio: 'Centro Médico Barrio Norte',
    direccion: 'Charcas 2900',
    barrio: 'Barrio Norte',
    lat: -34.5925,
    lng: -58.4037,
    productosInteres: ['cardio', 'respira'],
    nota: 'Prefiere visitas cortas, antes de las 11.',
  },
  {
    id: 'v4',
    hora: '11:45',
    medico: {
      nombre: 'Dr. Pablo Ferreyra',
      especialidad: 'Cardiología',
      telefono: '+5491155550104',
      email: 'pferreyra@ejemplo.com',
    },
    consultorio: 'Instituto Cardiovascular Belgrano',
    direccion: 'Av. Cabildo 1800',
    barrio: 'Belgrano',
    lat: -34.5655,
    lng: -58.452,
    productosInteres: ['cardio'],
    nota: 'Primera visita. Le interesa la eficacia en pacientes de alto riesgo.',
  },
  {
    id: 'v5',
    hora: '13:30',
    medico: {
      nombre: 'Dra. Valeria Ríos',
      especialidad: 'Neumonología',
      telefono: '+5491155550105',
      email: 'vrios@ejemplo.com',
    },
    consultorio: 'Consultorio Colegiales',
    direccion: 'Av. Federico Lacroze 2300',
    barrio: 'Colegiales',
    lat: -34.5745,
    lng: -58.446,
    productosInteres: ['respira'],
    nota: 'Consultó por técnica inhalatoria en adultos mayores.',
  },
  {
    id: 'v6',
    hora: '14:30',
    medico: {
      nombre: 'Dr. Esteban Navarro',
      especialidad: 'Medicina interna',
      telefono: '+5491155550106',
      email: 'enavarro@ejemplo.com',
    },
    consultorio: 'Policonsultorio Núñez',
    direccion: 'Av. del Libertador 7200',
    barrio: 'Núñez',
    lat: -34.548,
    lng: -58.463,
    productosInteres: ['cardio', 'respira'],
    nota: 'Solicitó muestras en la visita anterior.',
  },
  {
    id: 'v7',
    hora: '16:00',
    medico: {
      nombre: 'Dra. Carolina Paz',
      especialidad: 'Cardiología',
      telefono: '+5491155550107',
      email: 'cpaz@ejemplo.com',
    },
    consultorio: 'Centro Cardiológico Urquiza',
    direccion: 'Av. Triunvirato 4400',
    barrio: 'Villa Urquiza',
    lat: -34.574,
    lng: -58.487,
    productosInteres: ['cardio'],
    nota: 'Participa en ateneo del hospital los jueves.',
  },
  {
    id: 'v8',
    hora: '17:15',
    medico: {
      nombre: 'Dr. Julián Acosta',
      especialidad: 'Alergia e inmunología',
      telefono: '+5491155550108',
      email: 'jacosta@ejemplo.com',
    },
    consultorio: 'Consultorio Saavedra',
    direccion: 'Av. Ricardo Balbín 4100',
    barrio: 'Saavedra',
    lat: -34.553,
    lng: -58.486,
    productosInteres: ['respira'],
    nota: 'Paciente pediátrico y adulto; pidió folletos.',
  },
]

function horaDeHoy(hhmm: string, minutosExtra = 0) {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m + minutosExtra, 0, 0)
  return d.getTime()
}

/** Estado inicial: la mañana ya transcurrió, para que el tablero muestre un día en marcha */
export function registrosIniciales(): Record<string, RegistroVisita> {
  return {
    v1: {
      estado: 'completada',
      checkIn: horaDeHoy('08:30', -3),
      checkOut: horaDeHoy('08:30', 19),
      distanciaCheckIn: 24,
      calificacion: 4,
      etiquetas: ['Pidió estudios'],
      muestras: 6,
      productos: ['cardio'],
    },
    v2: {
      estado: 'completada',
      checkIn: horaDeHoy('09:30', 1),
      checkOut: horaDeHoy('09:30', 22),
      distanciaCheckIn: 41,
      calificacion: 5,
      etiquetas: ['Interesado en muestras'],
      muestras: 10,
      productos: ['respira'],
    },
    v3: {
      estado: 'completada',
      checkIn: horaDeHoy('10:30', 3),
      checkOut: horaDeHoy('10:30', 17),
      distanciaCheckIn: 18,
      calificacion: 3,
      etiquetas: ['Volver en 15 días'],
      muestras: 0,
      productos: ['cardio', 'respira'],
    },
  }
}
