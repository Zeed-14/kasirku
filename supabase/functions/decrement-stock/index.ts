// File: supabase/functions/decrement-stock/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Header CORS untuk mengizinkan aplikasi kita memanggil fungsi ini
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Fungsi utama yang akan dijalankan
Deno.serve(async (req) => {
  // Handle preflight requests untuk CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Ambil data 'items' dari body request
    const { items } = await req.json()

    // Buat Supabase client dengan service_role key agar punya izin penuh
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Panggil fungsi RPC di database untuk mengurangi stok secara aman
    const { error } = await supabaseAdmin.rpc('decrement_stock', { items_in_cart: items })

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ message: 'Stok berhasil diperbarui' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
