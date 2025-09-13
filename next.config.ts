import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Configuración para manejar rutas API dinámicas
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  // Configurar output para evitar problemas con rutas dinámicas
  output: 'standalone',
};

export default nextConfig;
