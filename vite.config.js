import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/

export default defineConfig({

plugins: [react()],

// Tambahkan baris ini!

// Sesuaikan '/kasirku/' dengan nama repository GitHub Anda.

base: '/kasirku/',

})