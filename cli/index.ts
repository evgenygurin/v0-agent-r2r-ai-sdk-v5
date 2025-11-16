#!/usr/bin/env node
import { Command } from 'commander';
import dotenv from 'dotenv';
import path from 'path';
import { getR2RClient } from '../lib/r2r/client';
import { configureQueryCommand } from './commands/query';
import { configureConversationCommand } from './commands/conversation';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const program = new Command();

program
  .name('r2r-cli')
  .description('A CLI to interact with the R2R API')
  .version('0.0.1');

const client = getR2RClient();

// Configure command groups
configureQueryCommand(program, client);
configureConversationCommand(program, client);

program.parse(process.argv);
