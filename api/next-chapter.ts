import type { VercelRequest, VercelResponse } from "@vercel/node";
import { runRoute } from "../server/routes";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { status, json } = await runRoute("next-chapter", req.body);
  res.status(status).json(json);
}
