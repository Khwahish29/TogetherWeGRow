import { BadRequest, careers, companion, match, profileDraft, resumeJob, resumeSummary } from "./handlers";

export const ROUTES: Record<string, (body: unknown) => Promise<unknown>> = {
  "profile-draft": profileDraft,
  careers,
  companion,
  "resume-job": resumeJob,
  "resume-summary": resumeSummary,
  match,
};

/** Runs a handler and maps errors to an HTTP status + JSON body. */
export async function runRoute(name: string, body: unknown): Promise<{ status: number; json: unknown }> {
  const handler = ROUTES[name];
  if (!handler) return { status: 404, json: { error: "Not found" } };
  try {
    return { status: 200, json: await handler(body) };
  } catch (err) {
    if (err instanceof BadRequest) return { status: 400, json: { error: err.message } };
    console.error(err);
    return { status: 500, json: { error: "Something went wrong" } };
  }
}
