import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// En el MVP local sin credenciales configuradas, el cliente queda sin uso real:
// las métricas se acumulan en IndexedDB y el sync a Supabase se omite hasta tener proyecto.
export const supabase = url && anonKey ? createClient(url, anonKey) : null
