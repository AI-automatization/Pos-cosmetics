#!/usr/bin/env node

/**
 * Telegram → VS Code Claude Terminal Bot
 *
 * Telegramdan yuborilgan xabar clipboard orqali
 * VS Code Claude terminaliga paste qilinadi.
 *
 * Ishga tushirish:
 *   node -r dotenv/config scripts/tg-terminal.js dotenv_config_path=.env.tg
 *
 * Talab: System Settings → Privacy & Security → Accessibility → Terminal ruxsati
 */

const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');

const BOT_TOKEN = process.env.BOT_TOKEN;
const ALLOWED_USER_ID = 5048182589;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN yo\'q! .env.tg faylini tekshiring.');
  process.exit(1);
}

// ─── VS Code Claude terminaliga clipboard orqali yozish ───────────────────

async function typeToClaudeTerminal(text) {
  const tmpScript = `${os.tmpdir()}/tg-claude.applescript`;

  // 1. Matnni clipboardga nusxa olish
  await new Promise((resolve, reject) => {
    const p = exec('pbcopy', (err) => err ? reject(err) : resolve());
    p.stdin.end(text, 'utf8');
  });

  // 2. VS Code ga focus, terminal oching, paste, Enter
  const appleScript = `
tell application "Visual Studio Code"
  activate
end tell
delay 0.5
tell application "System Events"
  keystroke "\`" using {control down}
  delay 0.4
  keystroke "v" using {command down}
  delay 0.2
  key code 36
end tell
`;

  fs.writeFileSync(tmpScript, appleScript, 'utf8');

  return new Promise((resolve) => {
    exec(`osascript '${tmpScript}'`, { timeout: 15000 }, (err, stdout, stderr) => {
      fs.unlink(tmpScript, () => {});
      if (err) {
        const msg = (stderr || err.message || '').trim();
        if (msg.includes('not allowed assistive') || msg.includes('accessibility')) {
          resolve('❌ Accessibility ruxsati kerak!\n\nSystem Settings → Privacy & Security → Accessibility\nTerminal ilovasini qo\'shing va qayta urining.');
        } else {
          resolve(`❌ osascript xato: ${msg}`);
        }
      } else {
        resolve('✅ Yuborildi');
      }
    });
  });
}

// ─── Telegram API ─────────────────────────────────────────────────────────────

let offset = 0;

async function tg(method, body = {}) {
  const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return r.json();
}

async function getUpdates() {
  const r = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=30`
  );
  return (await r.json()).result || [];
}

async function send(chatId, text) {
  const chunks = [];
  for (let i = 0; i < text.length; i += 4000) chunks.push(text.slice(i, i + 4000));
  for (const chunk of chunks) {
    await tg('sendMessage', {
      chat_id: chatId,
      text: `<pre>${chunk}</pre>`,
      parse_mode: 'HTML',
    });
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const me = await tg('getMe', {});
  console.log(`✅ @${me.result?.username} ishga tushdi`);
  console.log(`📱 Faqat ID ${ALLOWED_USER_ID} qabul qilinadi`);
  console.log('─'.repeat(50));

  while (true) {
    try {
      const updates = await getUpdates();

      for (const upd of updates) {
        offset = upd.update_id + 1;
        const msg = upd.message;
        if (!msg?.text) continue;

        const uid = msg.from.id;
        const cid = msg.chat.id;
        const txt = msg.text.trim();

        if (uid !== ALLOWED_USER_ID) {
          await tg('sendMessage', { chat_id: cid, text: '⛔ Ruxsat yo\'q.' });
          continue;
        }

        if (txt === '/start' || txt === '/help') {
          await tg('sendMessage', {
            chat_id: cid,
            text: '🤖 <b>Claude Terminal Bot</b>\n\nYuborganingiz VS Code Claude terminaliga paste qilinadi.\n\nMisol:\n<code>Loginni tuzat</code>\n<code>git status ko\'rsatchi</code>\n<code>T-045 taskni bajar</code>',
            parse_mode: 'HTML',
          });
          continue;
        }

        console.log(`▶ Claude ← ${txt.slice(0, 80)}`);
        const result = await typeToClaudeTerminal(txt);
        await send(cid, result);
      }
    } catch (err) {
      console.error('⚠️', err.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
