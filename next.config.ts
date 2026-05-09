import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY,
    NEXT_PUBLIC_HCAPTCHA_SITE_KEY:
      process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? process.env.HCAPTCHA_SITE_KEY,
  },
};

export default nextConfig;
