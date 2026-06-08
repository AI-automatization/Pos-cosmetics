function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing env: ${key}`);
  return val;
}

function env(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const config = {
  botToken: required('TEZCODE_BOT_TOKEN'),
  model: env('TEZCODE_MODEL', 'sonnet'),
  cwd: env('TEZCODE_CWD', 'C:/Users/asus'),
  claudePath: env('CLAUDE_PATH', 'C:/Users/asus/AppData/Roaming/npm/claude.cmd'),
  httpPort: Number(env('TEZCODE_HTTP_PORT', '7880')),
  timeoutMs: Number(env('TEZCODE_TIMEOUT', '600000')),
  obsidianVault: env('OBSIDIAN_VAULT', 'C:/Users/asus/Documents/Obsidian Vault'),
  maxHistory: Number(env('TEZCODE_MAX_HISTORY', '10')),
  ownerUsername: env('OWNER_USERNAME', 'tursunov_078'),
  globalDirs: [
    'C:/Users/asus/Desktop',
    'C:/Users/asus/Documents',
    'C:/Users/asus/Downloads',
  ],
};
