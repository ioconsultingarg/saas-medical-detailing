interface Props {
  titulo: string
  texto: string
  onClose: () => void
}

export function Popup({ titulo, texto, onClose }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          maxWidth: 420,
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>{titulo}</h3>
        <p style={{ color: '#334155' }}>{texto}</p>
        <button onClick={onClose} style={{ marginTop: 8 }}>
          Cerrar
        </button>
      </div>
    </div>
  )
}
