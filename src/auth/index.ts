import http from 'http';
import open from 'open';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { config, getCallbackUrl } from '../config';

const CONFIG_DIR = path.join(os.homedir(), '.bno');
const TOKEN_FILE = path.join(CONFIG_DIR, 'auth.json');
const SUCCESS_HTML = fs.readFileSync(path.join(__dirname, 'success.html'), 'utf-8')
  .replace('{{BASE_URL}}', config.baseUrl);

interface TokenData {
  userToken: string;
  anonymousToken: string;
}

export class Auth {
  async login(): Promise<boolean> {
    console.log(chalk.cyan('Opening browser for authentication...'));

    const callbackUrl = getCallbackUrl();
    const authUrl = `${config.authUrl}?callback=${encodeURIComponent(callbackUrl)}`;

    return new Promise((resolve) => {
      const server = http.createServer((req, res) => {
        const url = new URL(req.url || '', `http://localhost:${config.authPort}`);

        if (url.pathname === '/callback') {
          const anonymousToken = url.searchParams.get('bnochat.anonymous-token') || '';
          const userToken = url.searchParams.get('bnochat.user-token') || '';

          if (anonymousToken || userToken) {
            this.save({ anonymousToken, userToken });
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(SUCCESS_HTML);
            console.log(chalk.green(`\n✓ Logged in\n`));
            setTimeout(() => { server.close(); resolve(true); }, 1000);
          } else {
            res.writeHead(400);
            res.end('Authentication failed');
            resolve(false);
          }
          return;
        }
        res.writeHead(404);
        res.end();
      });

      server.listen(config.authPort, async () => {
        console.log(chalk.gray(`Auth: ${authUrl}`));
        try { await open(authUrl); } catch { console.log(chalk.yellow(`Open: ${authUrl}`)); }
      });

      setTimeout(() => { server.close(); resolve(false); }, 5 * 60 * 1000);
    });
  }

  getToken(): TokenData | null {
    return this.load();
  }

  logout(): void {
    if (fs.existsSync(TOKEN_FILE)) fs.unlinkSync(TOKEN_FILE);
    console.log(chalk.green('✓ Logged out'));
  }

  private load(): TokenData | null {
    try {
      if (!fs.existsSync(TOKEN_FILE)) return null;
      const data = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'));
      return data;
    } catch { return null; }
  }

  private save(data: TokenData): void {
    if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(data));
  }
}
