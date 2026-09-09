import type { Tema } from '../hooks/useTheme'

interface Props {
  tema: Tema
  alternar: () => void
}

export function ThemeToggle({ tema, alternar }: Props) {
  const esOscuro = tema === 'dark'

  return (
    <button
      onClick={alternar}
      aria-label={esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="relative flex h-9 w-16 items-center rounded-full border border-black/10 bg-white/70 px-1 backdrop-blur transition-colors hover:border-brand-400/60 dark:border-white/15 dark:bg-white/5"
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-[13px] text-white shadow-lg transition-transform duration-300 dark:bg-lime-accent dark:text-brand-900"
        style={{ transform: esOscuro ? 'translateX(28px)' : 'translateX(0)' }}
      >
        {esOscuro ? '☾' : '☀'}
      </span>
    </button>
  )
}
