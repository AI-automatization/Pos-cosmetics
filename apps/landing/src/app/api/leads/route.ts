import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { shopType, shopName, branches, fullName, phone, telegram } = body

  if (!shopName || !fullName || !phone) {
    return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_LEAD_CHAT_ID

  if (token && chatId) {
    const text = [
      '🔔 *Yangi lid — RAOS Landing*',
      '',
      `📦 Do'kon turi: ${shopType || '—'}`,
      `🏪 Do'kon nomi: ${shopName}`,
      `🏢 Filiallar: ${branches}`,
      `👤 Ism: ${fullName}`,
      `📞 Telefon: ${phone}`,
      `💬 Telegram: ${telegram || '—'}`,
    ].join('\n')

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    })
  }

  return NextResponse.json({ ok: true })
}
