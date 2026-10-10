import { useEffect, useMemo, useState } from "react";
import type { MatchPerson, MatchRequest, MatchResult } from "../../shared/types";
import { api } from "./api";
import { comfortSummary } from "./comfort";
import type { User } from "./types";

type Kind = NonNullable<MatchRequest["kind"]>;
const cache = new Map<string, Promise<MatchResult[] | null>>();

function toPerson(u: User, kind: Kind): MatchPerson {
  const shared = kind === "worker" && u.workComfort?.shareWithEmployers ? comfortSummary(u.workComfort) : [];
  return {
    id: u.id,
    name: u.name,
    offers: kind === "buddy" ? (u.buddy?.topics ?? []) : [...u.skills, ...u.industries, ...shared],
    about: [u.bio, u.yearsExperience ? `${u.yearsExperience} years of experience` : ""].filter(Boolean).join(" "),
    location: u.location,
    format: kind === "buddy" ? (u.buddy?.mode ?? u.format) : u.format,
    wantsToLearn: u.wantToLearn,
  };
}

export function toSeeker(u: User | null): MatchRequest["seeker"] {
  if (!u) return undefined;
  return {
    skills: [...u.skills, ...u.industries],
    wantToLearn: u.wantToLearn,
    location: u.location,
    format: u.format,
    preferences: [...u.workPreferences, ...comfortSummary(u.workComfort)],
  };
}

/**
 * AI-ranked matches for any kind of item. `results` is null while there's nothing to match on,
 * while loading, or when AI is unavailable, so pages can fall back to simple local matching.
 */
export function useAiRank(kind: Kind, seeker: MatchRequest["seeker"], items: MatchPerson[], need: string) {
  const [state, setState] = useState<{ key: string; results: MatchResult[] | null; aiAvailable: boolean }>({
    key: "",
    results: null,
    aiAvailable: true,
  });
  const [debouncedNeed, setDebouncedNeed] = useState(need);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedNeed(need), 450);
    return () => clearTimeout(t);
  }, [need]);

  const request: MatchRequest | null = useMemo(() => {
    const profileNeed = kind === "opportunity" ? (seeker?.skills.length ?? 0) > 0 : (seeker?.wantToLearn.length ?? 0) > 0;
    if (items.length === 0 || (!debouncedNeed.trim() && !profileNeed)) return null;
    return { kind, need: debouncedNeed.trim(), seeker, people: items };
  }, [kind, seeker, items, debouncedNeed]);

  const key = request ? JSON.stringify(request) : "";

  useEffect(() => {
    if (!request) return;
    let active = true;
    if (!cache.has(key)) {
      cache.set(
        key,
        api
          .match(request)
          .then((r) => r.data)
          .catch(() => {
            cache.delete(key);
            return null;
          }),
      );
    }
    cache.get(key)!.then((results) => {
      if (active) setState({ key, results, aiAvailable: results !== null });
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const ready = request !== null && state.key === key;
  return {
    results: ready ? state.results : null,
    loading: request !== null && (!ready || need !== debouncedNeed),
    aiAvailable: state.aiAvailable,
    active: request !== null,
  };
}

/** AI-ranked mentors, buddies, or workers (for employers). */
export function useAiMatches(kind: "mentor" | "buddy" | "worker", seeker: User | null, people: User[], need: string) {
  const items = useMemo(() => people.map((p) => toPerson(p, kind)), [people, kind]);
  const s = useMemo(() => toSeeker(seeker), [seeker]);
  return useAiRank(kind, s, items, need);
}

/** Qualitative wording instead of a falsely precise percentage. */
export function matchStrength(score: number): "Strong match" | "Good match" | "Possible match" {
  return score >= 75 ? "Strong match" : score >= 50 ? "Good match" : "Possible match";
}
