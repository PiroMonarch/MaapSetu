import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Request, Response, NextFunction } from "express";
import { User, type UserRole } from "./models";
import { ApiError } from "./errors";

const JWT_SECRET = process.env.JWT_SECRET || "maapsetu-dev-secret-change-in-production";
const TOKEN_DAYS = 7;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hashed: string) {
  if (!hashed) return false;
  if (hashed.startsWith("$2")) return bcrypt.compare(plain, hashed);
  return plain === hashed;
}

export function signToken(user: AuthUser) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: `${TOKEN_DAYS}d` });
}

export function publicUser(user: { _id: unknown; email: string; name: string; role: string }) {
  return {
    id: String(user._id),
    _id: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) return next(new ApiError(401, "Authentication required", "AUTH"));
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = payload;
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired session", "AUTH"));
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) return next();
  try {
    req.user = jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    /* ignore */
  }
  next();
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, "Authentication required", "AUTH"));
    if (roles.length && !roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission for this action", "FORBIDDEN"));
    }
    next();
  };
}

export async function loginWithPassword(email: string, password: string) {
  const user = await User.findOne({ email: String(email || "").toLowerCase().trim() });
  if (!user || !(await verifyPassword(password, user.password))) {
    throw new ApiError(401, "Invalid credentials", "AUTH");
  }
  const payload: AuthUser = {
    id: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
  };
  return { user: publicUser(user), token: signToken(payload) };
}
