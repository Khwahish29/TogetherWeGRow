import { useEffect, useMemo, useState } from "react";
import type { MatchPerson, MatchRequest, MatchResult } from "../../shared/types";
import { api } from "./api";
import type { User } from "./types";

const cache = new Map<string, Promise<MatchResult[] | null>>();

function toPerson(u: User, kind: "mentor" | "buddy"): MatchPerson {
  return {
    id: u.id,
    name: u.name,
    offers: kind === "buddy" ? (u.buddy?.topics ?? []) : [...u.skills, ...u.industries],
    about: u.bio,
    location: u.location,
    format: kind === "buddy" ? (u.buddy?.mode ?? u.format) : u.format,
    wantsToLearn: u.wantToLearn,
  };
}

/**
 * AI-ranked matches between a seeker and mentors or buddies.
 * `results` is null while there's nothing to match on, while loading, or when AI is unavailable
 * (`aiAvailable` false), so pages can fall back to simple local matching.
 */
export function useAiMatches(kind: "mentor" | "buddy", seeker: User | null, people: User[], need: string) {
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
    const wants = seeker?.wantToLearn ?? [];
    if (people.length === 0 || (!debouncedNeed.trim() && wants.length === 0)) return null;
    return {
      need: debouncedNeed.trim(),
      seeker: seeker
        ? { skills: seeker.skills, wantToLearn: wants, location: seeker.location, format: seeker.format }
        : undefined,
      people: people.map((p) => toPerson(p, kind)),
    };
  }, [kind, seeker, people, debouncedNeed]);

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
    /** AI results for the current request (null if not ready or unavailable). */
    results: ready ? state.results : null,
    loading: request !== null && (!ready || need !== debouncedNeed),
    aiAvailable: state.aiAvailable,
    active: request !== null,
  };
}
