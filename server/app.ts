import express, { type NextFunction, type Request, type Response } from "express";
import { HttpError, clientIp } from "./auth";
import { attachUser, authRouter, dataRouter, sameOrigin } from "./api";
import { runRoute } from "./routes";

// Gentle limit on the guidance endpoints (they call a paid/free-tier model), per server instance.
const hits = new Map<string, number[]>();
function guidanceLimit(req: Request, _res: Response, next: NextFunction) {
  const key = clientIp(req);
  const t = Date.now();
  const recent = (hits.get(key) ?? []).filter((x) => t - x < 10 * 60_000);
  if (recent.length >= 60) throw new HttpError(429, "That's a lot of requests. Please wait a few minutes and try again.");
  recent.push(t);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  next();
}

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", true);
  app.use(express.json({ limit: "200kb" }));
  app.use("/api", (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
  });
  app.use("/api", sameOrigin);
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });
  app.use("/api", attachUser);
  app.use("/api/auth", authRouter);
  app.use("/api/data", dataRouter);

  app.post("/api/:name", guidanceLimit, async (req, res) => {
    const { status, json } = await runRoute(String(req.params.name), req.body);
    res.status(status).json(json);
  });

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    if ((err as { type?: string })?.type === "entity.too.large") return res.status(413).json({ error: "That's too much text to send at once." });
    console.error(err);
    res.status(500).json({ error: "Something went wrong on our side. Please try again." });
  });
  return app;
}
