# Luxury Lead Qualifier (Concept Demo)

**Live demo:** https://awaissattar763-ctrl.github.io/luxury-lead-qualifier/

A polished **concept demo** of an AI buyer-intent qualification pipeline for
**luxury real estate**, built to show a prospective client what happens when
property inquiries are captured, qualified, and followed up automatically —
without losing the human touch high-net-worth buyers expect.

**Important: the web app is a concept demo — the webhook, scoring, CRM,
messages and alerts are all simulated in the browser. No real n8n instance, no
Supabase, no WhatsApp, and no real lead data are involved.** All sample leads
are fictional and labeled as such. Nothing here claims a client, a
testimonial, or a result.

## The problem it answers

In luxury real estate, a $3M buyer inquiring at 11 PM gets the same slow
response as a casual browser — and by morning they're touring with a
competitor. Speed-to-lead decides who wins; qualification decides where agents
spend their time. Most brokerages don't have a lead problem; they have a
follow-up problem.

## What it demonstrates

**Public demo page (`/`)** — the visitor plays a property seeker submitting a
private-viewing inquiry (name, email, intent, budget, timeline, financing,
preferred area, message). One-click presets fill in a 🔥 hot cash buyer, a
🟡 warm browser, or a 🔵 cold/spam example. On submit, the pipeline animates
through five stages:

1. 🏡 **Inquiry Capture** — form → webhook (simulated `POST /lead-intake`)
2. 🧠 **AI Qualification** — transparent rule-based engine, 0–100, with every
   signal shown (budget tier, intent, timeline, financing, area, serious-buyer
   vs tire-kicker language, spam patterns)
3. 🗄️ **CRM Entry** — lead saved to the mock CRM with score, tier and run log
4. 💬 **Automated Follow-up** — a tiered WhatsApp + email sequence: hot buyers
   get an instant response and a same-day agent call task; warm and cold get
   lighter sequences
5. ⚡ **Agent Alert** — only for hot buyers (score ≥ 75); posts a mock
   WhatsApp alert so the agent can call within minutes

The result panel shows the score with its full reasoning, the follow-up
timeline, and the mock WhatsApp alert (or explains why it was skipped).

**Key design principle:** automation qualifies, humans close. The pipeline
never pretends to be the agent — it handles instant response, qualification
and scheduling, then hands every hot buyer to a real human with full context.

**Admin dashboard (`/admin`)** — the broker's view: stats, filterable leads
table with expandable rows, sample data loader. All browser-local
(localStorage).

## Tech

Next.js 15 (static export) + Tailwind CSS 4, deployed to GitHub Pages.
Adapted from the generic `lead-pipeline-automation` demo with luxury-specific
scoring rules, copy, and WhatsApp-first follow-up sequences.
