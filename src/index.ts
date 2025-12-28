#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { config } from './config';
import { ChatClient } from './chat/client';
import { Updater } from './updater';
import { Auth } from './auth';

const program = new Command();
const auth = new Auth();

program
  .name('bno')
  .description('Terminal chat application')
  .version(config.version, '-v, --version')
  .option('-j, --join [code]', 'Join a chat room')
  .option('-c, --check', 'Check for updates')
  .option('-u, --update', 'Update to latest version')
  .option('-a, --auth', 'Login via browser')
  .option('-l, --logout', 'Logout');

program.parse();

const opts = program.opts();

(async () => {
  if (opts.auth) {
    const success = await auth.login();
    if (success) {
      await new ChatClient(config.serverUrl, auth).join();
    }
  } else if (opts.logout) {
    auth.logout();
  } else if (opts.check) {
    await new Updater().check();
  } else if (opts.update) {
    await new Updater().update();
  } else if (opts.join) {
    if (!auth.getToken()) {
      console.log(chalk.yellow('Please login first: bno -a'));
      process.exit(1);
    }
    const code = typeof opts.join === 'string' ? opts.join : undefined;
    await new ChatClient(config.serverUrl, auth).join(code);
  } else {
    program.help();
  }
})();
