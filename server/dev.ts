import "dotenv/config";
import express from "express";
import { aiEnabled } from "./lib/claude";
import { runRoute } from "./routes";

const app = express();
app.use(express.json({ limit: "100kb" }));

app.post("/api/:name", async (req, res) => {
  const { status, json } = await runRoute(req.params.name, req.body);
  res.status(status).json(json);
});

const port = Number(process.env.API_PORT ?? 8787);
app.listen(port, () => {
  console.log(`API on http://localhost:${port} (AI: ${aiEnabled() ? "Claude" : "built-in rules — set ANTHROPIC_API_KEY to enable"})`);
});
