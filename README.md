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

The front end reads `VITE_RSVP_ENDPOINT` at build time and submits a guest name, invitation token, and camera photo as multipart form data. Without that variable, it runs in local preview mode and does not deliver responses remotely.

The `supabase/` directory contains:

- a migration for a private `rsvps` table and private `rsvp-selfies` bucket;
- an Edge Function that validates a private invitation token, stores the selfie, and inserts the RSVP.

Configure the function secrets `INVITATION_TOKEN` and `ALLOWED_ORIGIN`, deploy it, and add its URL as the GitHub repository secret `VITE_RSVP_ENDPOINT`.

## GitHub Pages

The included workflow builds and deploys `dist` whenever `main` is pushed and attempts to enable Pages automatically. GitHub Pages must be supported for the repository’s visibility and account plan; otherwise make the repository public or upgrade the plan, then rerun the workflow.
