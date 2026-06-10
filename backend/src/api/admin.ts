import {Express, NextFunction, Request, Response} from "express";
import mongoose from "mongoose";
import {Character, RefreshToken, User} from "../schema";

/**
 * Admin-Endpunkte für das ACP. Alle hinter requireAdmin (serverseitige
 * Durchsetzung). Umgehen bewusst das Owner-Scoping der normalen Charakter-API,
 * daher strikt admin-gated.
 */

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!res.locals.user?.isAdmin) {
    return res.status(403).send("Forbidden");
  }
  next();
}

/**
 * Schützt vor Mongoose-ObjectId-Cast-Fehlern: eine ungültige :id würde sonst in
 * findById werfen und (als unhandled Promise-Rejection) den Prozess crashen.
 * Gibt true zurück, wenn die Antwort bereits gesendet wurde.
 */
function invalidId(req: Request, res: Response): boolean {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).send("Not found");
    return true;
  }
  return false;
}

export function initAdminRoutes(app: Express) {
  app.use("/admin", requireAdmin);

  app.get("/admin/users", listUsers);
  app.patch("/admin/users/:id", updateUser);
  app.delete("/admin/users/:id", deleteUser);
  app.get("/admin/users/:id/characters", getUserCharacters);

  app.get("/admin/characters/:id", getCharacter);
  app.put("/admin/characters/:id", updateCharacter);
  app.delete("/admin/characters/:id", deleteCharacter);
}

async function listUsers(req: Request, res: Response) {
  const users = await User.find().sort({username: 1});
  const result = await Promise.all(
    users.map(async (u) => ({
      id: u.id,
      username: u.username,
      discordId: u.discordId,
      isAdmin: !!u.isAdmin,
      characterCount: await Character.countDocuments({userId: u.id}),
    })),
  );
  res.json(result);
}

async function updateUser(req: Request, res: Response) {
  if (invalidId(req, res)) return;
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).send("Not found");
  }

  if (typeof req.body?.isAdmin === "boolean") {
    user.isAdmin = req.body.isAdmin;
  }
  if (typeof req.body?.username === "string" && req.body.username.trim().length > 0) {
    user.username = req.body.username.trim();
  }

  await user.save();
  res.json({id: user.id, username: user.username, isAdmin: !!user.isAdmin});
}

async function deleteUser(req: Request, res: Response) {
  if (invalidId(req, res)) return;
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).send("Not found");
  }

  // Kaskadierend: eigene Charaktere + Refresh-Tokens mitlöschen.
  await Character.deleteMany({userId: user.id});
  await RefreshToken.deleteMany({userId: user.id});
  await user.deleteOne();

  res.json({message: "OK"});
}

async function getUserCharacters(req: Request, res: Response) {
  const characters = await Character.find(
    {userId: req.params.id},
    {"data.name": 1, "data.game": 1, "data.avatar": 1},
  );
  res.json(
    characters.map((c) => {
      const data: any = c.data || {};
      return {id: c.id, name: data.name, game: data.game, avatar: data.avatar};
    }),
  );
}

async function getCharacter(req: Request, res: Response) {
  if (invalidId(req, res)) return;
  const character = await Character.findById(req.params.id);
  if (!character) {
    return res.status(404).send("Not found");
  }
  res.json({...character.data, id: character.id, userId: character.userId});
}

async function updateCharacter(req: Request, res: Response) {
  if (invalidId(req, res)) return;
  const character = await Character.findById(req.params.id);
  if (!character) {
    return res.status(404).send("Not found");
  }

  // Validierung VOR dem Schreiben: echtes Objekt, kein Array/null, mit name.
  const body = req.body;
  if (typeof body !== "object" || body === null || Array.isArray(body) || typeof body.name !== "string") {
    return res.status(400).send("Invalid character data");
  }

  // id/userId gehören nicht in den Blob (werden separat beigemischt).
  const {id: _id, userId: _userId, ...data} = body;

  character.data = data;
  character.markModified("data");
  await character.save();

  res.json({message: "OK"});
}

async function deleteCharacter(req: Request, res: Response) {
  if (invalidId(req, res)) return;
  const character = await Character.findById(req.params.id);
  if (!character) {
    return res.status(404).send("Not found");
  }
  await character.deleteOne();
  res.json({message: "OK"});
}
