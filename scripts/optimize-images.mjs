/* ══════════════════════════════════════════════════════════════════
   optimize-images.mjs — drop a screenshot in, get a small one back.

   Every guide screenshot lives under public/screenshots/<guide>/. This
   used to mean whoever added one was also responsible for resizing and
   compressing it by hand — easy to forget, and one 1.1MB PNG on a guide
   page is worse for load time than the whole rest of the page combined.

   Run as part of the same build step that writes the guide pages
   (scripts/prerender.mjs imports and calls this first), so nothing
   extra has to be remembered: drop a raw screenshot in the folder,
   the next deploy ships it small.

   WHAT IT DOES, per image under public/screenshots/:
     - Wider than MAX_WIDTH? Downscaled to it, aspect ratio kept.
     - Re-encoded in its own format at a lossy-but-clean quality
       (mozjpeg for .jpg/.jpeg, palette PNG for .png) — overwriting the
       file in place, so every <img src> in the catalog keeps working
       unchanged.
     - A .webp sibling written alongside it. The catalog never
       references these directly; renderGuide() in prerender.mjs and
       ReaderBlocks in guides.jsx both wrap every figure's <img> in a
       <picture> that offers the sibling first and falls back to the
       original — so "WebP with a fallback" is automatic for every
       figure block, not something each guide entry has to ask for.

   IDEMPOTENT: a file already at or under MAX_WIDTH, whose .webp
   sibling is newer than it, is left alone. Re-running the build after
   nothing changed touches nothing.
══════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';

const MAX_WIDTH = 1400;
const JPEG_QUALITY = 82;
const WEBP_QUALITY = 82;
const PNG_QUALITY = 82;

const IMAGE_RE = /\.(jpe?g|png)$/i;

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (IMAGE_RE.test(entry.name)) out.push(full);
  }
  return out;
}

export async function optimizeImages(screenshotsDir) {
  if (!fs.existsSync(screenshotsDir)) return { processed: 0, skipped: 0 };

  let sharp;
  try { ({ default: sharp } = await import('sharp')); }
  catch (_) {
    console.warn('[optimize-images] sharp not installed — screenshots ship as committed, unresized');
    return { processed: 0, skipped: 0 };
  }

  let processed = 0, skipped = 0;
  for (const file of walk(screenshotsDir)) {
    const webpPath = file.replace(IMAGE_RE, '.webp');
    const srcStat = fs.statSync(file);

    /* Already handled: the webp sibling exists and is newer than the
       source, which is only true once this file has already been
       through this function and hasn't changed since. */
    if (fs.existsSync(webpPath) && fs.statSync(webpPath).mtimeMs >= srcStat.mtimeMs) {
      skipped++;
      continue;
    }

    /* One stubborn file — mid-scan by an AV, a preview tool, whatever
       still has it open for reading — is not worth failing the whole
       deploy over, so it's caught and skipped the way a failed OG
       image is: loudly, but the build goes on. It'll be picked up on
       the next run once whatever was holding it lets go. */
    try {
      const isPng = /\.png$/i.test(file);
      const img = sharp(file);
      const meta = await img.metadata();
      const needsResize = meta.width && meta.width > MAX_WIDTH;
      const resized = needsResize ? img.resize({ width: MAX_WIDTH }) : img;

      const buf = await resized.clone()[isPng ? 'png' : 'jpeg'](
        isPng ? { quality: PNG_QUALITY, palette: true, compressionLevel: 9 }
              : { quality: JPEG_QUALITY, mozjpeg: true }
      ).toBuffer();
      const webpBuf = await resized.clone().webp({ quality: WEBP_QUALITY }).toBuffer();

      /* Windows won't open a file for writing while sharp still holds
         its own handle on it open for reading — write beside it and
         rename over, which replaces the directory entry instead of the
         bytes sharp is still looking at. */
      const tmp = file + '.tmp';
      fs.writeFileSync(tmp, buf);
      fs.renameSync(tmp, file);

      const webpTmp = webpPath + '.tmp';
      fs.writeFileSync(webpTmp, webpBuf);
      fs.renameSync(webpTmp, webpPath);

      processed++;
      console.log(`[optimize-images] ${path.relative(screenshotsDir, file)}${needsResize ? ` (resized to ${MAX_WIDTH}px)` : ''} — ${(srcStat.size / 1024).toFixed(0)}KB → ${(buf.length / 1024).toFixed(0)}KB, +${(webpBuf.length / 1024).toFixed(0)}KB webp`);
    } catch (e) {
      console.warn(`[optimize-images] ${path.relative(screenshotsDir, file)} failed: ${e.message} — shipping unresized`);
      for (const stray of [file + '.tmp', webpPath + '.tmp']) {
        try { fs.unlinkSync(stray); } catch (_) {}
      }
    }
  }

  return { processed, skipped };
}
