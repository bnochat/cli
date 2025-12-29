import axios from 'axios';
import chalk from 'chalk';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execSync, spawn } from 'child_process';
import { config } from '../config';

interface Release {
  tag_name: string;
  assets: Array<{ name: string; browser_download_url: string }>;
}

export class Updater {
  private apiUrl = `https://api.github.com/repos/${config.repo}/releases/latest`;

  async check(): Promise<void> {
    console.log(chalk.cyan('Checking for updates...'));
    try {
      const { hasUpdate, latest } = await this.getLatest();
      if (hasUpdate) {
        console.log(chalk.yellow(`New version: ${latest} (current: ${config.version})`));
        console.log(chalk.gray('Run `bno -u` to update'));
      } else {
        console.log(chalk.green(`You're on the latest version (${config.version})`));
      }
    } catch (err) {
      console.log(chalk.red('Failed to check for updates'));
      console.log(chalk.gray((err as Error).message));
    }
  }

  async update(): Promise<void> {
    console.log(chalk.cyan('Checking for updates...'));
    try {
      const { hasUpdate, latest } = await this.getLatest();
      if (!hasUpdate) {
        console.log(chalk.green(`Already on latest version (${config.version})`));
        return;
      }

      console.log(chalk.cyan(`Downloading v${latest}...`));
      const res = await axios.get<Release>(this.apiUrl);
      const expectedName = this.getBinaryName();
      console.log(chalk.gray(`Looking for: ${expectedName}`));
      console.log(chalk.gray(`Available assets: ${res.data.assets.map(a => a.name).join(', ') || 'none'}`));
      const asset = res.data.assets.find(a => a.name === expectedName);

      if (!asset) {
        console.log(chalk.red('No compatible binary found'));
        return;
      }

      const download = await axios.get(asset.browser_download_url, { responseType: 'arraybuffer' });
      const tempPath = path.join(os.tmpdir(), 'bno-update');
      fs.writeFileSync(tempPath, download.data);
      fs.chmodSync(tempPath, '755');

      if (process.platform === 'win32') {
        const batch = `@echo off\ntimeout /t 1 >nul\ncopy /Y "${tempPath}" "${process.execPath}"\ndel "${tempPath}"`;
        const batchPath = path.join(os.tmpdir(), 'bno-update.bat');
        fs.writeFileSync(batchPath, batch);
        spawn('cmd', ['/c', batchPath], { detached: true, stdio: 'ignore' }).unref();
      } else {
        try {
          fs.copyFileSync(tempPath, process.execPath);
        } catch {
          execSync(`sudo cp "${tempPath}" "${process.execPath}"`, { stdio: 'inherit' });
        }
        fs.unlinkSync(tempPath);
      }

      console.log(chalk.green(`✓ Updated to v${latest}`));
      console.log(chalk.gray('Restart bno to use new version'));
    } catch (err) {
      console.log(chalk.red('Update failed'));
      console.log(chalk.gray((err as Error).message));
    }
  }

  private async getLatest(): Promise<{ hasUpdate: boolean; latest: string }> {
    const res = await axios.get<Release>(this.apiUrl);
    const latest = res.data.tag_name.replace('v', '');
    return { hasUpdate: this.compare(latest, config.version) > 0, latest };
  }

  private getBinaryName(): string {
    const { platform, arch } = process;
    if (platform === 'win32') return 'bno.exe';
    if (platform === 'darwin') return arch === 'arm64' ? 'bno-macos-arm64' : 'bno-macos-x64';
    return arch === 'arm64' ? 'bno-linux-arm64' : 'bno-linux';
  }

  private compare(a: string, b: string): number {
    const [pa, pb] = [a, b].map(v => v.split('.').map(Number));
    for (let i = 0; i < 3; i++) {
      if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0) ? 1 : -1;
    }
    return 0;
  }
}
