import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("JWT_SECRET and REFRESH_TOKEN_SECRET must be defined");
}

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 12); // Increased rounds to 12
};

export const verifyPassword = async (password: string, hashed: string) => {
  return await bcrypt.compare(password, hashed);
};

export const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Server-side authorization check for Server Actions.
 * Throws an error if not authenticated.
 */
export async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Unauthorized: No session found");
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    throw new Error("Unauthorized: Invalid session");
  }

  return decoded;
}
