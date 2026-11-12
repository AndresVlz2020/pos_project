// backend/src/middlewares/auth.middleware.js

import jwt from "jsonwebtoken";
import { getJWTSecret } from "../config/env.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token requerido",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token inválido",
    });
  }

  try {
    const decoded = jwt.verify(token, getJWTSecret());

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido o expirado",
    });
  }
};
