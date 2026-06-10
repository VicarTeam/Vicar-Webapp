import {Express, Request, Response} from "express";
import {User} from "../schema";
import {setUserPassword} from "../services/auth";

export function initUserRoutes(app: Express) {
  app.get('/users/@me', getMe);
  app.patch('/users/@me/password', changePassword);
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
    isAdmin: !!user.isAdmin,
  });
}

async function changePassword(req: Request, res: Response) {
  const userId = res.locals.userId!;
  const password = req.body.password;
  const oldPassword = req.body.oldPassword;
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).send('Password invalid');
  }

  if (!await setUserPassword(userId, password, oldPassword)) {
    return res.status(400).send('Failed to set password');
  }

  res.status(204).send();
}