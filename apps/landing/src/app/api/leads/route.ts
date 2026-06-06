import { NextRequest, NextResponse } from 'next/server'

function sanitize(s: string): string {
  return s.replace(/[\\`*_{}[\]()#+\-.!|]/g, '').trim()
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
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
