import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const VALID_LANGS = ['uz', 'ru', 'en']
const COOKIE_NAME = 'raos_lang'

export function middleware(request: NextRequest) {
  const urlLang = request.nextUrl.searchParams.get('lang')
  const cookieLang = request.cookies.get(COOKIE_NAME)?.value
  const lang =
    urlLang && VALID_LANGS.includes(urlLang)
      ? urlLang
      : cookieLang && VALID_LANGS.includes(cookieLang)
        ? cookieLang
        : 'uz'

  const response = NextResponse.next()
  response.headers.set('x-lang', lang)
  if (urlLang && VALID_LANGS.includes(urlLang)) {
    response.cookies.set(COOKIE_NAME, lang, { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' })
  }
  return response
}

export const config = {
  matcher: ['/((?!_next|favicon|api|opengraph-image|apple-icon|icon|sitemap|robots|manifest).*)'],
}
