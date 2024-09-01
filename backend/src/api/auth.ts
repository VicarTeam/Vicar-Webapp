import * as express from 'express';
import axios from "axios";
import {User} from "../schema";
import {createSession, destroySession} from "../sessions";

export function initAuthRoutes(app: express.Express) {
  app.get('/auth/login', login);
  app.get('/auth/callback', authorize);
  app.post('/auth/logout', logout);
}

async function login(req: express.Request, res: express.Response) {
  const state = Math.random().toString(36).substring(7);
  const redirectUrl = `https://discord.com/oauth2/authorize?response_type=code&client_id=${Bun.env.DISCORD_CLIENT_ID}&scope=identify&state=${state}&redirect_uri=${Bun.env.DISCORD_REDIRECT_URI}&prompt=consent`;
  res.redirect(redirectUrl);
}

async function authorize(req: express.Request, res: express.Response) {
  try {
    const code = req.query.code;
    const resp = await axios.post('https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: Bun.env.DISCORD_CLIENT_ID as string,
        client_secret: Bun.env.DISCORD_CLIENT_SECRET as string,
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: Bun.env.DISCORD_REDIRECT_URI as string,
        scope: 'identify',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

    const accessToken = resp.data.access_token;
    const discordUser = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userId = await getOrRegisterUser(discordUser.data);
    if (!userId) {
      return res.status(500).send('Failed to register user');
    }

    const sessionId = createSession(userId);
    res.redirect(`${Bun.env.FRONTEND_URL}/logged-in?session=${sessionId}`);

    axios.post('https://discord.com/api/oauth2/token/revoke',
      new URLSearchParams({
        token: accessToken,
        client_id: Bun.env.DISCORD_CLIENT_ID as string,
        client_secret: Bun.env.DISCORD_CLIENT_SECRET as string,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }).catch(console.error);
  } catch (e) {
    console.error(e);
    return res.status(500).send('Failed to authorize');
  }
}

async function logout(req: express.Request, res: express.Response) {
  const sessionId = req.headers.authorization;
  if (!sessionId) {
    return res.status(401).send('Unauthorized');
  }

  destroySession(sessionId);
  res.send('Logged out');
}

/**
 * Gets the user ID from the mongoose database or registers the user if they don't exist and returns the user ID.
 */
async function getOrRegisterUser(discordUser: any): Promise<string|undefined> {
  const existing = await User.findOne({discordId: discordUser.id});
  if (existing) {
    return existing.id;
  }

  const user = new User({
    discordId: discordUser.id,
    username: discordUser.username,
  });

  await user.save();

  return user.id;
}