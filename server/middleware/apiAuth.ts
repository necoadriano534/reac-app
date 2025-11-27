import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      isApiAuth?: boolean;
    }
  }
}

export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const apiKey = process.env.GLOBAL_API_KEY;
  
  if (!apiKey) {
    return next();
  }

  const authHeader = req.headers.authorization;
  const xApiKey = req.headers["x-api-key"] as string;

  let providedKey: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    providedKey = authHeader.substring(7);
  } else if (xApiKey) {
    providedKey = xApiKey;
  }

  if (providedKey && providedKey === apiKey) {
    req.isApiAuth = true;
  }

  next();
}

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = process.env.GLOBAL_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured on server" });
  }

  const authHeader = req.headers.authorization;
  const xApiKey = req.headers["x-api-key"] as string;

  let providedKey: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    providedKey = authHeader.substring(7);
  } else if (xApiKey) {
    providedKey = xApiKey;
  }

  if (!providedKey) {
    return res.status(401).json({ error: "API key required" });
  }

  if (providedKey !== apiKey) {
    return res.status(403).json({ error: "Invalid API key" });
  }

  req.isApiAuth = true;
  next();
}

export function requireAuthOrApiKey(req: Request, res: Response, next: NextFunction) {
  if (req.isApiAuth) {
    return next();
  }

  if (req.session?.userId) {
    return next();
  }

  return res.status(401).json({ error: "Não autorizado" });
}
