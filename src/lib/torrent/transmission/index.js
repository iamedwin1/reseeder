import { spawnSync } from 'child_process';
import logger from '../../logger/index.js';

// eslint-disable-next-line no-unused-vars
export default function addToClient(torrent, outPath, opts = {}) {
  const args = [torrent, '-w', outPath];
  logger.verbose(`Adding to transmission client: ${torrent} with path ${outPath}`);
  return spawnSync('transmission-cli', args, { timeout: 1000, detached: true });
}
