# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Durable invitation decisions

- Use only photographs from the Google Photos album named `anvika 1st`.
- Combine the warm watercolor storybook feel of concept 1 with the playful berry picnic layout of concept 3; discard the lavender cloud concept.
- Open the experience by tapping a berry-shaped invitation and start the supplied `riverbend-serenade.mp3` on desktop and mobile; loop it while scrolling and keep persistent pause and mute controls.
- Do not include guest-facing share or social controls.
- RSVP collects only the guest name and a required camera selfie; do not ask for attendee count.
- RSVP photos must be private and visible only to Anvika's family.
- GitHub Pages is the static host; production RSVP delivery is expected to use a protected backend endpoint such as a Supabase Edge Function.
- Photo memories keep the original first photograph, followed chronologically by the supplied monthly milestone photographs for months 1–11. Use optimized, preloaded variants for fast mobile switching.
- Use the supplied portrait of Anvika wearing pink sunglasses in her stroller as the main hero photograph, edited into the warm watercolor berry-storybook setting.
- Maintain a Sites deployment alongside GitHub Pages and use its clean production URL as an alternate invitation share link.
- Use a plain invitation URL with no invite code; guests can RSVP without a token.
