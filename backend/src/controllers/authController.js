import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db.js";

// Login sécurisé (email + mot de passe)
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    const result = await query(
      "SELECT id, full_name, email, role, password_hash FROM users WHERE email = $1",
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

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      token,
      user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role },
    });
  } catch (error) {
    return next(error);
  }
}

// Infos du profil connecté
export async function me(req, res, next) {
  try {
    const result = await query(
      "SELECT id, full_name, email, role FROM users WHERE id = $1",
      [req.user.id]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}
