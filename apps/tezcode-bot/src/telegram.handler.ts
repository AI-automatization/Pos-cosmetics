import { Bot, Context, InlineKeyboard } from 'grammy';
import {
  askClaude, getChatState, setChatModel, setChatCwd,
  resetChat, clearSession, compactHistory, toggleObsidian,
  getQueueSize, getActiveCount, MODELS,
} from './claude.service';
import { mdToHtml } from './formatter';
import { chunkMessage, shortPath } from './utils';
import { config } from './config';

// ─── Access control ─────────────────────────────────────────

const allowedUsers = new Set<string>();

function isGroup(ctx: Context): boolean {
  const type = ctx.chat?.type;
  return type === 'group' || type === 'supergroup';
}

function isAllowed(ctx: Context): boolean {
  const userId = ctx.from?.id?.toString();
  if (!userId) return false;
  if (config.ownerIds.includes(userId)) return true;
  const username = ctx.from?.username;
  if (username && username === config.ownerUsername) return true;
  return allowedUsers.has(userId);
}

function isOwner(ctx: Context): boolean {
  const userId = ctx.from?.id?.toString();
  if (userId && config.ownerIds.includes(userId)) return true;
  return ctx.from?.username === config.ownerUsername;
}

function isMentioned(ctx: Context, botUsername: string): boolean {
  const entities = ctx.message?.entities ?? [];
  const text = ctx.message?.text ?? '';
  for (const e of entities) {
    if (e.type === 'mention') {
      const mention = text.slice(e.offset, e.offset + e.length);
      if (mention.toLowerCase() === `@${botUsername.toLowerCase()}`) return true;
    }
  }
  // Also check reply to bot
  if (ctx.message?.reply_to_message?.from?.is_bot) return true;
  return false;
}

// ─── Shutdown callback ──────────────────────────────────────

let shutdownFn: (() => void) | null = null;

export function setShutdownFn(fn: () => void): void {
  shutdownFn = fn;
}

// ─── Register ───────────────────────────────────────────────

export function registerHandlers(bot: Bot): void {
  bot.command('start', handleStart);
  bot.command('help', handleHelp);
  bot.command('stop', handleStop);
  bot.command('model', handleModel);
  bot.command('compact', handleCompact);
  bot.command('clear', handleClear);
  bot.command('new', handleNew);
  bot.command('status', handleStatus);
  bot.command('dir', handleDir);
  bot.command('obsidian', handleObsidian);
  bot.command('allow', handleAllow);

  bot.callbackQuery(/^model:/, handleModelCallback);
  bot.callbackQuery('new_confirm', handleNewConfirm);
  bot.callbackQuery('stop_confirm', handleStopConfirm);
  bot.callbackQuery('dismiss', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.deleteMessage().catch(() => {});
  });

  bot.on('message:text', handleText);
  bot.on('message:photo', handlePhoto);
  bot.on('message:document', handleDocument);
}

// ─── /start ─────────────────────────────────────────────────

async function handleStart(ctx: Context): Promise<void> {
  if (!isAllowed(ctx)) return;
  const s = getChatState(String(ctx.chat?.id));
  await ctx.reply(
    `🤖 <b>TezCode AI Assistant — Ready</b>\n\n` +
    `🧠 Model: <code>${s.model}</code>\n` +
    `📂 Dir: <code>${shortPath(s.cwd)}</code>\n` +
    `📨 Requests: ${s.requestCount}\n` +
    `💬 History: ${s.history.length / 2} messages\n\n` +
    `I have full access to your laptop. Ask me anything or tell me where to go.\n` +
    `/help for commands.`,
    { parse_mode: 'HTML' },
  );
}

// ─── /stop ─────────────────────────────────────────────────

async function handleStop(ctx: Context): Promise<void> {
  if (!isOwner(ctx)) { await ctx.reply('🔒 Owner only.'); return; }
  const kb = new InlineKeyboard().text('✅ Stop bot', 'stop_confirm').text('❌ Cancel', 'dismiss');
  await ctx.reply('🛑 Stop the bot? Process will exit.', { reply_markup: kb });
}

async function handleStopConfirm(ctx: Context): Promise<void> {
  if (!isOwner(ctx)) return;
  await ctx.answerCallbackQuery({ text: 'Stopping...' });
  await ctx.editMessageText('🛑 Bot stopped. Goodbye!').catch(() => {});

  // Give time for the message to send, then exit
  setTimeout(() => {
    if (shutdownFn) shutdownFn();
    process.exit(0);
  }, 500);
}

// ─── /help ──────────────────────────────────────────────────

async function handleHelp(ctx: Context): Promise<void> {
  if (!isAllowed(ctx)) return;
  await ctx.reply(
    '🤖 <b>TezCode AI Assistant — Help</b>\n\n' +
    '<b>What I can do:</b>\n' +
    '• Manage files & projects on your laptop\n' +
    '• Run commands, debug, code review\n' +
    '• Navigate directories (/dir path)\n' +
    '• 📷 Photo / 📄 File → analyze\n\n' +
    '<b>Session:</b>\n' +
    '• /compact — compress context (save tokens)\n' +
    '• /clear — new session (forget all)\n' +
    '• /new — full reset (model + session)\n\n' +
    '<b>Settings:</b>\n' +
    '• /model [sonnet|opus|haiku]\n' +
    '• /dir [path] — change working directory\n' +
    '• /obsidian — toggle vault\n' +
    '• /status — stats\n' +
    '• /allow [user_id] — give access',
    { parse_mode: 'HTML' },
  );
}

// ─── /compact — ask Claude to summarize, then continue ──────

async function handleCompact(ctx: Context): Promise<void> {
  if (!isAllowed(ctx)) return;
  const chatId = String(ctx.chat?.id);
  const s = getChatState(chatId);
  const before = s.history.length;
  const msg = await ctx.reply('🗜 Compacting...');

  try {
    await compactHistory(chatId);
    await ctx.api.deleteMessage(ctx.chat!.id, msg.message_id).catch(() => {});
    await ctx.reply(`✅ <b>Compacted!</b> ${before} → ${s.history.length} entries.`, { parse_mode: 'HTML' });
  } catch (err) {
    await ctx.api.deleteMessage(ctx.chat!.id, msg.message_id).catch(() => {});
    await ctx.reply(`❌ ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ─── /model ─────────────────────────────────────────────────

async function handleModel(ctx: Context): Promise<void> {
  if (!isAllowed(ctx)) return;
  const chatId = String(ctx.chat?.id);
  const modelArg = (ctx.message?.text ?? '').split(/\s+/)[1]?.toLowerCase();

  if (modelArg) {
    if (setChatModel(chatId, modelArg)) {
      await ctx.reply(`✅ Model → <code>${modelArg}</code>`, { parse_mode: 'HTML' });
    } else {
      await ctx.reply('❌ Use: sonnet, opus, haiku');
    }
    return;
  }

  const s = getChatState(chatId);
  const kb = new InlineKeyboard();
  for (const m of MODELS) kb.text(m === s.model ? `✅ ${m}` : m, `model:${m}`);
  await ctx.reply('🤖 Select model:', { reply_markup: kb });
}

async function handleModelCallback(ctx: Context): Promise<void> {
  if (!isAllowed(ctx)) return;
  const chatId = String(ctx.chat?.id);
  const model = (ctx.callbackQuery?.data ?? '').replace('model:', '');
  if (setChatModel(chatId, model)) {
    await ctx.answerCallbackQuery({ text: `Model → ${model}` });
    const s = getChatState(chatId);
    const kb = new InlineKeyboard();
    for (const m of MODELS) kb.text(m === s.model ? `✅ ${m}` : m, `model:${m}`);
    await ctx.editMessageReplyMarkup({ reply_markup: kb }).catch(() => {});
  }
}

// ─── /clear ─────────────────────────────────────────────────

async function handleClear(ctx: Context): Promise<void> {
  if (!isAllowed(ctx)) return;
  const chatId = String(ctx.chat?.id);
  const count = getChatState(chatId).requestCount;
  clearSession(chatId);
  await ctx.reply(`🧹 <b>New session!</b> (${count} requests cleared)\nHistory wiped, model & dir kept.`, { parse_mode: 'HTML' });
}

// ─── /new ───────────────────────────────────────────────────

async function handleNew(ctx: Context): Promise<void> {
  if (!isAllowed(ctx)) return;
  const kb = new InlineKeyboard().text('✅ Reset', 'new_confirm').text('❌ Cancel', 'dismiss');
  await ctx.reply('🆕 Full reset? (model, session, stats)', { reply_markup: kb });
}

async function handleNewConfirm(ctx: Context): Promise<void> {
  if (!isAllowed(ctx)) return;
  resetChat(String(ctx.chat?.id));
  await ctx.answerCallbackQuery({ text: 'Reset!' });
  await ctx.editMessageText('🆕 Fresh start!').catch(() => {});
}

// ─── /dir ───────────────────────────────────────────────────

async function handleDir(ctx: Context): Promise<void> {
  if (!isAllowed(ctx)) return;
  const chatId = String(ctx.chat?.id);
  const dirArg = (ctx.message?.text ?? '').replace(/^\/dir\s*/, '').trim();

  if (!dirArg) {
    await ctx.reply(`📂 <code>${getChatState(chatId).cwd}</code>`, { parse_mode: 'HTML' });
    return;
  }

  // Also start new session when changing dir
  setChatCwd(chatId, dirArg);
  await ctx.reply(`📂 → <code>${dirArg}</code>`, { parse_mode: 'HTML' });
}

// ─── /obsidian ──────────────────────────────────────────────

async function handleObsidian(ctx: Context): Promise<void> {
  if (!isAllowed(ctx)) return;
  const enabled = toggleObsidian(String(ctx.chat?.id));
  await ctx.reply(`🧠 Obsidian: ${enabled ? '🟢 ON' : '⚪ OFF'}`);
}

// ─── /allow ─────────────────────────────────────────────────

async function handleAllow(ctx: Context): Promise<void> {
  if (!isOwner(ctx)) { await ctx.reply('🔒 Owner only.'); return; }
  const arg = (ctx.message?.text ?? '').split(/\s+/)[1]?.replace('@', '');
  if (!arg) { await ctx.reply('Usage: /allow <user_id or username>'); return; }

  // If replying to a message, use that user's id
  const replyUserId = ctx.message?.reply_to_message?.from?.id?.toString();
  const targetId = replyUserId ?? arg;
  allowedUsers.add(targetId);
  await ctx.reply(`✅ User ${targetId} allowed.`);
}

// ─── /status ────────────────────────────────────────────────

async function handleStatus(ctx: Context): Promise<void> {
  if (!isAllowed(ctx)) return;
  const s = getChatState(String(ctx.chat?.id));
  const avg = s.requestCount > 0 ? (s.totalDurationMs / s.requestCount / 1000).toFixed(1) : '—';
  await ctx.reply(
    '📊 <b>Status</b>\n\n' +
    `🤖 Model: <code>${s.model}</code>\n` +
    `📂 CWD: <code>${s.cwd}</code>\n` +
    `🧠 Obsidian: ${s.obsidianEnabled ? '🟢' : '⚪'}\n` +
    `💬 History: ${s.history.length / 2} messages\n` +
    `📨 Requests: ${s.requestCount}\n` +
    `⏱ Avg: ${avg}s\n` +
    `⚡ Active: ${getActiveCount()}/1 | 📋 Queue: ${getQueueSize()}/5`,
    { parse_mode: 'HTML' },
  );
}

// ─── Text ───────────────────────────────────────────────────

let botUsername = '';

export function setBotUsername(username: string): void {
  botUsername = username;
}

async function handleText(ctx: Context): Promise<void> {
  // In groups: first check if bot is mentioned, then check access
  if (isGroup(ctx) && !isMentioned(ctx, botUsername)) return;

  // Access check — silent ignore in groups, reply in DM
  if (!isAllowed(ctx)) {
    if (!isGroup(ctx)) await ctx.reply('🔒 Access denied.');
    return;
  }

  let text = ctx.message?.text?.trim() ?? '';
  if (!text) return;

  // Strip bot mention from text
  text = text.replace(new RegExp(`@${botUsername}`, 'gi'), '').trim();
  if (!text) return;

  await sendToClaude(ctx, String(ctx.chat?.id), text);
}

// ─── Photo ──────────────────────────────────────────────────

async function handlePhoto(ctx: Context): Promise<void> {
  if (!isAllowed(ctx)) return;
  const caption = ctx.message?.caption ?? 'Analyze this image';
  await sendToClaude(ctx, String(ctx.chat?.id), `[Photo: "${caption}"]`);
}

// ─── Document ───────────────────────────────────────────────

async function handleDocument(ctx: Context): Promise<void> {
  if (!isAllowed(ctx)) return;
  const chatId = String(ctx.chat?.id);
  const doc = ctx.message?.document;
  if (!doc) return;

  const name = doc.file_name ?? 'unknown';
  const textExts = ['.txt','.ts','.js','.tsx','.jsx','.py','.json','.md','.yaml','.yml','.toml','.csv','.sql','.html','.css','.sh','.prisma','.graphql','.xml'];
  if (!textExts.some(ext => name.toLowerCase().endsWith(ext))) {
    await ctx.reply(`📄 ${name} — only text files.`);
    return;
  }

  try {
    const file = await ctx.getFile();
    const url = `https://api.telegram.org/file/bot${config.botToken}/${file.file_path}`;
    const content = await (await fetch(url)).text();
    const caption = ctx.message?.caption ?? `Review: ${name}`;
    await sendToClaude(ctx, chatId, `File: ${name}\n\`\`\`\n${content}\n\`\`\`\n\n${caption}`);
  } catch {
    await ctx.reply('❌ Could not read file.');
  }
}

// ─── Send to Claude ─────────────────────────────────────────

async function sendToClaude(ctx: Context, chatId: string, prompt: string): Promise<void> {
  const statusMsg = await ctx.reply('⏳');

  const typingInterval = setInterval(() => {
    ctx.api.sendChatAction(ctx.chat!.id, 'typing').catch(() => {});
  }, 4000);

  try {
    const result = await askClaude(chatId, prompt);
    clearInterval(typingInterval);
    await ctx.api.deleteMessage(ctx.chat!.id, statusMsg.message_id).catch(() => {});

    const s = getChatState(chatId);
    const formatted = mdToHtml(result.output);
    const footer = `\n\n<i>⏱ ${(result.durationMs / 1000).toFixed(1)}s | ${s.model} | #${s.requestCount}</i>`;
    const chunks = chunkMessage(formatted + footer, 4000);

    for (const chunk of chunks) {
      try {
        await ctx.reply(chunk, { parse_mode: 'HTML' });
      } catch {
        await ctx.reply(chunk.replace(/<[^>]+>/g, ''));
      }
    }
  } catch (err) {
    clearInterval(typingInterval);
    await ctx.api.deleteMessage(ctx.chat!.id, statusMsg.message_id).catch(() => {});
    await ctx.reply(`❌ ${err instanceof Error ? err.message : String(err)}`);
  }
}
