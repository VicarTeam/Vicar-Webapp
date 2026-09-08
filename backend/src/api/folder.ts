import {Express, Request, Response} from "express";
import {Folder} from "../schema";

export function initFolderRoutes(app: Express) {
  app.get('/folders', getMyFolders);
  app.post('/folders', createFolder);
  app.put('/folders/:id', updateFolder);
  app.delete('/folders/:id', deleteFolder);
}

/** Serialisiert einen Ordner mit der Mongo-ID als `id`. */
function serialize(doc: any) {
  return {
    id: doc.id,
    name: doc.name ?? "",
    parentId: doc.parentId ?? "",
    position: doc.position ?? 0,
    characters: Array.isArray(doc.characters) ? doc.characters : [],
  };
}

function normalizeIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((id): id is string => typeof id === 'string')
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
}

async function getMyFolders(req: Request, res: Response) {
  const userId = res.locals.userId!;
  const folders = await Folder.find({userId});
  res.json(folders.map(serialize));
}

async function createFolder(req: Request, res: Response) {
  const userId = res.locals.userId!;

  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (!name) {
    return res.status(400).send('Missing name');
  }

  const folder = new Folder({
    userId,
    name,
    parentId: typeof req.body?.parentId === 'string' ? req.body.parentId.trim() : '',
    position: typeof req.body?.position === 'number' ? req.body.position : 0,
    characters: normalizeIds(req.body?.characters),
  });

  await folder.save();

  res.json(serialize(folder));
}

async function updateFolder(req: Request, res: Response) {
  const userId = res.locals.userId!;
  const id = req.params.id;

  const folder = await Folder.findOne({_id: id, userId});
  if (!folder) {
    return res.status(404).send('Not found');
  }

  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (name) {
    folder.name = name;
  }
  folder.parentId = typeof req.body?.parentId === 'string' ? req.body.parentId.trim() : '';
  folder.position = typeof req.body?.position === 'number' ? req.body.position : 0;
  folder.characters = normalizeIds(req.body?.characters);

  await folder.save();

  res.json(serialize(folder));
}

async function deleteFolder(req: Request, res: Response) {
  const userId = res.locals.userId!;
  const id = req.params.id;

  const folder = await Folder.findOne({_id: id, userId});
  if (!folder) {
    return res.status(404).send('Not found');
  }

  await folder.deleteOne();

  res.send('OK');
}
