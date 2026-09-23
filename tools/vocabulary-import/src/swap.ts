import { chmodSync, existsSync, renameSync, rmSync } from 'node:fs';

/**
 * Replaces `outDir` with the fully written `staging` directory. If the new directory cannot be
 * moved into place, the old one is restored, so a failed build never leaves `outDir` missing.
 */
export function swapInto(
  staging: string,
  outDir: string,
  rename: (from: string, to: string) => void = renameSync,
) {
  chmodSync(staging, 0o755); // mkdtemp creates 0700; the output is an ordinary repo folder
  const previous = `${staging}-previous`;
  const hadPrevious = existsSync(outDir);
  if (hadPrevious) rename(outDir, previous);
  try {
    rename(staging, outDir);
  } catch (error) {
    if (hadPrevious) rename(previous, outDir);
    throw error;
  }
  // The new output is in place; a leftover copy of the old one is harmless (and gitignored).
  rmSync(previous, { recursive: true, force: true });
}
