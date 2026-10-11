import "dotenv/config";
import { aiProviderName } from "./lib/ai.js";
import { createApp } from "./app.js";
import { db } from "./db.js";

const port = Number(process.env.API_PORT ?? 8787);
createApp().listen(port, async () => {
  const provider = aiProviderName();
  console.log(`API on http://localhost:${port} (guidance: ${provider ?? "built-in rules. Set GROQ_API_KEY or XAI_API_KEY in .env to enable"})`);
  try {
    await db();
    console.log(`Database ready (${process.env.DATABASE_URL || process.env.POSTGRES_URL ? "DATABASE_URL" : "local PGlite in .data/pglite"})`);
  } catch (err) {
    console.error("Database failed to start:", err);
  }
});
