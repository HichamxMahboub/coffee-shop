import bcrypt from "bcryptjs";
import { query } from "../src/db.js";

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const nom = process.env.ADMIN_NAME || "Admin";

if (!email || !password) {
  console.error("ADMIN_EMAIL et ADMIN_PASSWORD sont requis");
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 10);

await query(
  "INSERT INTO users (nom, email, password_hash, role) VALUES ($1, $2, $3, 'admin') RETURNING id",
  [nom, email, passwordHash]
).then((result) => {
  console.log(`Admin créé avec l'id: ${result.rows[0].id}`);
});

process.exit(0);
