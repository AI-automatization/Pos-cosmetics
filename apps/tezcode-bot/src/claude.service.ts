import { spawn } from 'child_process';
import fs from 'fs';
import { config } from './config';
import { SYSTEM_PROMPT } from './system-prompt';

// ─── Types ──────────────────────────────────────────────────

interface ClaudeResult {
  output: string;
  durationMs: number;
}

interface QueueItem {
  prompt: string;
  model: string;
  cwd: string;
  addDirs: string[];
  resolve: (result: ClaudeResult) => void;
  reject: (err: Error) => void;
}

// ─── Per-chat state ─────────────────────────────────────────

interface HistoryEntry {
  role: 'user' | 'assistant';
  text: string;
}

interface ChatState {
  model: string;
  cwd: string;
  history: HistoryEntry[];
  requestCount: number;
  totalDurationMs: number;
  obsidianEnabled: boolean;
}

const chatStates = new Map<string, ChatState>();

export function getChatState(chatId: string): ChatState {
  let s = chatStates.get(chatId);
  if (!s) {
    s = {
      model: config.model,
      cwd: config.cwd,
      history: [],
      requestCount: 0,
      totalDurationMs: 0,
      obsidianEnabled: true,
    };
    chatStates.set(chatId, s);
  }
  return s;
}

export function setChatModel(chatId: string, model: string): boolean {
  const lower = model.toLowerCase().trim();
  if (!VALID_MODELS.includes(lower as typeof VALID_MODELS[number])) return false;
  getChatState(chatId).model = lower;
  return true;
}

export function setChatCwd(chatId: string, cwd: string): void {
  getChatState(chatId).cwd = cwd;
}

export function resetChat(chatId: string): void {
  chatStates.set(chatId, {
    model: config.model,
    cwd: config.cwd,
    history: [],
    requestCount: 0,
    totalDurationMs: 0,
    obsidianEnabled: true,
  });
}

export function clearSession(chatId: string): void {
  const s = getChatState(chatId);
  s.history = [];
  s.requestCount = 0;
  s.totalDurationMs = 0;
}

export function toggleObsidian(chatId: string): boolean {
  const s = getChatState(chatId);
  s.obsidianEnabled = !s.obsidianEnabled;
  return s.obsidianEnabled;
}

// ─── Compact: Claude summarizes, replace history with summary ─

export async function compactHistory(chatId: string): Promise<void> {
  const s = getChatState(chatId);
  if (s.history.length <= 2) return;

  const result = await runClaude(chatId,
    'Summarize this entire conversation concisely: key decisions, files read/modified, current tasks, important context. Bullet points, max 30 lines.'
  );

  s.history = [
    { role: 'assistant', text: `[COMPACTED CONTEXT]\n${result.output}` },
  ];
}

// ─── Queue ──────────────────────────────────────────────────

let activeCount = 0;
const MAX_CONCURRENT = 1;
const queue: QueueItem[] = [];
const MAX_QUEUE = 5;

// ─── Build prompt ───────────────────────────────────────────

const MAX_HISTORY_CHARS = 30000; // ~30K chars of history context

function buildPrompt(state: ChatState, userMessage: string): string {
  const parts: string[] = [];

  // Identity — first message context
  if (state.requestCount === 0 && state.history.length === 0) {
    parts.push('You are TezCode AI Assistant for the RAOS project. Respond in the language the user writes in.\n');
  }

  // History — fit as much as possible within char limit
  if (state.history.length > 0) {
    parts.push('<conversation_history>');
    let charCount = 0;
    const entries: string[] = [];

    // Walk backwards, include most recent first
    for (let i = state.history.length - 1; i >= 0; i--) {
      const e = state.history[i];
      const label = e.role === 'user' ? 'User' : 'Assistant';
      const text = e.text.length > 2000 ? e.text.slice(0, 2000) + '...[truncated]' : e.text;
      const line = `${label}: ${text}`;

      if (charCount + line.length > MAX_HISTORY_CHARS) break;
      charCount += line.length;
      entries.unshift(line);
    }

    parts.push(...entries);
    parts.push('</conversation_history>\n');
  }

  parts.push(userMessage);
  return parts.join('\n');
}

// ─── Public API ─────────────────────────────────────────────

export async function askClaude(chatId: string, prompt: string): Promise<ClaudeResult> {
  return runClaude(chatId, prompt);
}

async function runClaude(chatId: string, prompt: string): Promise<ClaudeResult> {
  if (activeCount >= MAX_CONCURRENT && queue.length >= MAX_QUEUE) {
    throw new Error('Queue full. Wait.');
  }

  const state = getChatState(chatId);
  const fullPrompt = buildPrompt(state, prompt);

  const addDirs: string[] = [...config.globalDirs];
  if (state.obsidianEnabled && config.obsidianVault && fs.existsSync(config.obsidianVault)) {
    addDirs.push(config.obsidianVault);
  }

  return new Promise((resolve, reject) => {
    const item: QueueItem = {
      prompt: fullPrompt,
      model: state.model,
      cwd: state.cwd,
      addDirs,
      resolve: (result) => {
        state.history.push(
          { role: 'user', text: prompt },
          { role: 'assistant', text: result.output },
        );
        state.requestCount++;
        state.totalDurationMs += result.durationMs;
        resolve(result);
      },
      reject,
    };

    if (activeCount < MAX_CONCURRENT) {
      processItem(item);
    } else {
      queue.push(item);
    }
  });
}

// ─── Spawn ──────────────────────────────────────────────────

function processItem(item: QueueItem): void {
  activeCount++;
  const start = Date.now();

  const args = [
    '-p',
    '--output-format', 'text',
    '--model', item.model,
    '--no-session-persistence',
    '--dangerously-skip-permissions',
    '--append-system-prompt', SYSTEM_PROMPT,
  ];

  for (const dir of item.addDirs) {
    if (fs.existsSync(dir)) {
      args.push('--add-dir', dir);
    }
  }

  const proc = spawn(config.claudePath, args, {
    cwd: item.cwd,
    env: { ...process.env },
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true,
  });

  proc.stdin.write(item.prompt, 'utf-8');
  proc.stdin.end();

  let stdout = '';
  let stderr = '';

  proc.stdout.on('data', (data: Buffer) => { stdout += data.toString('utf-8'); });
  proc.stderr.on('data', (data: Buffer) => { stderr += data.toString('utf-8'); });

  const timeout = setTimeout(() => {
    proc.kill('SIGTERM');
    item.reject(new Error('Timeout 3min. Try shorter prompt or /compact'));
    onDone();
  }, 180000); // 3 min timeout

  proc.on('close', (code) => {
    clearTimeout(timeout);
    const durationMs = Date.now() - start;

    if (stdout.trim()) {
      item.resolve({ output: stdout.trim(), durationMs });
    } else if (code === 0) {
      item.resolve({ output: '(empty)', durationMs });
    } else {
      item.reject(new Error(stderr.trim().slice(0, 300) || `Exit ${code}`));
    }
    onDone();
  });

  proc.on('error', (err) => {
    clearTimeout(timeout);
    item.reject(new Error(`Spawn: ${err.message}`));
    onDone();
  });
}

function onDone(): void {
  activeCount--;
  const next = queue.shift();
  if (next) processItem(next);
}

// ─── Exports ────────────────────────────────────────────────

const VALID_MODELS = ['sonnet', 'opus', 'haiku'] as const;
export type ModelName = typeof VALID_MODELS[number];
export const MODELS = VALID_MODELS;
export function getQueueSize(): number { return queue.length; }
export function getActiveCount(): number { return activeCount; }
