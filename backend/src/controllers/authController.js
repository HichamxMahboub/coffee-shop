import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { query } from "../db.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(20),
});

// Login sécurisé (email + mot de passe)
export async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const result = await query(
      "SELECT id, nom, email, role, password_hash FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash);

    if (!passwordOk) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      refreshSecret,
      { expiresIn: "7d" }
    );

    await query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')",
      [user.id, refreshToken]
    );

    return res.json({
      token: accessToken,
      refreshToken,
      user: { id: user.id, fullName: user.nom, email: user.email, role: user.role },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Données invalides" });
    }
    return next(error);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const { refreshToken: token } = refreshSchema.parse(req.body);
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

    const payload = jwt.verify(token, refreshSecret);

    const result = await query(
      "SELECT id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()",
      [token]
    );

    if (!result.rows[0]) {
      return res.status(401).json({ message: "Refresh token invalide" });
    }

    const accessToken = jwt.sign(
      { id: payload.id, email: payload.email, role: payload.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ token: accessToken });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Données invalides" });
    }
    return res.status(401).json({ message: "Refresh token invalide" });
  }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken: token } = refreshSchema.parse(req.body);
    await query("DELETE FROM refresh_tokens WHERE token = $1", [token]);
    return res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Données invalides" });
    }
    return next(error);
  }
}

// Infos du profil connecté
export async function me(req, res, next) {
  try {
    const result = await query(
      "SELECT id, nom, email, role FROM users WHERE id = $1",
      [req.user.id]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}
