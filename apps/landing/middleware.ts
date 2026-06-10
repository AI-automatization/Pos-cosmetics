import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const VALID_LANGS = ['uz', 'ru', 'en'] as const
type Lang = (typeof VALID_LANGS)[number]
const COOKIE_NAME = 'raos_lang'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Path-based lang: /ru/* veya /en/*
  const pathMatch = pathname.match(/^\/(ru|en)(\/.*)?$/)
  if (pathMatch) {
    const pathLang = pathMatch[1] as Lang
    const rest = pathMatch[2] || '/'
    const url = request.nextUrl.clone()
    url.pathname = rest
    const response = NextResponse.rewrite(url)
    response.headers.set('x-lang', pathLang)
    response.cookies.set(COOKIE_NAME, pathLang, { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' })
    return response
  }

  // Query param: ?lang=
  const urlLang = request.nextUrl.searchParams.get('lang')
  const cookieLang = request.cookies.get(COOKIE_NAME)?.value
  const lang: Lang =
    urlLang && VALID_LANGS.includes(urlLang as Lang)
      ? (urlLang as Lang)
      : cookieLang && VALID_LANGS.includes(cookieLang as Lang)
        ? (cookieLang as Lang)
        : 'uz'

  const response = NextResponse.next()
  response.headers.set('x-lang', lang)
  if (urlLang && VALID_LANGS.includes(urlLang as Lang)) {
    response.cookies.set(COOKIE_NAME, lang, { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' })
  }
  return response
}

export const config = {
  matcher: ['/((?!_next|favicon|api|opengraph-image|apple-icon|icon|sitemap|robots|manifest).*)'],
}
