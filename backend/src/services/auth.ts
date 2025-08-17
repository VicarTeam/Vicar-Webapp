import * as jwt from 'jsonwebtoken';
import {RefreshToken, User} from "../schema";
import mongoose from "mongoose";

const SECRET = Bun.env.JWT_SECRET as string;
const ACCESS_TOKEN_EXPIRY = 60 * 15; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 60 * 60 * 24 * 90; // 90 days

export interface Token {
  token: string;
  exp: number; // in milliseconds
}

export interface TokenPair {
  accessToken: Token;
  refreshToken: Token;
}

export type UserSession = User&mongoose.Document;

export async function authenticate(discordUser: any): Promise<TokenPair> {
  const user = await getOrRegisterUser(discordUser);
  const tokens = await createTokens(user.id);

  user.currentAccessToken = tokens.accessToken.token;
  await user.save();

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

    const user = await User.findById(decoded.sub);
    if (!user || user.currentAccessToken !== token) {
      return undefined; // User not found or token does not match
    }

    return user;
  } catch (err) {
    console.error('Token verification failed:', err);
    return undefined; // Invalid token
  }
}

export async function refreshToken(accessToken: string, refreshToken: string): Promise<TokenPair|undefined> {
  const decoded = jwt.verify(refreshToken, SECRET, { algorithms: ['HS256'] }) as jwt.JwtPayload;
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid refresh token type');
  }

  const user = await User.findById(decoded.sub);
  if (!user || user.currentAccessToken !== accessToken) {
    if (user) {
      await destroyUserSession(user.id);
    }
    return undefined;
  }

  const existingRefreshToken = await RefreshToken.findOne({ userId: user.id, token: refreshToken });
  if (!existingRefreshToken) {
    throw new Error('Refresh token not found');
  }

  if (existingRefreshToken.isRevoked) {
    await destroyUserSession(user.id);
    return undefined;
  }

  // Create new tokens
  const newTokens = await createTokens(user.id);
  user.currentAccessToken = newTokens.accessToken.token;
  await user.save();

  // Update or create the refresh token
  existingRefreshToken.isRevoked = true; // Revoke the old refresh token
  await existingRefreshToken.save();

  const newRefreshToken = new RefreshToken({
    userId: user.id,
    token: newTokens.refreshToken.token,
  });
  await newRefreshToken.save();

  return newTokens;
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