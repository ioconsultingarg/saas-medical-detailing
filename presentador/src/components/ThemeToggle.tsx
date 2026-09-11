import { Moon, Sun } from 'lucide-react'
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
      role="switch"
      aria-checked={esOscuro}
      className="relative flex h-11 w-[68px] shrink-0 cursor-pointer items-center rounded-full border border-black/10 bg-white/70 px-1 backdrop-blur transition-all duration-200 hover:border-brand-400/60 active:scale-[0.96] dark:border-white/15 dark:bg-white/5"
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-transform duration-300 dark:bg-lime-accent dark:text-brand-900"
        style={{ transform: esOscuro ? 'translateX(26px)' : 'translateX(0)' }}
      >
        {esOscuro ? <Moon size={16} /> : <Sun size={16} />}
      </span>
    </button>
  )
}
