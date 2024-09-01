import {Express, Request, Response} from "express";

export function initDataRoutes(app: Express) {
  app.get('/data/checksum', getChecksum);
  app.get('/data/bundle', getBundle);
}

async function getChecksum(req: Request, res: Response) {
  res.send('checksum');
}

async function getBundle(req: Request, res: Response) {
  res.send('bundle');
}