# Design QA

- Source visual: `/Users/prince/.codex/generated_images/019f6c9d-c633-7cc1-bb96-0d587d8f8022/exec-7f75a1c4-9291-4043-bb9b-2b1ee997bf7a.png`
- Implementation capture: `/Users/prince/git/birthdayinvitation/design-implementation-mobile.png`
- Combined comparison input: `/Users/prince/git/birthdayinvitation/design-comparison.png`
- Viewport and state: 390 x 844 responsive viewport, invitation opened, music playing, carousel advanced once, RSVP name entered without a photo.

## Full-view comparison evidence

The approved concept and the stitched implementation capture were normalized to the same display width and inspected together in `design-comparison.png`. The implementation preserves the concept's cream paper, watercolor berry border, strawberry opening interaction, berry-red and leaf-green hierarchy, portrait-led hero, photo memories, illustrated map, three-step RSVP, and botanical footer. The implementation is intentionally taller on mobile so all 16 untouched album photographs and the real controls remain legible and touch-friendly.

## Focused-region comparison evidence

- Hero/opening: inspected at 390 x 844 after opening. The real album portrait, strawberry invitation, typography, border density, and music control match the approved direction without clipping.
- Memories carousel: inspected with the first portrait and the landscape frame. Both original frames remain complete inside the carousel; the face-safe `contain` treatment adds letterboxing instead of cropping.
- Event details: inspected in `/Users/prince/git/birthdayinvitation/design-mobile-event.png`. Time, venue, address, illustrated map, and enabled Maps link fit without horizontal overflow.
- RSVP: inspected in `/Users/prince/git/birthdayinvitation/design-mobile-rsvp.png`. All three steps stack cleanly; the camera action is prominent; no attendee-count or sharing control is present; the fixed music player remains usable.

## Interaction and regression checks

- Opening the berry starts the generated background melody and reveals the invitation.
- Before opening, the page is scroll-locked at the berry cover; scrolling begins only after the berry is pressed.
- Music play/pause and mute controls remain fixed while scrolling.
- Carousel next control changes the active photograph across all 16 untouched album images.
- RSVP name accepts input; submit remains disabled until a required photo is present.
- Camera permission was not granted during QA; the camera now reports a clear permission/unavailability message and exposes a direct device-photo fallback that does not depend on an asynchronous picker launch.
- Google Maps link resolves to the supplied destination URL.
- Initial AudioContext resume blocked the opening transition during the first pass. Playback was changed to resume non-blockingly; retest confirmed the invitation opens and the player reports `Playing as you scroll`.

## Findings

- P0: none.
- P1: none.
- P2: none.
- P3: the final camera-permission experience should be checked once on the phone that will be used to preview the invitation.

final result: passed

## Birthday game extension - 2026-08-05

- Source visual truth: `/Users/prince/git/birthdayinvitation/tmp/design-qa/source-invitation.png`
- Implementation screenshot: `/Users/prince/git/birthdayinvitation/tmp/design-qa/game-index-desktop-final.png`
- Combined comparison input: `/Users/prince/git/birthdayinvitation/tmp/design-qa/invitation-game-comparison.png`
- Viewport: 1280 x 720 CSS px at device scale 1. Source and implementation captures are both 1280 x 720 px; no density normalization was required.
- State: invitation hero after opening compared with the new Game index hero at its initial state.

### Full-view comparison evidence

The existing invitation and the Game index were opened side-by-side in `invitation-game-comparison.png`. The Game index reuses the same Fraunces and Nunito hierarchy, berry-red and leaf-green tokens, cream paper, watercolor botanical artwork, dashed organic framing, fixed music control, and generous storybook spacing. The Game screen is an intentional extension rather than a 1:1 copy: its mission-count seal replaces the invitation portrait while preserving the same large two-part hero composition.

### Focused-region comparison evidence

- Team picker: `/Users/prince/git/birthdayinvitation/tmp/design-qa/game-index-desktop.png` confirms readable team numbering, icon hierarchy, card spacing, and clear tap affordances.
- Mission card: `/Users/prince/git/birthdayinvitation/tmp/design-qa/challenge-desktop.png` confirms the team badge, event grouping, and approval-gated riddle action remain readable at desktop size.
- Mobile Game index: `/Users/prince/git/birthdayinvitation/tmp/design-qa/game-index-mobile.png` confirms the 390 x 844 responsive layout has no horizontal overflow and preserves the hero hierarchy.
- Mobile photo mission: `/Users/prince/git/birthdayinvitation/tmp/design-qa/challenge-mobile-final.png` confirms the supplied Anvika portrait, route tabs, back control, mission title, and fixed music player fit at 390 x 844 with no horizontal overflow.
- Solved riddle: `/Users/prince/git/birthdayinvitation/tmp/design-qa/riddle-solved-desktop.png` confirms the shared ribbon-tree instruction is visually separated from the riddle and is only visible after a correct answer.

### Required fidelity surfaces

- Fonts and typography: Fraunces remains the display face and Nunito remains the UI/body face; weights, line heights, and mobile wrapping match the invitation hierarchy.
- Spacing and layout rhythm: 1180 px paper width, responsive section padding, organic radii, card spacing, and fixed controls are consistent with the invitation. Desktop and 390 px mobile layouts have no horizontal overflow.
- Colors and visual tokens: existing `--berry`, `--berry-dark`, `--leaf`, `--leaf-dark`, `--paper`, and `--cream` tokens are reused; contrast remains clear in navigation, cards, forms, and the success reveal.
- Image quality and asset fidelity: the existing botanical border, berry sprig, hero portrait, and music asset are reused directly. Team symbols come from the existing Phosphor icon library; no placeholder or imitation artwork was introduced.
- Copy and content: all ten supplied challenges and ten distinct riddles are represented. Riddles and answer validation stay server-side in Supabase; the final ribbon-tree instruction appears only after both parent approval and a correct answer.

### Interaction and regression checks

- Teams 3, 5, 6, and 8 no longer expose animal choices, singing styles, charade words, or tray contents on their guest-facing pages. Team 10 renders the family-led Slow-Motion Birthday Party and does not ask Anvika to give instructions.
- The game shell uses the invitation's plain peach outer gutters. The botanical border no longer repeats behind the 1180 px paper to create mismatched floral side strips at desktop widths.
- With `birthday_game_settings.enabled` set to `false`, the Invitation/Game navigation is absent on the invitation, Game index, and direct team page; `/game/` and `/baby-olympics/` still render normally.
- Browser-rendered checks covered `/game/`, `/baby-olympics/`, `/baby-olympics/riddle/`, wrong-answer feedback, correct-answer reveal, and `/copy-anvika/` at mobile width.
- Supabase approval checks covered an unapproved mission button, a directly opened locked riddle URL, a temporarily approved Team 1 riddle, server-side correct-answer validation, and the final instruction. Team 1 was reset afterward and the database finished with zero approved teams.
- The built production deep link `/baby-olympics/riddle/` rendered without console errors.
- All 21 production routes returned HTTP 200: one Game index, ten challenge routes, and ten riddle routes.
- `npm run build` and `npm run build:sites` both completed successfully.

### Comparison history

- First mobile mission pass: P2 - the back link lost contrast against a dense botanical area.
- Fix: gave the back link a cream pill background, border, subtle shadow, and blur treatment.
- Post-fix evidence: `challenge-mobile-final.png` shows a readable, clearly tappable back control without changing the surrounding composition.

### Findings

- P0: none.
- P1: none.
- P2: none after the back-link fix.
- P3: none.

final result: passed
