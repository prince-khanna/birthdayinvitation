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

The front end reads `VITE_RSVP_ENDPOINT` at build time and submits a guest name, invitation token, and camera photo as multipart form data. Without that variable, it runs in local preview mode and does not deliver responses remotely. The invitation token is accepted from the private guest URL, kept in session storage, and removed from the address bar after the page loads.

The `supabase/` directory contains:

- a migration for a private `rsvps` table and private `rsvp-selfies` bucket;
- an Edge Function that validates a private invitation token by SHA-256 digest, stores the selfie, and inserts the RSVP.

The production function allows the GitHub Pages origin and contains only one-way digests of accepted invitation codes. The codes themselves must never be committed. Add the deployed function URL as the GitHub repository secret `VITE_RSVP_ENDPOINT`.

Guests should use the compact private link format:

```text
https://prince-khanna.github.io/birthdayinvitation/?i=SHORT_CODE
```

The legacy `?invite=...` format remains supported so previously shared links continue to work.

## GitHub Pages

The included workflow builds and deploys `dist` whenever `main` is pushed and attempts to enable Pages automatically. GitHub Pages must be supported for the repository’s visibility and account plan; otherwise make the repository public or upgrade the plan, then rerun the workflow.
