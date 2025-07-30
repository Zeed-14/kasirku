import { createClient } from '@supabase/supabase-js'

// Ambil URL dan Anon Key dari dashboard Supabase Anda
const supabaseUrl = 'https://ogjrgbvuwyuknhzoajfc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nanJnYnZ1d3l1a25oem9hamZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTQ5ODUsImV4cCI6MjA2OTI3MDk4NX0.UwImCi4NyvBm1IBHhKt51asdVEEZMslzjdmDdGzHzf4'

// Buat dan ekspor klien Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)