interface Props {
  onEntrar: () => void
}

export function Welcome({ onEntrar }: Props) {
  return (
    <div className="welcome">
      <img className="welcome-icon" src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />
      <h1>Presentador de Medical Detailing</h1>
      <p>
        Así se ve el material de visita médica de tu laboratorio en la tablet del APM: navegación libre por
        producto, zonas interactivas con información ampliada, y funcionamiento sin conexión en el consultorio.
      </p>
      <div className="welcome-tags">
        <span className="welcome-tag">Interactivo</span>
        <span className="welcome-tag">Funciona sin conexión</span>
        <span className="welcome-tag">Métricas por visita</span>
      </div>
      <button className="btn btn-primary" onClick={onEntrar}>
        Ver demo del catálogo
      </button>
      <p className="welcome-note">
        Esta es una demo genérica con contenido de ejemplo — el catálogo, las imágenes y los textos se
        reemplazan por el material real de cada laboratorio.
      </p>
    </div>
  )
}
