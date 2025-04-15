import jwt from "jsonwebtoken";

// Use environment variable or a secure configuration for the secret key
const JWT_SECRET = process.env.JWT_SECRET || "secure_pharmacy_secret_key";

export default function validateAuth(req) {
  if (!req.headers["authorization"]) return false;
  const token = req.headers["authorization"];
  try {
    const session = jwt.verify(token, JWT_SECRET);
    return session.token;
  } catch (err) {
    console.error("Auth validation error:", err.message);
    return false;
  }
}
