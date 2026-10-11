import type { IncomingMessage, ServerResponse } from "node:http";
import { createApp } from "../server/app.js";

const app = createApp();

/**
 * The one serverless function behind every /api/* route (vercel.json rewrites /api/x/y to /api/handler?__path=x/y).
 * It restores the original path and hands the request to the same Express app used in development.
 */
export default function handler(req: IncomingMessage & { body?: unknown; _body?: boolean }, res: ServerResponse) {
  const url = new URL(req.url ?? "/", "http://local");
  const path = url.searchParams.get("__path");
  if (path !== null) {
    url.searchParams.delete("__path");
    const rest = url.searchParams.toString();
    req.url = `/api/${path}${rest ? `?${rest}` : ""}`;
  }
  // Vercel has already read the body; tell Express's JSON parser not to read it again.
  if (req.body !== undefined) req._body = true;
  return app(req as never, res as never);
}
