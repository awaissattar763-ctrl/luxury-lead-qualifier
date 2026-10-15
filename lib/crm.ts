// Mock CRM — all data lives in the browser's localStorage. No backend,
// no tracking, no real customer data. All sample leads below are
// fictional and clearly labeled as sample data.

import {
  FollowUp,
  LeadInput,
  ScoreResult,
  Tier,
  followUpSchedule,
  scoreLead,
} from "./scoring";

export interface RunLogEntry {
  ts: string; // ISO timestamp
  stage: string;
  message: string;
}

export interface Lead extends LeadInput {
  id: string;
  score: number;
  tier: Tier;
  reasons: string[];
  spamFlag: boolean;
  followUps: FollowUp[];
  log: RunLogEntry[];
  createdAt: string;
}

const KEY = "llq_leads_v1";

function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  ).toUpperCase();
}

export function buildLead(input: LeadInput, log: RunLogEntry[]): Lead {
  const r: ScoreResult = scoreLead(input);
  return {
    ...input,
    id: uid(),
    score: r.score,
    tier: r.tier,
    reasons: r.reasons,
    spamFlag: r.spamFlag,
    followUps: followUpSchedule(r.tier),
    log,
    createdAt: new Date().toISOString(),
  };
}

export function loadLeads(): Lead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLead(lead: Lead): Lead[] {
  const leads = [lead, ...loadLeads()];
  try {
    window.localStorage.setItem(KEY, JSON.stringify(leads));
  } catch {
    /* storage full or unavailable — demo continues in memory */
  }
  return leads;
}

export function clearLeads(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}

export function logLine(stage: string, message: string): RunLogEntry {
  return { ts: new Date().toISOString(), stage, message };
}

// Clearly-labeled fictional sample data for the admin dashboard.
export function sampleLeads(): Lead[] {
  const now = Date.now();
  const mk = (
    input: LeadInput,
    minutesAgo: number,
    logMsgs: [string, string][]
  ): Lead => {
    const r = scoreLead(input);
    return {
      ...input,
      id: uid(),
      score: r.score,
      tier: r.tier,
      reasons: r.reasons,
      spamFlag: r.spamFlag,
      followUps: followUpSchedule(r.tier),
      log: logMsgs.map(([stage, message]) => ({
        ts: new Date(now - minutesAgo * 60000).toISOString(),
        stage,
        message,
      })),
      createdAt: new Date(now - minutesAgo * 60000).toISOString(),
    };
  };

  return [
    mk(
      {
        name: "James W. (sample)",
        email: "james@whitfieldcapital.com",
        intent: "buying",
        budget: "3m-10m",
        timeline: "this-week",
        financing: "cash",
        area: "Palm Jumeirah",
        message:
          "Cash buyer, ready to move. Interested in a 4-bed villa on Palm Jumeirah — would like a private viewing this week. Please call me asap.",
      },
      42,
      [
        ["webhook", "POST /lead-intake → 200 OK (0.4s)"],
        ["scoring", "Score 100/100 → HOT (budget +40, intent +20, timeline +10, cash +15, area +5, serious language +10, base 10)"],
        ["crm", "Inserted into leads table (Supabase)"],
        ["follow-up", "Scheduled: Day 0 WhatsApp+email, Day 0 call task, Day 1 curated matches, Day 3 viewing nudge, Day 7 market insight"],
        ["alert", "WhatsApp alert to agent — owner notified in ~40 seconds"],
      ]
    ),
    mk(
      {
        name: "Elena R. (sample)",
        email: "elena.r89@gmail.com",
        intent: "buying",
        budget: "1m-3m",
        timeline: "3-months",
        financing: "pre-approved",
        area: "Dubai Marina",
        message:
          "We're looking at 2-bed apartments in Dubai Marina over the next few months, still comparing a few areas.",
      },
      180,
      [
        ["webhook", "POST /lead-intake → 200 OK (0.3s)"],
        ["scoring", "Score 70/100 → WARM (budget +25, intent +20, pre-approved +10, area +5, base 10, timeline 0)"],
        ["crm", "Inserted into leads table (Supabase)"],
        ["follow-up", "Scheduled: Day 0 confirmation, Day 2 curated listings, Day 7 check-in call"],
        ["alert", "Skipped — score below 75, no agent alert"],
      ]
    ),
    mk(
      {
        name: "Dream Homes (sample)",
        email: "offers@dreamhomes.example",
        intent: "browsing",
        budget: "under-1m",
        timeline: "just-looking",
        financing: "not-sure",
        area: "",
        message:
          "Just curious about luxury homes, maybe someday when I win the lottery! We offer seo services guaranteed #1!",
      },
      300,
      [
        ["webhook", "POST /lead-intake → 200 OK (0.3s)"],
        ["scoring", "Score 0/100 → COLD — tire-kicker language (−15), spam pattern (−30), flagged for review"],
        ["crm", "Inserted into leads table (Supabase) with spam flag"],
        ["follow-up", "Scheduled: Day 0 confirmation only, then nurture"],
        ["alert", "Skipped — score below 75, no agent alert"],
      ]
    ),
  ];
}
