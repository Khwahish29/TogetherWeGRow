import "dotenv/config";
import express from "express";
import { aiProviderName } from "./lib/ai";
import { runRoute } from "./routes";

const app = express();
app.use(express.json({ limit: "100kb" }));

app.post("/api/:name", async (req, res) => {
  const { status, json } = await runRoute(req.params.name, req.body);
  res.status(status).json(json);
});

const port = Number(process.env.API_PORT ?? 8787);
app.listen(port, () => {
  const provider = aiProviderName();
  console.log(`API on http://localhost:${port} (AI: ${provider ?? "built-in rules. Set XAI_API_KEY or GROQ_API_KEY in .env to enable"})`);
});
