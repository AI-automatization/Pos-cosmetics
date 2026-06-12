import { NextRequest, NextResponse } from 'next/server'

function sanitize(s: string): string {
  return s.replace(/[\\`*_{}[\]()#+\-.!|]/g, '').trim()
}

// Простой in-memory rate-limit: 5 заявок / 10 мин с одного IP.
// Хватает для лендинга на одном инстансе; при горизонтальном масштабировании заменить на Redis.
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 10 * 60 * 1000
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 10_000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k)
    }
  }
  return false
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Honeypot: скрытое поле, люди его не видят. Боту отвечаем «успехом», лид не отправляем.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true })
  }

  const shopType = sanitize(String(body.shopType ?? '')).slice(0, 50)
  const shopName = sanitize(String(body.shopName ?? '')).slice(0, 100)
  const branches = Number(body.branches ?? 1)
  const fullName = sanitize(String(body.fullName ?? '')).slice(0, 80)
  const phone    = String(body.phone ?? '').trim().slice(0, 20)
  const telegram = sanitize(String(body.telegram ?? '')).slice(0, 40)

  if (!shopName || !fullName || !phone) {
    return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
  }

  if (!/^\+998\d{9}$/.test(phone.replace(/\s/g, ''))) {
    return NextResponse.json({ error: 'Invalid phone format' }, { status: 400 })
  }

  const token  = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_LEAD_CHAT_ID

  if (!token || !chatId) {
    console.error('[leads] TELEGRAM_BOT_TOKEN or TELEGRAM_LEAD_CHAT_ID not set')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const text = [
    '🔔 Yangi lid — RAOS Landing',
    '',
    `Do'kon turi: ${shopType || '—'}`,
    `Do'kon nomi: ${shopName}`,
    `Filiallar:   ${branches}`,
    `Ism:         ${fullName}`,
    `Telefon:     ${phone}`,
    `Telegram:    ${telegram || '—'}`,
  ].join('\n')

  const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })

  if (!tgRes.ok) {
    const detail = await tgRes.text().catch(() => '')
    console.error('[leads] Telegram delivery failed:', tgRes.status, detail)
    return NextResponse.json({ error: 'Delivery failed' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
