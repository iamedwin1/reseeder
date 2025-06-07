import { Command, Option } from 'commander';
import search from './src/lib/index.js';
import logger from './src/lib/logger/index.js';

const program = new Command();
async function main() {
  program
    .requiredOption('-i, --input-folders [folders...]', 'Absolute path to directory containing torrents to reseed')
    .requiredOption('-f, --folders [folders...]', 'Absolute paths to search in')
    .option('--disable-popup', 'Do not show popup when adding torrent to client. qbitorrent only', false)
    .option('--safe-add', 'Add torrent to client in stopped state. qbitorrent only', false)
    .option('-d, --depth <number>', 'Maximum node depth', 5)
    .option('-t, --timeout <value>', 'Maximum time to search per torrent', '2m')
    .option('--max-depth <integer>', 'Maximum amount of directory depth to search before stopping', 5)
    .option('--size-check <boolean>', 'Check filesize of directory children and match against expected size', true)
    .option('--size-delta <integer>', 'Allowable difference in filesize as a percentage', 0)
    .option('--recurse <number>', 'Search subfolders at input for torrents', 0)
    .option('-m, --max-time <value>', 'Maximum time to run program before haulting', '10m')
    .addOption(new Option('-v --verbose', 'Verbose output').implies({ verbose: true }));

  program.addOption(
    new Option('--client <args>', 'The torrent client to use')
      .choices(['qbittorrent', 'deluge', 'transmission'])
      .default('qbittorrent')
  );

  program.showHelpAfterError();

  program.parse(process.argv);
  const opts = program.opts();

  logger.level = opts.verbose ? 'verbose' : 'info';

  logger.verbose(`search options %O`, opts);

  const results = [];
  for (const i of opts.inputFolders) {
    const t = await search({ ...opts, in: i });
    results.push(t);
  }
}

main();
