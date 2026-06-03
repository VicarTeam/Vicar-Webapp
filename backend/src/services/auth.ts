import * as jwt from 'jsonwebtoken';
import * as bcrypt from "bcryptjs";
import {RefreshToken, User} from "../schema";
import mongoose from "mongoose";

const SECRET = Bun.env.JWT_SECRET as string || "82FD43545DE86D765DC9286B419CF";
const ACCESS_TOKEN_EXPIRY = 60 * 15; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 60 * 60 * 24 * 90; // 90 days
// Kurzes Zeitfenster, in dem ein gerade rotierter (revoked) Refresh-Token noch
// akzeptiert wird. Verhindert Logout-Races, wenn mehrere Tabs/Geräte gleichzeitig
// mit demselben Refresh-Token refreshen.
const REFRESH_GRACE_MS = 60 * 1000; // 60 seconds

export interface Token {
  token: string;
  exp: number; // in milliseconds
}

export interface TokenPair {
  accessToken: Token;
  refreshToken: Token;
}

export type UserSession = User&mongoose.Document;

export async function authenticateByPassword(username: string, password: string): Promise<TokenPair|undefined> {
  try {
    let user = await User.findOne({'username': {'$regex': `^${username}$`, $options: 'i'}});
    if (!user) {
      user = new User();
      user.username = username;
      user.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
      user.discordId = '';
      await user.save();
    } else if (!user.password || user.password.trim().length === 0) {
      user.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
      await user.save();
    } else {
      console.log('User found, verifying password:', user.username, user.password);
      if (!await bcrypt.compare(password, user.password)) {
        console.error('Password does not match');
        return undefined; // Password does not match
      }
    }

    const tokens = await createTokens(user.id);

    const refreshToken = new RefreshToken({
      userId: user.id,
      token: tokens.refreshToken.token,
    });
    await refreshToken.save();

    return tokens;
  } catch (err) {
    console.error('Error during authentication by password:', err);
    return undefined;
  }
}

export async function setUserPassword(userId: string, password: string, oldPassword: string): Promise<boolean> {
  const user = await User.findById(userId);
  if (!user) {
    return false; // User not found
  }

  if (user.password && user.password.trim().length > 0) {
    if (!oldPassword || !await bcrypt.compare(oldPassword, user.password)) {
      return false; // Old password does not match
    }
  }

  user.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
  await user.save();
  return true;
}

export async function authenticate(discordUser: any): Promise<TokenPair> {
  const user = await getOrRegisterUser(discordUser);
  const tokens = await createTokens(user.id);

  const refreshToken = new RefreshToken({
    userId: user.id,
    token: tokens.refreshToken.token,
  });
  await refreshToken.save();

  return tokens;
}

export async function isAuthenticated(token: string): Promise<UserSession|undefined> {
  try {
    const decoded = jwt.verify(token, SECRET, { algorithms: ['HS256'] }) as jwt.JwtPayload;
    if (decoded.type !== 'access') {
      return undefined; // Not an access token
    }

    // Access-Tokens werden zustandslos validiert (Signatur + Ablauf). Dadurch sind
    // mehrere gleichzeitig gültige Tokens (Tabs/Geräte) möglich. Widerruf läuft über
    // die kurzlebige Ablaufzeit + die Refresh-Token-Tabelle.
    const user = await User.findById(decoded.sub);
    if (!user) {
      return undefined;
    }

    return user;
  } catch (err) {
    return undefined; // Invalid or expired token
  }
}

export async function refreshToken(refreshTokenStr: string): Promise<TokenPair|undefined> {
  // 1. Signatur + Typ prüfen. Ein abgelaufener Refresh-Token wirft hier -> Re-Login.
  let decoded: jwt.JwtPayload;
  try {
    decoded = jwt.verify(refreshTokenStr, SECRET, { algorithms: ['HS256'] }) as jwt.JwtPayload;
  } catch {
    return undefined;
  }
  if (decoded.type !== 'refresh') {
    return undefined;
  }

  const userId = decoded.sub as string;

  // 2. Token muss als (Geräte-)Session in der DB existieren.
  const existing = await RefreshToken.findOne({ token: refreshTokenStr, userId });
  if (!existing) {
    return undefined; // unbekannt / bereits aufgeräumt -> nur dieses Gerät re-loggt
  }

  // 3. Bereits rotiert? Innerhalb des Grace-Fensters den Ersatz-Token ausliefern
  //    (verhindert Logout, wenn zwei Tabs gleichzeitig refreshen).
  if (existing.isRevoked) {
    if (
      existing.replacedByToken &&
      existing.revokedAt &&
      Date.now() - existing.revokedAt.getTime() < REFRESH_GRACE_MS
    ) {
      const replacement = await RefreshToken.findOne({ token: existing.replacedByToken, isRevoked: false });
      if (replacement) {
        const accessToken = await createToken(userId, 'access', ACCESS_TOKEN_EXPIRY);
        return {
          accessToken,
          refreshToken: { token: replacement.token, exp: Date.now() + REFRESH_TOKEN_EXPIRY * 1000 },
        };
      }
    }
    return undefined; // außerhalb des Grace-Fensters wiederverwendet -> ungültig
  }

  // 4. Gültig -> rotieren (gleitende Session: neuer 90-Tage-Refresh-Token).
  const newTokens = await createTokens(userId);

  const newRefresh = new RefreshToken({ userId, token: newTokens.refreshToken.token });
  await newRefresh.save();

  existing.isRevoked = true;
  existing.replacedByToken = newTokens.refreshToken.token;
  existing.revokedAt = new Date();
  await existing.save();

  // Alte, bereits abgelaufene Grace-Tokens dieses Users aufräumen.
  await RefreshToken.deleteMany({
    userId,
    isRevoked: true,
    revokedAt: { $lt: new Date(Date.now() - REFRESH_GRACE_MS) },
  });

  return newTokens;
}

/** Widerruft genau einen Refresh-Token (Logout eines einzelnen Geräts). */
export async function revokeRefreshToken(token: string): Promise<void> {
  await RefreshToken.updateOne({ token }, { $set: { isRevoked: true, revokedAt: new Date() } });
}

export async function destroyUserSession(userId: string): Promise<void> {
  await RefreshToken.deleteMany({ userId: userId });

  const user = await User.findById(userId);
  if (user) {
    user.currentAccessToken = '';
    await user.save();
  }
}

export async function createTokens(userId: string): Promise<TokenPair> {
  const accessToken = await createToken(userId, 'access', ACCESS_TOKEN_EXPIRY);
  const refreshToken = await createToken(userId, 'refresh', REFRESH_TOKEN_EXPIRY);
  return {
    accessToken,
    refreshToken,
  };
}

export async function getUserIdRegardlessOfExpired(token: string): Promise<string|undefined> {
  try {
    const decoded = jwt.verify(token, SECRET, { algorithms: ['HS256'], ignoreExpiration: true }) as jwt.JwtPayload;
    if (decoded.type !== 'access' && decoded.type !== 'refresh') {
      return undefined; // Not a valid token type
    }

    return decoded.sub; // Return the user ID from the token
  } catch (err) {
    console.error('Token verification failed:', err);
    return undefined; // Invalid token
  }
}

function createToken(userId: string, type: 'access' | 'refresh', expiresIn: number): Promise<Token> {
  return new Promise<Token>(async (resolve, reject) => {
    const now = Date.now();
    const iat = Math.floor(now / 1000);
    jwt.sign({
      type: type,
      iat,
      exp: iat + expiresIn,
    }, SECRET, {
      algorithm: 'HS256',
      subject: userId,
      issuer: 'VicarWebApp',
    }, (err, token) => {
      if (err) {
        console.error('Error creating token:', err);
        return reject(err);
      }
      resolve({
        token: token as string,
        exp: now + expiresIn * 1000,
      });
    });
  });
}

/**
 * Gets the user ID from the mongoose database or registers the user if they don't exist and returns the user ID.
 */
async function getOrRegisterUser(discordUser: any): Promise<UserSession> {
  const existing = await User.findOne({discordId: discordUser.id});
  if (existing) {
    return existing;
  }

  const user = new User({
    discordId: discordUser.id,
    username: discordUser.username,
  });

  await user.save();

  return user;
}