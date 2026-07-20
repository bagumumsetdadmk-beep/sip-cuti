import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Inisialisasi Supabase Client
// Client ini akan digunakan untuk berinteraksi dengan database PostgreSQL di Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
