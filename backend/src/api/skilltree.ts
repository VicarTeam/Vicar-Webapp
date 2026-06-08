import {Express, Request, Response} from "express";
import {SkillTree} from "../schema";

export function initSkillTreeRoutes(app: Express) {
  app.get('/skilltrees/mine', getMySkillTrees);
  app.post('/skilltrees', createSkillTree);
  app.put('/skilltrees/:id', updateSkillTree);
  app.delete('/skilltrees/:id', deleteSkillTree);
  app.get('/skilltrees/redeem/:code', redeemSkillTree);
}

/** Hängt die Mongo-ID als `id` an den gespeicherten Tree-Blob. */
function serialize(doc: any) {
  return {...doc.data, id: doc.id};
}

function normalizeCode(code: unknown): string {
  return typeof code === 'string' ? code.trim() : '';
}

async function getMySkillTrees(req: Request, res: Response) {
  const userId = res.locals.userId!;
  const trees = await SkillTree.find({userId});
  res.json(trees.map(serialize));
}

async function createSkillTree(req: Request, res: Response) {
  const userId = res.locals.userId!;

  const bonusCode = normalizeCode(req.body?.bonusCode);
  if (!bonusCode) {
    return res.status(400).send('Missing bonus code');
  }

  const existing = await SkillTree.findOne({bonusCode});
  if (existing) {
    return res.status(409).send('Bonus code already in use');
  }

  const tree = new SkillTree({
    bonusCode,
    userId,
    data: {...req.body, bonusCode},
  });

  await tree.save();

  res.json(serialize(tree));
}

async function updateSkillTree(req: Request, res: Response) {
  const userId = res.locals.userId!;
  const id = req.params.id;

  const tree = await SkillTree.findOne({_id: id, userId});
  if (!tree) {
    return res.status(404).send('Not found');
  }

  const bonusCode = normalizeCode(req.body?.bonusCode);
  if (!bonusCode) {
    return res.status(400).send('Missing bonus code');
  }

  const clash = await SkillTree.findOne({bonusCode, _id: {$ne: id}});
  if (clash) {
    return res.status(409).send('Bonus code already in use');
  }

  tree.bonusCode = bonusCode;
  tree.data = {...req.body, bonusCode};

  await tree.save();

  res.json(serialize(tree));
}

async function deleteSkillTree(req: Request, res: Response) {
  const userId = res.locals.userId!;
  const id = req.params.id;

  const tree = await SkillTree.findOne({_id: id, userId});
  if (!tree) {
    return res.status(404).send('Not found');
  }

  await tree.deleteOne();

  res.json({message: 'OK'});
}

async function redeemSkillTree(req: Request, res: Response) {
  const code = normalizeCode(req.params.code);
  if (!code) {
    return res.status(400).send('Missing bonus code');
  }

  const tree = await SkillTree.findOne({bonusCode: code});
  if (!tree) {
    return res.status(404).send('Not found');
  }

  res.json(serialize(tree));
}
