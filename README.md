# Anvika’s Berry First Birthday

A playful, mobile-friendly first-birthday invitation with a berry-opening reveal, an original background melody, all 16 untouched photographs from Anvika’s album, event details, and camera-based RSVP.

## Local development

```bash
npm install
npm run dev
```

## Event details

The invitation is set for Sunday, 9 August 2026 at 11:00 AM at Hofreiter BeerenCafé, Savitsstraße, 81929 München-Bogenhausen.

## RSVP delivery

The front end reads `VITE_RSVP_ENDPOINT` at build time and submits a guest name and camera photo as multipart form data. Without that variable, it runs in local preview mode and does not deliver responses remotely.

The `supabase/` directory contains:

- a migration for a private `rsvps` table and private `rsvp-selfies` bucket;
- an Edge Function that accepts requests from the approved invitation origin, stores the selfie, and inserts the RSVP.

The production function allows the approved invitation origins. Add the deployed function URL as the GitHub repository secret `VITE_RSVP_ENDPOINT`.

Guests can RSVP from the plain invitation URL:

```text
https://prince-khanna.github.io/birthdayinvitation/
```

## Birthday game approvals

The Game tab uses the `game-team-status` Supabase Edge Function. A private master switch controls whether the Game navigation is visible, and each team's riddle has its own approval gate.

To show or hide the entire Game experience:

1. Open **Table Editor → birthday_game_settings**.
2. Set the `birthday_game` row's `enabled` value to `true` to show the Invitation/Game navigation, or `false` to hide it.

The master switch controls navigation visibility only. `/game` and all direct team URLs continue to work while it is off. Each team's riddle stays in the private `game_team_approvals` table until that team is approved.

To approve a completed mission in Supabase:

1. Open **Table Editor → game_team_approvals**.
2. Find the team's `team_slug`.
3. Set `approved` to `true` and save.
4. Ask the team to tap **Mission complete - check approval** again.

Set `approved` back to `false` to lock that team's riddle again. The front end uses the deployed birthday-project function by default; `VITE_GAME_STATUS_ENDPOINT` can override its URL for another environment.

## GitHub Pages

The included workflow builds and deploys `dist` whenever `main` is pushed and attempts to enable Pages automatically. GitHub Pages must be supported for the repository’s visibility and account plan; otherwise make the repository public or upgrade the plan, then rerun the workflow.
