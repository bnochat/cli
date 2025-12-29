import { io, Socket } from 'socket.io-client';
import readline from 'readline';
import chalk from 'chalk';
import { Auth } from '../auth';
import { config } from '../config';

interface Message {
  displayName?: string;
  text?: string;
  isOwn?: boolean;
  timestamp: Date;
}

interface TokenData {
  userToken: string;
  anonymousToken: string;
}

export class ChatClient {
  private socket: Socket | null = null;
  private rl: readline.Interface | null = null;
  private token: TokenData | null;
  private roomCode: string = '';

  constructor(private socketUrl: string, auth: Auth) {
    this.token = auth.getToken();
  }

  async join(roomCode?: string): Promise<void> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    let code = roomCode || await this.prompt(rl, chalk.cyan('Room Code: '));
    let attempts = 1;
    while (!code) {
      if (attempts >= 3) {
        console.log(chalk.yellow('Room Code is required. Type /q to exit'));
      } else {
        console.log(chalk.red('Room Code is required'));
      }
      code = await this.prompt(rl, chalk.cyan('Room Code: '));
      if (code === '/q') {
        rl.close();
        return;
      }
      attempts++;
    }
    this.roomCode = code;

    let pin = await this.prompt(rl, chalk.cyan('Room PIN (press Enter if none): '));
    rl.close();

    // Call API to join room with retry
    let joined = false;
    while (!joined) {
      console.log(chalk.cyan('\nJoining room...'));
      try {
        const cookies = [];
        if (this.token?.anonymousToken) cookies.push(`bnochat.anonymous-token=${this.token.anonymousToken}`);
        if (this.token?.userToken) cookies.push(`bnochat.user-token=${this.token.userToken}`);

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (cookies.length) headers['Cookie'] = cookies.join('; ');
        const endpoint = pin ? `${config.apiUrl}/room/join-pin` : `${config.apiUrl}/room/join`;
        const body = pin ? { code, pin } : { code };
        const res = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as any).message || `HTTP ${res.status}`);
        }
        joined = true;
      } catch (err: any) {
        const msg = err.message || 'Failed to join room';
        console.log(chalk.red(`\n✗ ${msg}`));
        
        const retryRl = readline.createInterface({ input: process.stdin, output: process.stdout });
        code = await this.prompt(retryRl, chalk.cyan('Room Code (or /q to quit): '));
        
        if (['/q', '/quit', '/exit'].includes(code.trim())) {
          retryRl.close();
          return;
        }
        
        if (!code.trim()) {
          console.log(chalk.red('Room Code is required'));
          retryRl.close();
          continue;
        }
        
        this.roomCode = code.trim();
        pin = await this.prompt(retryRl, chalk.cyan('Room PIN (press Enter if none): '));
        retryRl.close();
      }
    }

    console.log(chalk.cyan('Connecting...'));

    return new Promise((resolve, reject) => {
      // Connect to /chat namespace
      this.socket = io(`${this.socketUrl}`, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 3000,
        timeout: 5000,
        // withCredentials: true,
        extraHeaders: {
          Cookie: this.buildCookieHeader()
        }
      });

      this.socket.on('connect', () => {
        console.log(chalk.green('✔️  Connected'));
        console.log(chalk.gray('Type message and press Enter to send. /q to leave.\n'));
        this.socket?.emit('room:focus', { roomCode: this.roomCode });
        this.startInput();
        resolve();
      });

      this.socket.on('message', (msg: Message) => {
        this.display(msg);
      });

      this.socket.on('disconnect', () => {
        console.log(chalk.yellow('\nDisconnected'));
        this.cleanup();
      });

      this.socket.on('connect_error', (err) => {
        console.error(chalk.red('Connection failed:', err.message));
        reject(err);
      });
    });
  }

  private buildCookieHeader(): string {
    const cookies = [];
    if (this.token?.anonymousToken) cookies.push(`bnochat.anonymous-token=${this.token.anonymousToken}`);
    if (this.token?.userToken) cookies.push(`bnochat.user-token=${this.token.userToken}`);
    return cookies.join('; ');
  }

  private prompt(rl: readline.Interface, question: string): Promise<string> {
    return new Promise((resolve) => rl.question(question, resolve));
  }

  private startInput(): void {
    this.rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    const promptUser = () => {
      this.rl?.question(chalk.cyan('> '), (input) => {
        const text = input.trim();
        if (['/q', '/quit', '/exit'].includes(text)) { this.leave(); return; }
        if (text) this.send(text);
        promptUser();
      });
    };

    promptUser();
    process.on('SIGINT', () => this.leave());
  }

  private send(content: string): void {
    if (this.socket?.connected) {
      this.socket.emit('message:send', { roomCode: this.roomCode, text: content });
    }
  }

  private display(msg: Message): void {
    if (msg.isOwn) return;
    console.log(`${chalk.blue(msg.displayName)}: ${msg.text}`);
  }

  private leave(): void {
    console.log(chalk.yellow('\nLeaving...'));
    this.cleanup();
    process.exit(0);
  }

  private cleanup(): void {
    this.socket?.disconnect();
    this.rl?.close();
  }
}
