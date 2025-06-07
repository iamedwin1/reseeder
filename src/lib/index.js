import fs from 'fs/promises';
import ParseTorrent from 'parse-torrent';
import ms from 'ms';
import path from 'path';
import handler from './torrent/index.js';
import fileLib from './file/index.js';
import logger from './logger/index.js';

async function folderInput(opts = {}) {
  const input = opts.in,
    maxTime = opts.maxTime,
    progStart = new Date().valueOf(),
    recurse = opts.recurse,
    disablePopup = !!opts.disablePopup,
    safeAdd = !!opts.safeAdd,
    maxTimeValue = ms(maxTime);

  async function findTorrentsInDir(dirPath) {
    const inputStat = await fs.lstat(dirPath);
    if (inputStat.isFile()) {
      const f = path.parse(dirPath);
      return await findTorrent({ name: f.base, path: f.dir }, { ...opts, disablePopup, safeAdd });
    }

    let dir;
    try {
      dir = await fs.opendir(dirPath);
      for await (const dirent of dir) {
        const fullPath = path.join(dirPath, dirent.name);
        if (dirent.isDirectory() && recurse) {
          await findTorrentsInDir(fullPath);
        } else if (dirent.isFile() && path.extname(dirent.name) === '.torrent') {
          await findTorrent({ name: dirent.name, path: dirPath }, { ...opts, disablePopup, safeAdd });
        }
      }
    } catch (err) {
      logger.error(err);
    }
  }

  let tid;
  const maxTimer = new Promise((_, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Exceeded maxTimeValue`)), maxTimeValue);
    tid = timeout;
  });

  await Promise.race([findTorrentsInDir(input), maxTimer]);

  logger.verbose(`finished after ${ms(Date.now() - progStart)}`);
  if (tid) clearTimeout(tid);
}

async function findTorrent(torrentDirEnt, opts = {}) {
  try {
    if (path.extname(torrentDirEnt?.name) !== '.torrent') return null;

    const torrentBuffer = await fs.readFile(path.join(torrentDirEnt.path, torrentDirEnt.name)),
      parsedTorrent = await ParseTorrent(torrentBuffer);

    for (const rootFolder of opts.folders) {
      const searchResult = await searchNode(parsedTorrent, rootFolder, opts);
      if (searchResult) {
        // execute fn to add torrent to client
        handler[opts.client](path.join(torrentDirEnt.path, torrentDirEnt.name), `${searchResult.parentDir}/`, opts);
        logger.info(`found ${torrentDirEnt.name} ${torrentDirEnt.path} at ${searchResult.parentDir}`);
        return parsedTorrent.name;
      }
      logger.verbose(`${torrentDirEnt.name} not found in ${rootFolder} with max depth of ${opts.maxDepth}`);
    }
  } catch (err) {
    logger.error(err);
    return null;
  }
}

async function searchNode(torrent, root, opts, depth = 0) {
  if (depth > opts.maxDepth) return null;

  logger.verbose(`searching node ${root} at depth of ${depth}`);
  try {
    const rootDir = await fs.readdir(root),
      childNodes = [];
    for (const child of rootDir) {
      try {
        const fPath = path.resolve(root, child),
          file = await fs.stat(fPath),
          fileStats = { file, name: child, path: fPath, parentDir: root },
          match = await checkMatch(torrent, { name: child, path: fPath, ...file }, opts);

        if (match) return fileStats;
        if (file.isDirectory()) childNodes.push(fPath);
      } catch (err) {
        logger.error(err);
        continue;
      }
    }
    // if there are child nodes and no match, search now
    for (const e of childNodes) {
      const r = await searchNode(torrent, e, opts, depth + 1);
      if (r) return r;
    }
  } catch (err) {
    logger.error(err);
  }
}

async function checkMatch(torrent, file, opts) {
  const nameMatch = torrent.name === file.name;
  if (!nameMatch) return false;
  const sizeMatch = opts.sizeCheck ? await checkSize(torrent, file, opts) : true;
  return nameMatch && sizeMatch;
}

async function checkSize(torrent, file, opts) {
  const childSum = await fileLib.sumFileSizes(file.path),
    deltaCalc = (Number(opts.sizeDelta) / 100) * torrent.length;

  logger.verbose(`torrent size ${torrent.length} compared to prospect size ${childSum}`);

  return childSum >= torrent.length - deltaCalc && childSum <= torrent.length + deltaCalc;
}

export default folderInput;

export { findTorrent };
