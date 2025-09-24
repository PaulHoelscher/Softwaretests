import express from "express";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { weatherService } from "./weatherService";
import { BadRequestError, HttpError } from "./errors";

const moduleDir = dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/weather", async (req, res, next) => {
    try {
      const city = req.query.city;
      if (typeof city !== "string") {
        throw new BadRequestError("Parameter 'city' wird benoetigt.");
      }

      const weather = await weatherService.getWeatherByCity(city);
      res.json(weather);
    } catch (error) {
      next(error);
    }
  });

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const error = err instanceof HttpError ? err : new HttpError("Interner Serverfehler");
    if (!(err instanceof HttpError)) {
      console.error(err);
    }

    res.status(error.statusCode).json({ message: error.message });
  });

  if (process.env.NODE_ENV === "production") {
    const clientBuildPath = resolve(moduleDir, "../client");
    app.use(express.static(clientBuildPath));
    app.get("*", (_req, res) => {
      res.sendFile(resolve(clientBuildPath, "index.html"));
    });
  }

  return app;
}
