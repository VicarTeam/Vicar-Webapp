import {Express, Request, Response} from "express";
import fetch from "node-fetch";

const CHECKSUM_URL = "https://github.com/VicarTeam/VicarData/releases/latest/download/checksum.sha256";
const BUNDLE_URL = "https://github.com/VicarTeam/VicarData/releases/latest/download/bundle.zip";

export function initDataRoutes(app: Express) {
  app.get('/data/checksum', getChecksum);
  app.get('/data/bundle', getBundle);
}

async function getChecksum(req: Request, res: Response) {
  const response = await fetch(CHECKSUM_URL);
  res.send(await response.text());
}

async function getBundle(req: Request, res: Response) {
  const response = await fetch(BUNDLE_URL);
  const blob = await response.blob();
  const buffer = Buffer.from(await blob.arrayBuffer());
  res.send(buffer.toString('base64'));
}