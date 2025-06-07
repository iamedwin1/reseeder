import { spawnSync } from 'child_process';
import logger from '../../logger/index.js';

export default function addToClient(torrent, outPath, opts = {}) {
  const args = [torrent, `--save-path=${outPath}`];
  if (opts.safe) args.push('--add-stopped=true');
  if (opts.disablePopup) args.push('--skip-dialog');
  logger.verbose(`Adding to qbittorrent client: ${torrent} with path ${outPath}`);

  const spawn = spawnSync(`qbittorrent`, args, {
    timeout: 15000,
    detatched: true,
  });
  if (spawn.error) logger.error(`error during add for ${torrent}`);
}
