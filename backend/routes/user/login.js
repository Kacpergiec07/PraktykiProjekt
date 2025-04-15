import { db, router } from "../../index.js";
import { loginSchema } from "../../utils/schemas.js";
import { SetRateLimit } from "../../utils/rateLimit.js";
import generateSession from "../../utils/session.js";
import bcrypt from "bcrypt";

router.post(
  "/api/v1/login",
  SetRateLimit({ window: "2m", max: 3 }),
  (req, res) => {
    const data = req.body;
    const isValid = loginSchema(data);
    if (!isValid) {
      return res
        .status(401)
        .json({ status: "error", data: loginSchema.errors[0].message });
    }

    // Find user by email
    const transaction = db
      .prepare("SELECT token, password FROM users WHERE email = ?;")
      .get(req.body.email);

    if (!transaction)
      return res
        .status(401)
        .json({ status: "error", data: "Invalid email or password." });

    const passwordCorrect = bcrypt.compareSync(
      req.body.password,
      transaction.password
    );

    if (!passwordCorrect)
      return res
        .status(401)
        .json({ status: "error", data: "Invalid email or password." });

    // Get full user information to return to the client
    const userInfo = db
      .prepare(
        "SELECT name, surname, email, permission FROM users WHERE token = ?;"
      )
      .get(transaction.token);

    if (!userInfo) {
      return res.status(500).json({
        status: "error",
        data: "Failed to retrieve user information.",
      });
    }

    // Ensure permission is converted to a number
    userInfo.permission = Number(userInfo.permission);

    // Generate token
    const authToken = generateSession(transaction.token, "1h");

    // Return user info along with the token
    res.json({
      status: "success",
      token: authToken,
      user: userInfo,
    });
  }
);
