import * as express from 'express';
import axios from "axios";
import {MemoryCache} from "memory-cache-node";
import {
  authenticate,
  authenticateByPassword,
  destroyUserSession,
  getUserIdRegardlessOfExpired,
  refreshToken,
  revokeRefreshToken
} from "../services/auth";

const preAuthCache = new MemoryCache<string, string>(1, Number.MAX_SAFE_INTEGER);

/** Lokaler Entwicklungsmodus – aktiviert u.a. den Fake-Login ohne Discord. */
function isDevMode(): boolean {
  return Bun.env.DEV_MODE === 'true' || Bun.env.NODE_ENV === 'development';
}

export function initAuthRoutes(app: express.Express) {
  app.get('/auth/login', login);
  app.get('/auth/callback', authorize);
  app.post('/auth/logout', logout);
  app.post('/auth/refresh', refreshTokens);
  app.get('/auth/login/password', loginThroughPassword);
  app.get('/auth/login/dev', loginAsDev);
}

/**
 * Fake-Login für die lokale Entwicklung: meldet einen festen Dev-Nutzer an,
 * ohne dass Discord-OAuth konfiguriert sein muss. Nur im Dev-Modus aktiv.
 */
async function loginAsDev(req: express.Request, res: express.Response) {
  if (!isDevMode()) {
    return res.status(404).send('Not found');
  }

  const r = req.query.r as string;
  const session = await authenticate({ id: 'dev-local-user', username: 'dev' });

  const url = new URL(Bun.env.FRONTEND_URL as string + "/logged-in");
  url.searchParams.set('s_atk', session.accessToken.token);
  url.searchParams.set('s_rtk', session.refreshToken.token);
  url.searchParams.set('s_exp', session.accessToken.exp.toString());
  if (r) {
    url.searchParams.set('r', r);
  }

  res.redirect(url.toString());
}

async function loginThroughPassword(req: express.Request, res: express.Response) {
  const d = req.query.d as string;
  const r = req.query.r as string;
  const failureUrl = new URL(Bun.env.FRONTEND_URL as string + "/login");
  if (!d) {
    console.warn('No d parameter');
    res.redirect(failureUrl.toString());
    return;
  }

  let decoded: {username: string, password: string};
  try {
    const json = Buffer.from(d, 'base64').toString('utf-8');
    decoded = JSON.parse(json);
  } catch (e) {
    console.warn('Failed to decode d parameter', e);
    res.redirect(failureUrl.toString());
    return;
  }
  if (!decoded.username || !decoded.password) {
    console.warn('Invalid d parameter');
    res.redirect(failureUrl.toString());
    return;
  }

  const session = await authenticateByPassword(decoded.username, decoded.password);
  if (!session) {
    console.warn('Failed to authenticate by password');
    res.redirect(failureUrl.toString());
    return;
  }

  const url = new URL(Bun.env.FRONTEND_URL as string + "/logged-in");
  url.searchParams.set('s_atk', session.accessToken.token);
  url.searchParams.set('s_rtk', session.refreshToken.token);
  url.searchParams.set('s_exp', session.accessToken.exp.toString());
  if (r) {
    url.searchParams.set('r', r);
  }

  res.redirect(url.toString());
}

async function login(req: express.Request, res: express.Response) {
  const r = req.query.r as string;
  const state = Math.random().toString(36).substring(7);
  if (r) {
    preAuthCache.storeExpiringItem(state, r, 60 * 5); // Store the state for 5 minutes
  }

  const redirectUrl = `https://discord.com/oauth2/authorize?response_type=code&client_id=${Bun.env.DISCORD_CLIENT_ID}&scope=identify&state=${state}&redirect_uri=${Bun.env.DISCORD_REDIRECT_URI}&prompt=consent`;
  res.redirect(redirectUrl);
}

async function authorize(req: express.Request, res: express.Response) {
  try {
    const state = req.query.state as string;
    let r = '';
    if (state && preAuthCache.hasItem(state)) {
      r = preAuthCache.retrieveItemValue(state) || '';
      preAuthCache.removeItem(state); // Remove the state after use
    }

    const code = req.query.code as string;
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

    const session = await authenticate(discordUser.data);
    const url = new URL(Bun.env.FRONTEND_URL as string + "/logged-in");
    url.searchParams.set('s_atk', session.accessToken.token);
    url.searchParams.set('s_rtk', session.refreshToken.token);
    url.searchParams.set('s_exp', session.accessToken.exp.toString());
    if (r) {
      url.searchParams.set('r', r);
    }

    res.redirect(url.toString());

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
  let sessionId = req.headers.authorization;
  if (!sessionId) {
    return res.status(401).send('Unauthorized');
  }
  sessionId = sessionId.replace('Bearer ', '');
  const userId = await getUserIdRegardlessOfExpired(sessionId);
  if (!userId) {
    return res.status(401).send('Unauthorized');
  }

  // Mit Refresh-Token: nur dieses Gerät ausloggen. Ohne: alle Geräte.
  const rtk = req.query.rtk as string;
  if (rtk) {
    await revokeRefreshToken(rtk);
  } else {
    await destroyUserSession(userId);
  }
  res.json({ message: 'Logged out successfully' });
}

async function refreshTokens(req: express.Request, res: express.Response) {
  // Bewusst KEINE Authorization-Pflicht: Der Access-Token darf bereits abgelaufen
  // sein (genau dann will man refreshen). Die Gültigkeit hängt am Refresh-Token.
  const rtk = req.query.rtk as string;
  if (!rtk) {
    return res.status(400).send('Refresh token is required');
  }

  try {
    const tokens = await refreshToken(rtk);
    if (!tokens) {
      return res.status(401).send('Invalid or expired refresh token');
    }

    res.json({
      accessToken: tokens.accessToken.token,
      refreshToken: tokens.refreshToken.token,
      exp: tokens.accessToken.exp,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).send('Failed to refresh tokens');
  }
}