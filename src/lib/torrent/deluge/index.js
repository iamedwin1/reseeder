import { spawnSync } from 'child_process';
import logger from '../../logger/index.js';

// eslint-disable-next-line no-unused-vars
export default function addToClient(torrent, outPath, opts = {}) {
  const args = ['add', `-p="${outPath}"`, torrent];
  logger.verbose(`Adding to deluge client: ${torrent} with path ${outPath}`);
  return spawnSync(`deluge-console`, args, { timeout: 15000, detached: true });
}
