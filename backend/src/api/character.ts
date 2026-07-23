import {Express, Request, Response} from "express";
import {Character, User} from "../schema";

/**
 * Leichtgewichtige Projektion für die Charakterliste: NUR die Felder, die in der
 * Karte (frontend `components/main/characters/Character.vue`) angezeigt werden.
 * So wird beim App-Start nicht der komplette Blob (inkl. eingebettetem Regelwerk
 * und früher base64-Avatar) jedes Charakters übertragen. Der volle Blob kommt
 * erst beim Öffnen via GET /characters/:id.
 *
 * WICHTIG: Wenn die Karte neue Felder anzeigt, hier ergänzen.
 */
const SUMMARY_PROJECTION = {
  "data.name": 1,
  "data.avatar": 1,
  "data.avatarOrientation": 1,
  "data.sex": 1,
  "data.concept": 1,
  "data.clan.name": 1,
  "data.clan.slogan": 1,
  "data.clan.nickname": 1,
  "data.tribe.name": 1,
  "data.auspice.name": 1,
  "data.tradition.name": 1,
  "data.creed.name": 1,
  "data.generation": 1,
  "data.generationEra": 1,
  "data.hasCainsMark": 1,
  "data.chronicle": 1,
  "data.exp": 1,
  "data.game": 1,
  "data.directory": 1,
  "data.version": 1,
} as const;

export function initCharacterRoutes(app: Express) {
  app.get('/characters', getCharacters);
  app.get('/characters/:id', getCharacter);
  app.post('/characters', createCharacter);
  app.put('/characters/:id', updateCharacter);
  app.patch('/characters/:id/directory', updateCharacterDirectory);
  app.delete('/characters/:id', deleteCharacter);
  app.post('/characters/:id/share', shareCharacter);
  app.get('/characters/:id/viewers', getCharacterViewers);
  app.delete('/characters/:id/viewers/:viewerId', deleteCharacterViewer);
}

async function getCharacters(req: Request, res: Response) {
  const userId = res.locals.userId!;

  const characters = await Character.find({userId}, SUMMARY_PROJECTION);
  const sharedCharacters = await Character.find({viewers: userId}, SUMMARY_PROJECTION);

  res.json({
    characters: characters.map(c => ({...c.data, id: c.id})),
    sharedCharacters: sharedCharacters.map(c => ({...c.data, id: c.id, justViewing: true})),
  });
}

async function getCharacter(req: Request, res: Response) {
  const userId = res.locals.userId!;
  const id = req.params.id;

  // Owner ODER Viewer dürfen den vollen Blob laden.
  const character = await Character.findOne({_id: id, $or: [{userId}, {viewers: userId}]});
  if (!character) {
    return res.status(404).send('Not found');
  }

  res.json({...character.data, id: character.id, justViewing: character.userId !== userId});
}

async function createCharacter(req: Request, res: Response) {
  const userId = res.locals.userId!;

  const character = new Character({
    userId,
    data: req.body,
  });

  await character.save();

  res.json({
    id: character.id,
  });
}

async function updateCharacter(req: Request, res: Response) {
  const userId = res.locals.userId!;
  const id = req.params.id;

  const character = await Character.findOne({_id: id, userId});
  if (!character) {
    return res.status(404).send('Not found');
  }

  character.data = req.body;

  await character.save();

  res.json({message: 'OK'});
}

/**
 * Setzt/löscht nur das Ordner-Feld eines Charakters. Wird vom Drag-&-Drop in der
 * Liste genutzt, wo nur ein Summary geladen ist – ein volles PUT würde dort den
 * kompletten Blob überschreiben.
 */
async function updateCharacterDirectory(req: Request, res: Response) {
  const userId = res.locals.userId!;
  const id = req.params.id;

  const character = await Character.findOne({_id: id, userId});
  if (!character) {
    return res.status(404).send('Not found');
  }

  const data: any = character.data || {};
  const directory = req.body?.directory;
  if (typeof directory === 'string' && directory.length > 0) {
    data.directory = directory;
  } else {
    delete data.directory;
  }
  character.data = data;
  // data ist Schema-Typ Object (Mixed) -> verschachtelte Änderung muss markiert werden.
  character.markModified('data');

  await character.save();

  res.json({message: 'OK'});
}

async function deleteCharacter(req: Request, res: Response) {
  const userId = res.locals.userId!;
  const id = req.params.id;

  const character = await Character.findOne({_id: id});
  if (!character) {
    return res.status(404).send('Not found');
  }

  if (character.userId === userId) {
    await character.deleteOne();
  } else if (character.viewers.includes(userId)) {
    character.viewers = character.viewers.filter(v => v !== userId);
    await character.save();
  }

  res.json({message: 'OK'});
}

async function shareCharacter(req: Request, res: Response) {
  const userId = res.locals.userId!;
  const id = req.params.id;

  const character = await Character.findOne({_id: id, userId});
  if (!character) {
    return res.status(404).send('Not found');
  }

  const viewerUsername = req.body.username;
  const viewer = await User.findOne({username: viewerUsername});
  if (!viewer) {
    return res.status(404).send('Viewer not found');
  }

  character.viewers.push(viewer.id);

  await character.save();

  res.json({message: 'OK'});
}

async function getCharacterViewers(req: Request, res: Response) {
  const userId = res.locals.userId!;
  const id = req.params.id;

  const character = await Character.findOne({_id: id, userId});
  if (!character) {
    return res.status(404).send('Not found');
  }

  const viewers = await User.find({_id: {$in: character.viewers}});
  res.json(viewers.map(v => ({id: v.id, username: v.username})));
}

async function deleteCharacterViewer(req: Request, res: Response) {
  const userId = res.locals.userId!;
  const id = req.params.id;
  const viewerId = req.params.viewerId;

  const character = await Character.findOne({_id: id, userId});
  if (!character) {
    return res.status(404).send('Not found');
  }

  if (!character.viewers.includes(viewerId)) {
    return res.status(404).send('Viewer not found');
  }

  character.viewers = character.viewers.filter(v => v !== viewerId);

  await character.save();

  res.json({message: 'OK'});
}