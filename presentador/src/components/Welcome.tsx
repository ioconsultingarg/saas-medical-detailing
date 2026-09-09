interface Props {
  onEntrar: () => void
}

export function Welcome({ onEntrar }: Props) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 16px' }}>
      <img
        src={`${import.meta.env.BASE_URL}icon.svg`}
        alt=""
        width={72}
        height={72}
        style={{ marginBottom: 16 }}
      />
      <h1 style={{ fontSize: 24, margin: '0 0 8px', color: '#0f172a' }}>Presentador de Medical Detailing</h1>
      <p style={{ color: '#475569', maxWidth: 520, margin: '0 auto 24px' }}>
        Así se ve el material de visita médica de tu laboratorio en la tablet del APM: navegación libre por
        producto, zonas interactivas con información ampliada, y funcionamiento sin conexión en el consultorio.
      </p>
      <p style={{ color: '#94a3b8', fontSize: 13, maxWidth: 480, margin: '0 auto 24px' }}>
        Esta es una demo genérica con contenido de ejemplo — el catálogo, las imágenes y los textos se
        reemplazan por el material real de cada laboratorio.
      </p>
      <button
        onClick={onEntrar}
        style={{
          padding: '12px 24px',
          borderRadius: 8,
          border: 'none',
          background: '#1e40af',
          color: '#ffffff',
          fontSize: 15,
          cursor: 'pointer',
        }}
      >
        Ver demo del catálogo
      </button>
    </div>
  )
}
