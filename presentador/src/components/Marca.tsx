/*
 * Marca IO-Pharma — "conector de datos".
 * La barra y el anillo arman el monograma IO y, al mismo tiempo, leen como dos nodos
 * unidos por un vínculo. El punto celeste es el dato que viaja entre los dos.
 * Un solo trazo, sin degradados: se sostiene a 16 px y en blanco y negro.
 */
export function Marca({ size = 30, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path d="M13.5 19 L13.5 45" strokeWidth="7.5" />
        <path d="M13.5 32 L33 32" strokeWidth="5" />
        <circle cx="45.5" cy="32" r="12.5" strokeWidth="7.5" />
      </g>
      <circle cx="25" cy="32" r="4.8" fill="var(--color-accent)" />
    </svg>
  )
}

/** La misma marca dentro de su baldosa, para donde haga falta un ícono cerrado */
export function MarcaBaldosa({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#0b1220" />
      <g fill="none" stroke="#ffffff" strokeLinecap="round">
        <path d="M13.5 19 L13.5 45" strokeWidth="7.5" />
        <path d="M13.5 32 L33 32" strokeWidth="5" />
        <circle cx="45.5" cy="32" r="12.5" strokeWidth="7.5" />
      </g>
      <circle cx="25" cy="32" r="4.8" fill="#7cc4ee" />
    </svg>
  )
}
