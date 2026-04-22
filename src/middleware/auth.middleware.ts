import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { LoginRole } from "../modules/loginMapping/loginMapping.model.js";

type AuthRequest = Request & {
  user?: {
    id: string;
    role: LoginRole;
  };
};

type TokenPayload = JwtPayload & {
  id: string;
  role: LoginRole;
};

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return secret;
};

export const requireAuth = (roles?: LoginRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ message: "Missing or invalid authorization header" });
        return;
      }

      const token = authHeader.slice(7).trim();
      if (!token) {
        res.status(401).json({ message: "Missing bearer token" });
        return;
      }

      const decoded = jwt.verify(token, getJwtSecret()) as TokenPayload;
      if (!decoded.id || !decoded.role) {
        res.status(401).json({ message: "Invalid token payload" });
        return;
      }

      if (roles?.length && !roles.includes(decoded.role)) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }

      req.user = { id: decoded.id, role: decoded.role };
      next();
    } catch {
      res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};
