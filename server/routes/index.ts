import { Application } from "express";
import { educationRouter } from "./education";

export async function registerRoutes(app: Application) {
  app.use("/api/education", educationRouter);
  return app;
}
