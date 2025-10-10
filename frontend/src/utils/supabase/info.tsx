import { createClient } from '@supabase/supabase-js';

// Obtener las variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar que las variables de entorno estén definidas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be defined in .env.local');
}

// Crear y exportar el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
