// Transparent, rule-based lead qualification engine for luxury real estate.
// Every signal is shown to the visitor — no black box.
// Concept demo: all scoring happens in the browser; nothing is sent anywhere.

export type Tier = "hot" | "warm" | "cold";

export interface LeadInput {
  name: string;
  email: string;
  intent: string; // "buying" | "selling" | "browsing"
  budget: string; // budget key, e.g. "3m-10m"
  timeline: string; // "this-week" | "this-month" | "3-months" | "just-looking"
  financing: string; // "cash" | "pre-approved" | "needs-financing" | "not-sure"
  area: string; // preferred area / free text
  message: string;
}

export interface ScoreResult {
  score: number; // 0–100
  tier: Tier;
  reasons: string[]; // human-readable explanation of the score
  spamFlag: boolean;
}

export interface FollowUp {
  day: number;
  channel: string;
  title: string;
  detail: string;
}

export const INTENT_LABELS: Record<string, string> = {
  buying: "Buying",
  selling: "Selling",
  browsing: "Just browsing",
};

export const BUDGET_LABELS: Record<string, string> = {
  "under-1m": "Under $1M",
  "1m-3m": "$1M – $3M",
  "3m-10m": "$3M – $10M",
  "10m-plus": "$10M+",
};

export const TIMELINE_LABELS: Record<string, string> = {
  "this-week": "This week",
  "this-month": "This month",
  "3-months": "Within 3 months",
  "just-looking": "No timeline",
};

export const FINANCING_LABELS: Record<string, string> = {
  cash: "Cash buyer",
  "pre-approved": "Pre-approved financing",
  "needs-financing": "Needs financing",
  "not-sure": "Not sure yet",
};

const BUDGET_POINTS: Record<string, number> = {
  "under-1m": 10,
  "1m-3m": 25,
  "3m-10m": 40,
  "10m-plus": 50,
};

const INTENT_POINTS: Record<string, number> = {
  buying: 20,
  selling: 15,
  browsing: -10,
};

const TIMELINE_POINTS: Record<string, number> = {
  "this-week": 10,
  "this-month": 5,
  "3-months": 0,
  "just-looking": -5,
};

const FINANCING_POINTS: Record<string, number> = {
  cash: 15,
  "pre-approved": 10,
  "needs-financing": 0,
  "not-sure": -5,
};

// Words that signal a serious buyer ready to move
const SERIOUS_WORDS = [
  "viewing",
  "tour",
  "visit",
  "offer",
  "ready",
  "schedule",
  "appointment",
  "this week",
  "asap",
  "urgent",
  "pre-approved",
  "cash",
];

// Words that signal a tire-kicker
const TIRE_KICKER_WORDS = [
  "just curious",
  "just looking",
  "dream",
  "someday",
  "maybe later",
  "window shopping",
  "out of curiosity",
];

const SPAM_WORDS = [
  "seo services",
  "crypto",
  "guaranteed #1",
  "first page of google",
  "rank #1",
  "bitcoin",
];

function hasAny(haystack: string, words: string[]): boolean {
  return words.some((w) => haystack.includes(w));
}

export function scoreLead(input: LeadInput): ScoreResult {
  let score = 10; // every genuine inquiry starts at 10
  const reasons: string[] = [];
  let spamFlag = false;

  const b = BUDGET_POINTS[input.budget] ?? 0;
  score += b;
  reasons.push(
    `Budget ${BUDGET_LABELS[input.budget] ?? "not given"}: +${b} pts`
  );

  const it = INTENT_POINTS[input.intent] ?? 0;
  score += it;
  reasons.push(
    `Intent "${INTENT_LABELS[input.intent] ?? "not given"}": ${it >= 0 ? "+" : ""}${it} pts`
  );

  const tl = TIMELINE_POINTS[input.timeline] ?? 0;
  score += tl;
  reasons.push(
    `Timeline "${TIMELINE_LABELS[input.timeline] ?? "not given"}": ${tl >= 0 ? "+" : ""}${tl} pts`
  );

  const f = FINANCING_POINTS[input.financing] ?? 0;
  score += f;
  reasons.push(
    `Financing "${FINANCING_LABELS[input.financing] ?? "not given"}": ${f >= 0 ? "+" : ""}${f} pts`
  );

  if ((input.area || "").trim().length >= 2) {
    score += 5;
    reasons.push(`Preferred area specified ("${input.area.trim()}"): +5 pts`);
  }

  const msg = (input.message || "").toLowerCase();

  if (hasAny(msg, SERIOUS_WORDS)) {
    score += 10;
    reasons.push(
      "Serious-buyer language detected (viewing / offer / ready / schedule): +10 pts"
    );
  }
  if (hasAny(msg, TIRE_KICKER_WORDS)) {
    score -= 15;
    reasons.push(
      "Tire-kicker language detected (just looking / someday / dream): −15 pts"
    );
  }

  if (hasAny(msg, SPAM_WORDS)) {
    score -= 30;
    spamFlag = true;
    reasons.push("Spam pattern detected (SEO/crypto/rank guarantee): −30 pts");
  }

  score = Math.max(0, Math.min(100, score));
  const tier: Tier = score >= 75 ? "hot" : score >= 45 ? "warm" : "cold";
  reasons.push(`Total clamped to 0–100 → ${score}/100 (${tier.toUpperCase()})`);

  return { score, tier, reasons, spamFlag };
}

export function followUpSchedule(tier: Tier): FollowUp[] {
  if (tier === "hot") {
    return [
      {
        day: 0,
        channel: "WhatsApp + Email",
        title: "Instant response (60 seconds)",
        detail:
          "Personal-feeling WhatsApp + email within 60 seconds: “Thanks {name} — I've noted your interest. When suits you for a private viewing?”",
      },
      {
        day: 0,
        channel: "Call task",
        title: "Agent call task",
        detail:
          "CRM creates an immediate call task — hot luxury leads get a human call the same day, never just an email.",
      },
      {
        day: 1,
        channel: "WhatsApp",
        title: "Curated matches",
        detail:
          "Agent sends 2–3 hand-picked listings matching budget + area, with a viewing invitation.",
      },
      {
        day: 3,
        channel: "Email",
        title: "Viewing confirmation nudge",
        detail:
          "“Still interested in a private tour this week?” — with calendar link.",
      },
      {
        day: 7,
        channel: "Nurture",
        title: "Market insight",
        detail:
          "One valuable touch (new listing / market note for their area), then long-term nurture.",
      },
    ];
  }
  if (tier === "warm") {
    return [
      {
        day: 0,
        channel: "WhatsApp + Email",
        title: "Instant confirmation",
        detail:
          "Warm, personal confirmation: “Thanks {name} — I'll send matching properties shortly.”",
      },
      {
        day: 2,
        channel: "Email",
        title: "Curated listings",
        detail:
          "Shortlist of properties in their budget range with lifestyle framing.",
      },
      {
        day: 7,
        channel: "Call task",
        title: "Check-in call",
        detail: "CRM creates a call task if there's been no reply.",
      },
    ];
  }
  return [
    {
      day: 0,
      channel: "Email",
      title: "Polite confirmation",
      detail: "“Thanks {name} — we'll be in touch with relevant listings.”",
    },
    {
      day: 14,
      channel: "Email",
      title: "Nurture",
      detail:
        "One market-update email two weeks later, then the lead rests in nurture.",
    },
  ];
}

export function tierBadge(tier: Tier): { label: string; classes: string } {
  if (tier === "hot")
    return {
      label: "🔥 HOT",
      classes: "bg-red-500/15 text-red-300 border-red-500/40",
    };
  if (tier === "warm")
    return {
      label: "🟡 WARM",
      classes: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    };
  return {
    label: "🔵 COLD",
    classes: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  };
}
