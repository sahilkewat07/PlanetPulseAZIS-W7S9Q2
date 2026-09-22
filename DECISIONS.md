# PlanetPulse Product Decisions

PlanetPulse is a single shared demo: it has no login, signup, passwords, JWTs, user model, or protected routes. The backend remains the authority for prescribed emissions calculations, while the client can provide previews for a clearer logging experience.

## DP1 — The Nudge

When the current weekly target is exceeded, PlanetPulse uses `NudgeBanner` to show a friendly heads-up and a constructive, category-specific next step. The message is intentionally non-blocking: people can still log activities and keep learning from the journal. This supports awareness and practical progress rather than shame or punishment.

## DP2 — Absurd Input

PlanetPulse marks obviously high quantities as unusual and asks the person to confirm or correct them before saving. Both the frontend and backend preserve the entered value exactly; neither silently changes, converts, nor discards it. This protects the reliability of shared data while keeping the final decision visible and in the user's control.

## DP3 — The Week

PlanetPulse defines the current week as Monday at 00:00 through Sunday at 23:59:59.999 in the server's local calendar. `getCurrentWeekRange` applies that range to each weekly query, rather than using a rolling seven-day period. Activities are never deleted when the week changes; only the dashboard aggregation naturally begins using the new calendar-week range.
