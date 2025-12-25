import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(_req: NextRequest) {
  // Simple middleware - the client-side auth context will handle redirects
  // This is just a placeholder for future auth middleware if needed
  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/']
}