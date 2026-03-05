import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Halaman yang tidak perlu proteksi
  const publicPaths = [
    '/', 
    '/auth/login', 
    '/auth/register',
    '/auth/lupa-password',           // <-- TAMBAHKAN INI
    '/auth/reset-password'            // <-- TAMBAHKAN JUGA
  ]
  const isPublicPath = publicPaths.includes(pathname)
  
  // Update session
  const response = await updateSession(request)
  
  // Dapatkan user
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set() {}, // Tidak perlu di middleware
        remove() {},
      },
    }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Kalau halaman public, lanjutkan
  if (isPublicPath) {
    return response
  }
  
  // Kalau tidak login, redirect ke login
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // Kalau di halaman pairing, lanjutkan (khusus untuk yang belum punya nomor)
  if (pathname === '/pairing') {
    return response
  }
  
  // Untuk halaman lain (dashboard, dll), cek apakah sudah punya nomor anggota
  const { data: anggota } = await supabase
    .from('anggota')
    .select('nomor_anggota')
    .eq('email', user.email)
    .single()
  
  // Kalau belum punya nomor anggota, redirect ke pairing
  if (!anggota?.nomor_anggota) {
    return NextResponse.redirect(new URL('/pairing', request.url))
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}