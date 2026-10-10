import type {
  ApiResult,
  CareerProfileInput,
  CareerRec,
  CompanionRequest,
  CompanionResponse,
  MatchRequest,
  MatchResult,
  NextChapterInput,
  NextChapterPlan,
  ProfileDraft,
  ResumeJobResult,
  ResumeSummaryInput,
} from "../../shared/types";

async function post<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  const res = await fetch(`/api/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "We couldn't reach the assistant. Please try again.");
  }
  return res.json();
}

export const api = {
  profileDraft: (text: string) => post<ProfileDraft>("profile-draft", { text }),
  careers: (profile: CareerProfileInput) => post<CareerRec[]>("careers", profile),
  companion: (req: CompanionRequest) => post<CompanionResponse>("companion", req),
  nextChapter: (input: NextChapterInput) => post<NextChapterPlan>("next-chapter", input),
  match: (req: MatchRequest) => post<MatchResult[] | null>("match", req),
  resumeJob: (text: string) => post<ResumeJobResult>("resume-job", { text }),
  resumeSummary: (input: ResumeSummaryInput) => post<{ summary: string }>("resume-summary", input),
};
