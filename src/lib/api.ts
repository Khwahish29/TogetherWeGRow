import type {
  ApiResult,
  CareerProfileInput,
  CareerRec,
  CompanionRequest,
  CompanionResponse,
  ProfileDraft,
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
};
