import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Additional middleware logic if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages and API routes
        if (req.nextUrl.pathname.startsWith('/auth/') || 
            req.nextUrl.pathname.startsWith('/api/')) {
          return true
        }
        
        // Allow access to public pages
        if (req.nextUrl.pathname === '/' ||
            req.nextUrl.pathname.startsWith('/icons/') ||
            req.nextUrl.pathname === '/manifest.json') {
          return true
        }

        // Require authentication for protected pages
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|workbox-).*)',
  ],
}