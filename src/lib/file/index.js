import fs from 'fs/promises';
import path from 'path';

async function sumFileSizes(root, opts = { maxDepth: 5, current: 0 }, size = 0) {
  if (opts.current > opts.maxDepth) return size;

  const fStat = await fs.lstat(root);

  if (!fStat.isDirectory()) return fStat.size;

  const rootDir = await fs.readdir(root),
    folders = [];
  let sum = 0;

  for (const [, v] of rootDir.entries()) {
    const fPath = path.resolve(root, v),
      file = await fs.stat(fPath);
    if (file.isDirectory()) {
      folders.push(fPath);
    } else {
      sum += file.size;
    }
  }
  for (const f of folders) {
    const s = await sumFileSizes(f, { ...opts, current: opts.current + 1 }, 0);
    sum += s;
  }
  return sum + size;
}
export default { sumFileSizes };
