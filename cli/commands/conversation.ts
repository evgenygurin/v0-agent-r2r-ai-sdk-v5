import { Command } from 'commander';
import { R2RClient } from '../../lib/r2r/client';

export function configureConversationCommand(program: Command, client: R2RClient) {
  const conversation = program.command('conversation').description('Manage conversations in R2R');

  conversation
    .command('create')
    .description('Create a new conversation')
    .action(async () => {
      try {
        console.log('Creating new conversation...');
        await client.authenticate();
        const response = await client.createConversation();
        console.log('Conversation created:');
        console.log(JSON.stringify(response, null, 2));
      } catch (error) {
        console.error('Error creating conversation:', error);
      }
    });

  conversation
    .command('get <id>')
    .description('Get a conversation by its ID')
    .action(async (id) => {
        try {
            console.log(`Getting conversation ${id}...`);
            await client.authenticate();
            const response = await client.getConversation(id);
            console.log('Conversation details:');
            console.log(JSON.stringify(response, null, 2));
        } catch (error) {
            console.error('Error getting conversation:', error);
        }
    });

    conversation
    .command('delete <id>')
    .description('Delete a conversation by its ID')
    .action(async (id) => {
        try {
            console.log(`Deleting conversation ${id}...`);
            await client.authenticate();
            const response = await client.deleteConversation(id);
            console.log('Conversation deleted:');
            console.log(JSON.stringify(response, null, 2));
        } catch (error) {
            console.error('Error deleting conversation:', error);
        }
    });
}
