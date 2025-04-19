import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { config } from "../config";
import fs from "fs";
import path from "path";
import YAML from "yaml";

/**
 * Setup Swagger documentation
 */
export const setupSwagger = (app: Express): void => {
  try {
    // Read the YAML file
    const swaggerYaml = fs.readFileSync(
      path.resolve(__dirname, "../../docs/swagger.yaml"),
      "utf8"
    );

    // Parse YAML to JSON
    const swaggerDefinition = YAML.parse(swaggerYaml);

    // Setup Swagger UI
    app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerDefinition, {
        explorer: true,
        customCss: ".swagger-ui .topbar { display: none }",
      })
    );

    // Serve Swagger YAML
    app.get("/swagger.yaml", (req, res) => {
      res.setHeader("Content-Type", "text/yaml");
      res.send(swaggerYaml);
    });

    // Serve Swagger JSON
    app.get("/swagger.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerDefinition);
    });
  } catch (error) {
    console.error("Error setting up Swagger:", error);
  }
};
