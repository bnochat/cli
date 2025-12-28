import WebSocket from 'ws';
import readline from 'readline';
import chalk from 'chalk';
import axios from 'axios';
import { Auth } from '../auth';
import { config } from '../config';

interface Message {
  type: 'message' | 'join' | 'leave' | 'system' | 'error';
  user?: string;
  content: string;
  timestamp: Date;
}

interface TokenData {
  userToken: string;
  anonymousToken: string;
}

export class ChatClient {
  private ws: WebSocket | null = null;
  private rl: readline.Interface | null = null;
  private token: TokenData | null;

  constructor(private serverUrl: string, auth: Auth) {
    this.token = auth.getToken();
  }

  async join(roomCode?: string): Promise<void> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    const code = roomCode || await this.prompt(rl, chalk.cyan('Room Code: '));
    if (!code) {
      console.log(chalk.red('Room Code is required'));
      rl.close();
      return;
    }

    const pin = await this.prompt(rl, chalk.cyan('Room PIN (press Enter if none): '));
    rl.close();

    console.log(chalk.cyan('\nJoining room...'));

    // Call API to join room
    try {
      const body: { code: string; pin?: string } = { code };
      if (pin) body.pin = pin;

      const cookies = [];
      if (this.token?.anonymousToken) cookies.push(`bnochat.anonymous-token=${this.token.anonymousToken}`);
      if (this.token?.userToken) cookies.push(`bnochat.user-token=${this.token.userToken}`);

      await axios.post(`${config.apiUrl}/room/join-pin`, body, {
        headers: { Cookie: cookies.join('; ') }
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to join room';
      console.log(chalk.red(`\n✗ ${msg}`));
      return;
    }

    console.log(chalk.cyan('Connecting...'));

    const params = new URLSearchParams();
    params.set('code', code);
    if (pin) params.set('pin', pin);
  

    const url = `${this.serverUrl}/chat?${params.toString()}`;

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);

      this.ws.on('open', () => {
        this.startInput();
        resolve();
      });

      this.ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'error') {
          console.log(chalk.red(`\n✗ ${msg.content}`));
          this.cleanup();
          process.exit(1);
        }
        if (msg.type === 'system' && msg.content.includes('Welcome')) {
          console.log(chalk.green(`✓ Joined room`));
          console.log(chalk.gray('Type message and press Enter. /q to leave.\n'));
        }
        this.display(msg);
      });

      this.ws.on('close', () => { console.log(chalk.yellow('\nDisconnected')); this.cleanup(); });
      this.ws.on('error', (err) => { console.error(chalk.red('Connection failed:', err.message)); reject(err); });
    });
  }

  private prompt(rl: readline.Interface, question: string): Promise<string> {
    return new Promise((resolve) => rl.question(question, resolve));
  }

  private startInput(): void {
    this.rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    this.rl.on('line', (input) => {
      const text = input.trim();
      if (['/q', '/quit', '/exit'].includes(text)) { this.leave(); return; }
      if (text) this.send(text);
    });

    process.on('SIGINT', () => this.leave());
  }

  private send(content: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'message', content, timestamp: new Date() }));
    }
  }

  private display(msg: Message): void {
    const time = new Date(msg.timestamp).toLocaleTimeString();
    const formats: Record<string, () => void> = {
      message: () => console.log(`${chalk.gray(`[${time}]`)} ${chalk.blue(msg.user)}: ${msg.content}`),
      join: () => console.log(chalk.green(`→ ${msg.user} joined`)),
      leave: () => console.log(chalk.yellow(`← ${msg.user} left`)),
      system: () => console.log(chalk.magenta(`[System] ${msg.content}`)),
      error: () => console.log(chalk.red(`[Error] ${msg.content}`))
    };
    formats[msg.type]?.();
  }

  private leave(): void {
    console.log(chalk.yellow('\nLeaving...'));
    this.cleanup();
    process.exit(0);
  }

  private cleanup(): void {
    this.ws?.close();
    this.rl?.close();
  }
}
