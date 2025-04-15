import jwt from "jsonwebtoken";

// Use environment variable or a secure configuration for the secret key
const JWT_SECRET = process.env.JWT_SECRET || "secure_pharmacy_secret_key";

export default function generateSession(token, expiry) {
  return jwt.sign({ token: token }, JWT_SECRET, {
    expiresIn: expiry,
    algorithm: "HS512",
  });
}
