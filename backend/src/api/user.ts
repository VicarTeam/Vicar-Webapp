import {Express, Request, Response} from "express";
import {User} from "../schema";

export function initUserRoutes(app: Express) {
  app.get('/users/@me', getMe);
}

async function getMe(req: Request, res: Response) {
  const userId = res.locals.userId!;
  const user = await User.findOne({_id: userId});
  if (!user) {
    return res.status(404).send('Not found');
  }

  res.json({
    id: user.id,
    username: user.username,
  });
}