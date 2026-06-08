import http from 'http';
import { getQueueSize, getActiveCount } from './claude.service';
import { config } from './config';

let sendToChat: ((chatId: string, text: string) => Promise<void>) | null = null;

export function setSendFunction(fn: (chatId: string, text: string) => Promise<void>): void {
  sendToChat = fn;
}

export function startHttpServer(port: number): void {
  const server = http.createServer(async (req, res) => {
    const remoteIp = req.socket.remoteAddress;
    if (remoteIp !== '127.0.0.1' && remoteIp !== '::1' && remoteIp !== '::ffff:127.0.0.1') {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    const url = new URL(req.url ?? '/', `http://localhost:${port}`);

    try {
      if (req.method === 'GET' && url.pathname === '/api/status') {
        res.writeHead(200);
        res.end(JSON.stringify({
          owner: config.ownerUsername,
          model: config.model,
          cwd: config.cwd,
          busy: getActiveCount() > 0,
          queueSize: getQueueSize(),
        }));
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/send') {
        const body = await readBody(req);
        const { text, chatId } = JSON.parse(body);
        if (!text || !chatId || !sendToChat) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Missing text/chatId or bot not ready' }));
          return;
        }
        await sendToChat(chatId, text);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
        return;
      }

      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: String(err) }));
    }
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} busy — HTTP disabled (bot still works)`);
    } else {
      throw err;
    }
  });

  server.listen(port, '127.0.0.1', () => {
    console.log(`HTTP: http://127.0.0.1:${port}/api/{status,send}`);
  });
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}
