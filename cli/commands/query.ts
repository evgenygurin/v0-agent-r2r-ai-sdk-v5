import { Command } from 'commander';
import { R2RClient } from '../../lib/r2r/client';

export function configureQueryCommand(program: Command, client: R2RClient) {
  const query = program.command('query').description('Perform queries in R2R');

  query
    .command('search <query>')
    .description('Perform a search query')
    .option('-s, --settings <json>', 'JSON string of search settings')
    .action(async (query, options) => {
      try {
        let settings;
        if (options.settings) {
          try {
            settings = JSON.parse(options.settings);
          } catch (e) {
            console.error('Error: Invalid JSON for settings.');
            return;
          }
        }
        console.log(`Performing search for "${query}"...`);
        await client.authenticate(); // Ensure client is authenticated
        const response = await client.search(query, settings);
        console.log('Search response:');
        console.log(JSON.stringify(response, null, 2));
      } catch (error) {
        console.error('Error during search:', error);
      }
    });

  query
    .command('agent <message>')
    .description('Send a message to the R2R agent')
    .option('-c, --config <json>', 'JSON string of the agent config', '{}')
    .action(async (message, options) => {
        try {
            let config;
            try {
                config = JSON.parse(options.config);
            } catch (e) {
                console.error('Error: Invalid JSON for config.');
                return;
            }

            console.log(`Sending message to agent: "${message}"...`);
            await client.authenticate(); // Ensure client is authenticated
            const response = await client.agent(message, config);
            // Assuming the response is a stream
            const reader = response.body?.getReader();
            if (reader) {
                const decoder = new TextDecoder();
                let result = '';
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    result += decoder.decode(value, { stream: true });
                }
                console.log('Agent response:');
                console.log(result);
            } else {
                console.log('Agent response:');
                console.log(JSON.stringify(await response.json(), null, 2));
            }
        } catch (error) {
            console.error('Error during agent request:', error);
        }
    });
}
