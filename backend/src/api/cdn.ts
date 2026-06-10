import {Express, Request, Response} from "express";
import {mkdirSync} from "node:fs";

export const CDN_DIR = Bun.env.CDN_DIR || "./cdn-data";

mkdirSync(CDN_DIR, {recursive: true});

export const MIME_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export function initCdnRoutes(app: Express) {
  app.post('/cdn/upload', uploadImage);
}

async function uploadImage(req: Request, res: Response) {
  const data = req.body?.data;
  if (typeof data !== 'string') {
    return res.status(400).send('Missing image data');
  }

  const match = data.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return res.status(400).send('Invalid data URL');
  }

  const mime = match[1]!;
  const ext = MIME_EXT[mime];
  if (!ext) {
    return res.status(415).send('Unsupported image type');
  }

  const buffer = Buffer.from(match[2]!, 'base64');
  if (buffer.length === 0) {
    return res.status(400).send('Empty image');
  }
  if (buffer.length > MAX_BYTES) {
    return res.status(413).send('Image too large');
  }

  const filename = `${crypto.randomUUID()}.${ext}`;
  await Bun.write(`${CDN_DIR}/${filename}`, buffer);

  res.json({url: `/cdn/${filename}`});
}
