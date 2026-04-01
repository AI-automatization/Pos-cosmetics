// T-125: Auth middleware — getUserByChatId
// T-126: Tenant izolyatsiya
// T-127: Role-based access

import { Bot, Context } from 'grammy';
import { config } from '../config';
import {
  getUserByChatId,
  isBotAllowed,
  verifyCredentialsAndSendOtp,
  verifyOtpAndLogin,
  logoutUser,
} from '../services/auth.service';
import { esc } from '../services/formatter';
import { logger } from '../logger';

// ─── Login conversation state ─────────────────────────────────
//
// Flow:
//   /login
//     → awaiting_email   : email kiritiladi
//     → awaiting_password: parol kiritiladi → credentials tekshiriladi → OTP emailga
//     → awaiting_otp     : 6-raqamli kod kiritiladi → login

interface LoginSession {
  step: 'awaiting_email' | 'awaiting_password' | 'awaiting_otp';
  email?: string;
}

export const loginSessions = new Map<string, LoginSession>();

// ─── Shared helpers (re-exported for other handlers) ──────────

export function commandList(): string {
  return (
    '📊 /report — Bugungi savdo hisoboti\n' +
    '📈 /sales — Joriy kun statistika\n' +
    '📦 /stock \\<barcode\\> — Stok tekshirish\n' +
    '💳 /debt \\<telefon\\> — Mijoz qarzi\n' +
    '🔄 /shift — Aktiv smenalar\n' +
    '⚠️ /lowstock — Kam qolgan mahsulotlar\n' +
    '🗓 /expiring — Muddati yaqin mahsulotlar\n' +
    '🔔 /settings — Sozlamalar\n' +
    '🚪 /logout — Chiqish'
  );
}

export async function getAuthUser(ctx: Context) {
  const chatId = String(ctx.chat?.id);
  const user = await getUserByChatId(chatId);

  if (!user) {
    await ctx.reply(
      '❌ Siz tizimga kirmagansiz\\.\n\n' +
      'Kirish uchun: /login',
      { parse_mode: 'MarkdownV2' },
    );
    return null;
  }

  if (!isBotAllowed(user.role)) {
    await ctx.reply(
      '❌ Sizning rolingizda bot huquqi yo\'q\\.\n' +
      'CASHIER roli bot ishlatishi mumkin emas\\.',
      { parse_mode: 'MarkdownV2' },
    );
    return null;
  }

  return user;
}

// ─── Yordamchi: email ni yashirish (masalan: u***@gmail.com) ──

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

// ─── Deep link token orqali Telegram hisobini bog'lash ─────────

async function handleLinkToken(ctx: Context, token: string): Promise<void> {
  const chatId = String(ctx.chat?.id);
  if (!chatId) {
    await ctx.reply('Xatolik: chat ID topilmadi\\.');
    return;
  }

  try {
    const res = await fetch(`${config.apiUrl}/notifications/telegram/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, chatId }),
    });

    const data = (await res.json()) as { success: boolean; type?: string };

    if (data.success) {
      const who = data.type === 'user' ? 'Hisobingiz' : 'Profilingiz';
      await ctx.reply(
        `✅ ${who} RAOS ga muvaffaqiyatli bog'landi\\!\n\n` +
        `Endi siz Telegram orqali bildirishnomalar olasiz\\.`,
      );
    } else {
      await ctx.reply(`❌ Token yaroqsiz yoki muddati o'tgan\\.\n\nKirish uchun: /login`);
    }
  } catch {
    await ctx.reply('❌ Server bilan bog\'lanishda xatolik yuz berdi\\.');
  }
}

// ─── Register login-related handlers ─────────────────────────

export function registerLoginHandlers(bot: Bot) {

  // ─── /start ─────────────────────────────────────────────────

  bot.command('start', async (ctx) => {
    const payload = ctx.match?.trim();

    if (payload && payload.length > 0) {
      await handleLinkToken(ctx, payload);
      return;
    }

    const chatId = String(ctx.chat?.id);
    const alreadyLoggedIn = await getUserByChatId(chatId);

    if (alreadyLoggedIn) {
      await ctx.reply(
        `👋 Xush kelibsiz, *${esc(alreadyLoggedIn.firstName)}*\\!\n\n` +
        '*Buyruqlar:*\n' +
        commandList(),
        { parse_mode: 'MarkdownV2' },
      );
    } else {
      await ctx.reply(
        '👋 Salom\\! Men *RAOS* savdo tizimi botiman\\.\n\n' +
        'Botdan foydalanish uchun tizimga kiring:\n\n' +
        '👉 /login — Email va parol bilan kirish',
        { parse_mode: 'MarkdownV2' },
      );
    }
  });

  // ─── /login ─────────────────────────────────────────────────

  bot.command('login', async (ctx) => {
    const chatId = String(ctx.chat?.id);

    const alreadyLoggedIn = await getUserByChatId(chatId);
    if (alreadyLoggedIn) {
      await ctx.reply(
        `✅ Siz allaqachon tizimdasiz \\(*${esc(alreadyLoggedIn.firstName)}*\\)\\.\n` +
        'Chiqish uchun: /logout',
        { parse_mode: 'MarkdownV2' },
      );
      return;
    }

    loginSessions.set(chatId, { step: 'awaiting_email' });
    await ctx.reply(
      '🔐 *Tizimga kirish*\n\n' +
      '*1\\.* Email manzilingizni kiriting:',
      { parse_mode: 'MarkdownV2' },
    );
  });

  // ─── /logout ────────────────────────────────────────────────

  bot.command('logout', async (ctx) => {
    const chatId = String(ctx.chat?.id);
    loginSessions.delete(chatId);

    const success = await logoutUser(chatId);
    if (success) {
      await ctx.reply(
        '✅ Tizimdan muvaffaqiyatli chiqdingiz\\.\n\nQayta kirish uchun: /login',
        { parse_mode: 'MarkdownV2' },
      );
    } else {
      await ctx.reply('ℹ️ Siz tizimda emasedingiz\\.', { parse_mode: 'MarkdownV2' });
    }
  });

  // ─── /cancel ────────────────────────────────────────────────

  bot.command('cancel', async (ctx) => {
    const chatId = String(ctx.chat?.id);
    if (loginSessions.has(chatId)) {
      loginSessions.delete(chatId);
      await ctx.reply('❌ Kirish bekor qilindi\\.', { parse_mode: 'MarkdownV2' });
    } else {
      await ctx.reply('Hech narsa bekor qilish kerak emas\\.', { parse_mode: 'MarkdownV2' });
    }
  });

  // ─── /help ──────────────────────────────────────────────────

  bot.command('help', async (ctx) => {
    await ctx.reply(
      '*RAOS Bot — Buyruqlar:*\n\n' +
      '`/login` — Email, parol va email kodi bilan kirish\n' +
      '`/logout` — Tizimdan chiqish\n' +
      '`/cancel` — Kirish jarayonini bekor qilish\n\n' +
      '`/report` — bugungi savdo, top mahsulotlar, to\'lov usullari\n' +
      '`/sales` — joriy kun savdo statistikasi\n' +
      '`/stock 8901234567890` — barcode bo\'yicha stok\n' +
      '`/debt +998901234567` — telefon bo\'yicha qarz\n' +
      '`/shift` — barcha aktiv smenalar holati\n' +
      '`/lowstock` — min level dan past mahsulotlar\n' +
      '`/expiring` — 30 kun ichida muddati tugaydigan mahsulotlar\n' +
      '`/settings` — bildirishnoma sozlamalari\n\n' +
      '_Alertlar avtomatik keladi: kam qoldiq, muddati yaqin, katta qaytarish_',
      { parse_mode: 'MarkdownV2' },
    );
  });

  // ─── Matn xabarlari — 3-bosqichli login conversation ─────────

  bot.on('message:text', async (ctx) => {
    const chatId = String(ctx.chat?.id);
    const text = ctx.message.text.trim();
    const session = loginSessions.get(chatId);

    if (!session) {
      await ctx.reply('Buyruqlarni ko\'rish uchun /help ni bosing');
      return;
    }

    // ── Bosqich 1: Email ───────────────────────────────────────
    if (session.step === 'awaiting_email') {
      if (!text.includes('@') || !text.includes('.')) {
        await ctx.reply(
          '❌ Noto\'g\'ri email format\\.\n\nQayta kiriting \\(masalan: user@example\\.com\\):',
          { parse_mode: 'MarkdownV2' },
        );
        return;
      }
      loginSessions.set(chatId, { step: 'awaiting_password', email: text });
      await ctx.reply(
        '*2\\.* Parolingizni kiriting:\n\n' +
        '_\\(Xavfsizlik uchun parol xabari avtomatik o\'chiriladi\\)_',
        { parse_mode: 'MarkdownV2' },
      );
      return;
    }

    // ── Bosqich 2: Parol ───────────────────────────────────────
    if (session.step === 'awaiting_password') {
      try {
        await ctx.api.deleteMessage(ctx.chat.id, ctx.message.message_id);
      } catch {
        // O'chira olmasa davom etish
      }

      loginSessions.set(chatId, { step: 'awaiting_otp', email: session.email });
      await ctx.reply('⏳ Tekshirilmoqda\\.\\.\\.', { parse_mode: 'MarkdownV2' });

      try {
        const result = await verifyCredentialsAndSendOtp(session.email!, text, chatId);

        switch (result) {
          case 'not_found':
            loginSessions.delete(chatId);
            await ctx.reply(
              '❌ Bu email bilan foydalanuvchi topilmadi\\.\n\nQayta urinish: /login',
              { parse_mode: 'MarkdownV2' },
            );
            break;

          case 'wrong_password':
            loginSessions.delete(chatId);
            await ctx.reply('❌ Noto\'g\'ri parol\\.\n\nQayta urinish: /login', { parse_mode: 'MarkdownV2' });
            break;

          case 'no_role':
            loginSessions.delete(chatId);
            await ctx.reply('❌ Sizning rolingizda bot huquqi yo\'q\\.', { parse_mode: 'MarkdownV2' });
            break;

          case 'email_error':
            loginSessions.delete(chatId);
            await ctx.reply(
              '❌ Email yuborishda xatolik yuz berdi\\.\n' +
              'Server administratoriga murojaat qiling\\.\n\nQayta urinish: /login',
              { parse_mode: 'MarkdownV2' },
            );
            break;

          case 'email_sent': {
            const maskedEmail = maskEmail(session.email!);
            await ctx.reply(
              '✅ *Email yuborildi\\!*\n\n' +
              `📧 *${esc(maskedEmail)}* manzilingizga 6 raqamli tasdiqlash kodi yuborildi\\.\n\n` +
              '*3\\.* Kodni kiriting:\n\n' +
              '_Kod 5 daqiqa davomida amal qiladi\\._\n' +
              '_Bekor qilish: /cancel_',
              { parse_mode: 'MarkdownV2' },
            );
            break;
          }
        }
      } catch (err) {
        logger.error('[Bot login step2]', { error: (err as Error).message });
        loginSessions.delete(chatId);
        await ctx.reply('❌ Server xatosi\\. Qayta urinish: /login', { parse_mode: 'MarkdownV2' });
      }
      return;
    }

    // ── Bosqich 3: OTP kodi ────────────────────────────────────
    if (session.step === 'awaiting_otp') {
      if (!/^\d{6}$/.test(text)) {
        await ctx.reply(
          '❌ Kod 6 ta raqamdan iborat bo\'lishi kerak\\.\n\nQayta kiriting:',
          { parse_mode: 'MarkdownV2' },
        );
        return;
      }

      try {
        const result = await verifyOtpAndLogin(text, chatId);

        if (result === 'expired') {
          loginSessions.delete(chatId);
          await ctx.reply('❌ Kod muddati o\'tgan \\(5 daqiqa\\)\\.\n\nQayta kirish: /login', { parse_mode: 'MarkdownV2' });
          return;
        }
        if (result === 'too_many_attempts') {
          loginSessions.delete(chatId);
          await ctx.reply('❌ Juda ko\'p noto\'g\'ri urinish\\. Yangi kod olish uchun: /login', { parse_mode: 'MarkdownV2' });
          return;
        }
        if (result === 'invalid_code') {
          await ctx.reply('❌ Noto\'g\'ri kod\\. Qayta kiriting \\(yoki /cancel\\):', { parse_mode: 'MarkdownV2' });
          return;
        }

        // Muvaffaqiyatli kirish!
        loginSessions.delete(chatId);
        await ctx.reply(
          `🎉 *Xush kelibsiz, ${esc(result.firstName)}\\!*\n\n` +
          `👤 Rol: *${esc(result.role)}*\n\n` +
          '*Buyruqlar:*\n' +
          commandList(),
          { parse_mode: 'MarkdownV2' },
        );
      } catch (err) {
        logger.error('[Bot login step3]', { error: (err as Error).message });
        loginSessions.delete(chatId);
        await ctx.reply('❌ Server xatosi\\. Qayta urinish: /login', { parse_mode: 'MarkdownV2' });
      }
    }
  });
}
