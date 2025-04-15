// Define libraries
import express from "express";
import sqlite3 from "better-sqlite3";
import { existsSync, copyFileSync } from "node:fs";
import { globSync } from "glob";
import cors from "cors";

import Ajv from "ajv";
import "dotenv/config";
import morgan from "morgan";
import chalk from "chalk";

if (!existsSync("./database.sqlite")) {
  copyFileSync("./users_template.sqlite", "./database.sqlite");
}
// Define server router and SQLite database.
export const router = express();
export const ajv = new Ajv();
router.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
router.options("*", cors());
router.use(express.json());
router.use(morgan("dev"));
router.disable("x-powered-by");
export const db = sqlite3("./database.sqlite");

db.pragma("journal_mode = WAL");

if (true) {
  import("./developmentEndpoints.js");
  setTimeout(() => {
    console.log(
      chalk.bold(
        chalk.red(
          `[SERVER] [CRITICAL] DEVELOPMENT MODE IS ON. TURN OFF DEVELOPMENT IN YOUR .ENV FILE BEFORE PUSHING TO PRODUCTION.`
        )
      )
    );
  }, 100);
}

// Import routes.
const routes = globSync("./routes/**/*.js");
for (const route of routes) {
  console.log(chalk.cyan(`[SERVER] Imported "${route}"`));
  import(`./${route}`);
}

router.listen(3000);
console.log("Listening on ==> http://localhost:" + 3000);
