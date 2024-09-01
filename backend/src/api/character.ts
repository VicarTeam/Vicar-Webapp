import {Express, Request, Response} from "express";
import {Character, User} from "../schema";

export function initCharacterRoutes(app: Express) {
  app.get('/characters', getCharacters);
  app.post('/characters', createCharacter);
  app.put('/characters/:id', updateCharacter);
  app.delete('/characters/:id', deleteCharacter);
  app.post('/characters/:id/share', shareCharacter);
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

  const character = await Character.findOne({_id: id, userId});
  if (!character) {
    return res.status(404).send('Not found');
  }

  await character.deleteOne();

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