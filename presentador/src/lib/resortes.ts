/*
 * Física del movimiento.
 *
 * Las curvas replican las variables CSS de index.css, para que lo que anima
 * Motion y lo que anima el CSS se sientan parte de lo mismo. Los resortes son
 * la física canónica: un resorte es interrumpible —si se toca dos veces
 * seguidas no se traba— y llega con una inercia que una curva fija no tiene.
 *
 * Adaptado de las constantes de beUI (MIT). Ver CREDITS.md.
 */

export const SUAVE = [0.23, 1, 0.32, 1] as const // --ease-fluid
export const ENTRA_SALE = [0.77, 0, 0.175, 1] as const // --ease-move
export const PANEL = [0.32, 0.72, 0, 1] as const // --ease-sheet

/** Al presionar algo que se toca: botones, filas, tarjetas. */
export const RESORTE_PRESION = { type: 'spring', stiffness: 500, damping: 30, mass: 0.6 } as const

/** Cuando un contenido reemplaza a otro dentro del mismo control. */
export const RESORTE_CAMBIO = { type: 'spring', stiffness: 460, damping: 30, mass: 0.55 } as const

/** Entrada de paneles que se invocan: la paleta, las hojas, los diálogos. */
export const RESORTE_PANEL = { type: 'spring', stiffness: 420, damping: 40, mass: 0.5 } as const

/** Indicadores que se deslizan de una posición a otra (pestañas, píldoras). */
export const RESORTE_LAYOUT = { type: 'spring', stiffness: 360, damping: 32, mass: 0.6 } as const

/** Lo que sigue a un valor sin rebotar al llegar al tope. */
export const RESORTE_SEGUIR = { stiffness: 700, damping: 50, mass: 0.5 } as const
