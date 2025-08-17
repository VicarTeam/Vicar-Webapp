import {Express, Request, Response} from "express";
import {Character, User} from "../schema";

export function initCharacterRoutes(app: Express) {
  app.get('/characters', getCharacters);
  app.post('/characters', createCharacter);
  app.put('/characters/:id', updateCharacter);
  app.delete('/characters/:id', deleteCharacter);
  app.post('/characters/:id/share', shareCharacter);
  app.get('/characters/:id/viewers', getCharacterViewers);
  app.delete('/characters/:id/viewers/:viewerId', deleteCharacterViewer);
}

async function getCharacters(req: Request, res: Response) {
  const userId = res.locals.userId!;

  const characters = await Character.find({userId});
  const sharedCharacters = await Character.find({viewers: userId});

  res.json({
    characters: characters.map(c => ({...c.data, id: c.id})),
    sharedCharacters: sharedCharacters.map(c => ({...c.data, id: c.id, justViewing: true})),
  });
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