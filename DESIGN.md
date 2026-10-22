---
name: "手機終結者 · Tilt Rodeo"
description: "A tactile desert rodeo for a phone-controlled balance game."
colors:
  sky: "#234b4e"
  sand: "#e8bb70"
  paper: "#fff0cc"
  ink: "#30261e"
  muted: "#d4c6a8"
  yellow: "#ffd76b"
  red: "#b43826"
  safe-zone: "#629675"
  surround: "#102d30"
  deck: "#183c3e"
  touch-surface: "#285052"
  score-backing: "#183c3ef2"
  icon-surface: "#193e41"
  icon-hover: "#326267"
  button-hover: "#ffe49a"
  quiet-ink: "#e1cfaa"
  warning-ink: "#842717"
  bull: "#743b24"
  rider-shirt: "#db8739"
  rider-vest: "#194d52"
  rider-pants: "#285c74"
  rider-hat: "#e7ba73"
  bandana: "#bb3d2d"
typography:
  display:
    fontFamily: "Rye, serif"
    fontSize: "96px"
    fontWeight: 400
  logotype:
    fontFamily: "Rye, serif"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-.025em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Noto Sans TC\", \"PingFang TC\", sans-serif"
    fontSize: "23px"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-.025em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Noto Sans TC\", \"PingFang TC\", sans-serif"
    fontSize: "13px"
    lineHeight: 1.65
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Noto Sans TC\", \"PingFang TC\", sans-serif"
    fontSize: "11px"
    fontWeight: 600
  button:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Noto Sans TC\", \"PingFang TC\", sans-serif"
    fontSize: "17px"
    fontWeight: 800
  score:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Noto Sans TC\", \"PingFang TC\", sans-serif"
    fontSize: "40px"
    fontWeight: 800
    lineHeight: 1.15
rounded:
  control: "12px"
  notice: "8px"
  meter: "8px"
  marker: "4px"
  score: "10px"
  deck-top: "24px"
  round: "50%"
spacing:
  xs: "6px"
  sm: "12px"
  md: "18px"
  lg: "24px"
  wide: "40px"
components:
  button-primary:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    width: "100%"
  button-primary-hover:
    backgroundColor: "{colors.button-hover}"
  button-resume:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    width: "100%"
  button-secondary:
    textColor: "{colors.quiet-ink}"
    width: "100%"
  button-icon:
    backgroundColor: "{colors.icon-surface}"
    textColor: "{colors.paper}"
    rounded: "{rounded.round}"
    width: "44px"
    height: "44px"
  button-touch:
    backgroundColor: "{colors.touch-surface}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
  balance-meter:
    height: "16px"
    rounded: "{rounded.meter}"
  warning-cue:
    backgroundColor: "{colors.paper}"
    textColor: "#822715"
    rounded: "{rounded.notice}"
    padding: "10px 18px"
  score-compact:
    backgroundColor: "{colors.score-backing}"
    textColor: "{colors.paper}"
    rounded: "{rounded.score}"
    padding: "6px 9px"
---

# Design System: 手機終結者 · Tilt Rodeo

## Overview

**Creative North Star: "The Live County-Fair Rodeo Ring"**

The live county-fair rodeo ring is the visual north star: a teal desert horizon, ochre arena, walnut bull, and orange-shirted rider with a red bandana. Large, readable silhouettes and brief Traditional Chinese instructions make the relationship between phone tilt and rider balance visible.

This documents the user-authorized v0.2 art refinement of the playable prototype. Original Blender-built, articulated characters replace the initial procedural cast: 52 bull meshes and 66 cowboy meshes, exported as separate GLBs. Rounded, smooth character surfaces and a closer three-quarter view give the rider more presence; the faceted desert remains simple. A stacked, self-hosted Rye logotype and gold action sit above and below the arena, with clear Chinese control copy on a deep teal deck.

Character provenance is retained in `models/build_rodeo.py`, `models/rodeo_characters.blend`, and `models/geometry-audit.json`; the runtime loads `assets/models/bull.glb` and `assets/models/cowboy.glb`. `docs/blender-characters.png` is a Blender render; the other PNGs in `docs/` are browser validation captures, not runtime raster assets. The reference Cowboy Jumper cover is not used as a game asset. Rye is supplied locally with its OFL license. Gameplay and sensor handling are unchanged by this art revision.

v0.2 art finish review disposition: **ship**, with no material visual fixes remaining. The sole follow-up issue, right-side fall clipping, is resolved. `docs/landings.png` records complete left and right landing endpoints at 390×844, 320×568, and 844×390; the intermediate camera logic was inspected in code, not verified through a full motion recording. `docs/VALIDATION.md` records browser viewport and interaction checks; these do not establish physical-device behavior. Real-device gyro permission, tilt direction, and feel remain unverified. Loading-failure handling is present in code but has not been exhaustively tested by interrupting individual asset requests.

**Key Characteristics:**

- The arena leads; controls remain compact and reachable.
- Warm sand and dark teal establish place; cream text and gold actions establish hierarchy.
- Balance, warning copy, and rider lean communicate the same state.
- Articulated, rounded characters sit behind restrained interface surfaces.

## Colors

Late-afternoon desert materials meet a deep teal control deck. Frontmatter is normative: interface colors come from `styles.css`; main character colors come from the Blender source and match the exported GLB materials before lighting and tone mapping.

### Primary

- **Deck / Sky:** deep teal separates reachable controls from the atmospheric arena horizon.
- **Yellow:** the gold entry, calibration, retry, and resume actions, stacked logotype, level label, held touch state, and ordinary focus outline.
- **Paper / Ink:** cream interface text on teal and dark text on gold; cream notices retain dark copy.

### Secondary

- **Sand:** the retained stylesheet palette token; rendered arena geometry uses its own ochre material values in `scene.js`.
- **Safe Zone / Red:** the center target and danger track. The unused CSS green variable is not the visible safe-zone token.
- **Bull / Rider Shirt / Rider Vest / Rider Pants / Rider Hat / Bandana:** walnut hide, orange shirt, teal vest, blue denim, pale ochre hat, and red scarf define the Blender cast. Procedural fallback materials remain separately defined in `scene.js` and should not be mistaken for the main cast's palette.

### Neutral

- **Surround / Score Backing:** dark outer page and near-opaque compact score blocks.
- **Muted / Quiet Ink:** warm light supporting copy and secondary actions on the deck.
- **Warning Ink:** recoverable error copy on paper.
- **Icon Surface / Icon Hover / Touch Surface / Button Hover:** distinct resting and interaction surfaces.

**The Signal Agreement Rule.** Color never carries the balance state alone: the marker position, directional instruction, and rider lean must agree.

## Typography

Rye (`assets/fonts/Rye-Regular.ttf`, `font-display: swap`, serif fallback) gives the two-line TILT / RODEO logotype its western character. The system sans-serif stack carries Chinese copy, scores, labels, and controls.

- **Display:** the countdown uses Rye at the display token's size.
- **Logotype:** the base role uses tight leading and tracking; wide layouts increase it to 32px, compact height uses 20px, and short landscape uses 18px. The Chinese subtitle is 11px with .10em tracking, or 12px in wide layouts.
- **Headline:** the base state heading uses the headline token; playing uses 18px, compact height uses 20px, and pause uses 32px.
- **Body / Label:** hints use body; balance captions use label. Compact-height hints use 12px. Loading status uses 12px.
- **Button:** entry, retry, calibration, and resume share the button role. Secondary actions use 12px underlined text.
- **Score:** elapsed time uses tabular numerals and -.04em tracking; wide layouts use 52px, compact height 29px, and short landscape 28px. Best time, units, and time label use 11px. The level label uses 12px, reduced to 11px at compact height.

**The Functional Type Floor Rule.** Keep all functional interface text at 11px or larger, including compact and landscape labels.

## Layout

The game fills `100svh`, is centered at a maximum width of 1100px, and has a base minimum height of 580px. The arena flexes above a non-shrinking deck. The top header is absolute; independent score blocks sit beneath it and leave the center open. The deck overlaps the arena by 18px, has rounded upper corners, and uses 24px side padding, a broad balance meter, concise state copy, and one primary action with a quieter fallback when applicable.

At widths of at least 700px and heights above 560px, header and score offsets become 40px, the deck content is centered in a 460px column, and the arena minimum height becomes 360px. At heights of at most 720px, the game minimum height is 560px, header and score side offsets become 18px, typography and spacing tighten, the arena minimum height becomes 240px, and the mode note is hidden. Score blocks are present at every size; compact height reduces their padding from 9px 12px to 6px 9px. Wide layouts use 12px 16px unless the compact-height rule applies.

Short landscape (height at most 560px) uses an arena plus a 320px right control column, a game minimum height of 340px, square deck corners, and no deck handle. Header and bottom deck padding respect safe areas in portrait. The pause overlay centers a content block up to 360px wide.

The camera uses a 36-degree vertical field of view and a three-quarter offset. Framing adapts to arena aspect ratio and reserves headroom for the HUD. Normal play keeps the camera fixed; a fall shifts the target toward the union of the bull and rider bounding boxes and widens the view when needed, using an 8.6-unit minimum framing width at the end of the fall. The falling rider's bounding box is clamped above the ground, preserving a grounded landing.

**The Clear Center Rule.** Keep the rider's central silhouette open: compact score backings belong to the separate left and right score groups, never their full-width parent.

## Elevation & Depth

Perspective, warm directional sunlight, a warm rim light, hemisphere light, soft cast shadows, and teal fog create arena depth. Blender characters use smooth shading and mostly rough materials, with a small metallic brass accent; the procedural environment and fallback cast remain faceted. The UI uses tonal separation and restrained shadows: no glass blur or decorative card stack.

Primary and resume actions use `0 6px 16px #071e2055`; the deck uses `0 -8px 24px #102a2d26`; the cue uses `0 5px 14px #00000026`; the balance pin uses `0 2px 5px #0005`; countdown text uses `0 5px 15px #0000004d`. Score backings are translucent without blur. The pause scrim is `rgba(17,46,48,.97)`.

Primary and resume controls transition background and transform over .15s and press downward by 2px. Reduced-motion preference disables CSS transitions, removes countdown text shadow, and suppresses scene bounce and dust. Essential rider lean/fall feedback, fall reframing, and some ambient head/limb movement remain.

## Shapes

Controls use gently rounded corners; the portrait deck has a broader upper curve and a small centered handle. Notices use the notice radius, score blocks use the score radius, and icon controls are circular. The meter has a dark border, a central green band covering 40% of its width, a center line, outer ticks, and a cream pin outlined in ink. The pin travels from 2% to 98% of the track.

The 118-part Blender cast uses rounded bodies, curved horns, articulated limbs, a broad brimmed hat, layered clothing, and small facial details. Named pivots preserve head, tail, leg, torso, raised-arm, and scarf movement. The low-poly arena supplies contrast without competing with the rider.

## Components

- **Primary and resume actions:** full width, at least 56px high (primary becomes 50px at compact height), gold background, ink text, a pale gold hover, paper focus outline, and downward active press. Disabled actions use .45 opacity.
- **Secondary action:** transparent, underlined, at least 44px high, with warm light text that becomes paper on hover. Pause restart uses paper text.
- **Icon controls:** 44px circles with 22px inline SVGs, a fine cool border, brighter teal hover, and gold focus outline. Muted sound uses tan; pause is disabled outside active play/countdown.
- **Touch controls:** paired teal buttons, at least 88px wide and 58px high, with arrows and paper text. Held/active switches to gold with ink text. They appear during touch-mode play.
- **Balance meter:** a 16px bordered track, safe zone, center line, ticks, and 10px-wide pin. Danger changes the track to red; grip percentage and directional copy reinforce the signal.
- **Score groups:** independent elapsed-time and best/level blocks remain separate at every viewport size.
- **Warning cue / countdown:** a paper cue with dark red copy announces the next buck; a Rye numeral counts down before play. Neither replaces controls or score.
- **Loading and fallback:** a deck-colored status says the rider is entering while both GLBs load. Entry actions remain disabled until loading settles. The runtime swaps both characters together only after required pivots are found. A failed load retains the procedural cast, reports that fallback, and makes play available. WebGL initialization failure has a separate paper alert and disables entry.
- **State message / errors / pause:** ready, connecting, calibration, countdown, playing, falling, and finished reuse one message area. Recoverable errors use a paper notice with dark red copy. Pause uses a deep teal scrim, clear reason, resume, and restart actions.

All buttons have a 3px visible focus outline with a 4px offset; gold actions use paper and other controls use gold. Focus, held, disabled, danger, and warning states remain distinct.

## Do's and Don'ts

### Do:

- Do preserve the implemented teal, sand, cream, gold, and walnut relationship.
- Do use Rye for the stacked English logotype and countdown; keep Chinese instructions in the system sans-serif.
- Do keep separate score backings around each score group so the center stays open.
- Do pair the danger color with directional copy and a visible moving marker.
- Do preserve safe-area padding, visible focus rings, 44px or larger action targets, and the 11px functional type floor.
- Do retain the editable Blender source, named animation pivots, and paired character-loading fallback.

### Don't:

- Don't present the reference cover as approved art or as a shipped game asset.
- Don't replace the playable arena with promotional panels or dashboard cards.
- Don't expand the score backing into a full-width strip over the rider.
- Don't describe reduced motion as disabling all scene movement; bounce and dust are suppressed while essential feedback remains.
- Don't describe browser viewport checks or simulated sensor tests as physical-phone gyro validation.


## v0.3 gameplay extension
The visual tokens and layout remain unchanged. The Chinese product title is now 手機終結者. The ready headline names the 30-second objective; the live timer names its 30-second limit. Each six-second wave is labeled in the HUD. Every real impulse has an honest directional warning; visual feints are separately labeled and do not apply force. Recovery phases prompt the player to return to centre. Won is a first-class terminal state, with a gold heading, success tone, isolated versioned best score, and retry. Normal control reaches full force at ±12°; excessive tilt yields no extra advantage. Buck animation is amplified and adds a short bounded camera kick while the HUD stays still; reduced-motion disables the kick and extra bounce. Existing v0.2 art review does not constitute an independent review of this gameplay extension.


## v0.4 audio extension
The header adds a 44px music-only toggle next to the existing global sound and pause controls. The music toggle's pressed state means music is off. Actual voice playback displays a short Chinese subtitle on the arena floor; an active cue moves above it to avoid overlap. Base visual tokens and gameplay are unchanged. The eight generated Algenib character clips and their Tai-lo prompts are local assets; no browser key or TTS call. Original synthesized electronic music increases 124→164 BPM over five waves. A shared master compressor/gain routes FX, voice, and music; speech ducks music, priorities prevent overlap, stage announcements occur once per round, and pause cancels delayed clips. audio-preview.html exposes individual lines and stage tempos for audition. This audio extension was verified with unit tests and browser loading/playback states, not by a new independent visual review or native-speaker pronunciation certification.


## v0.5 motion extension
The bull turns to a more legible diagonal silhouette. A torso-centred rig adds bounded roll, pitch and leap; the rider seat follows the rig while torso counter-rotation expresses balance recovery. Animated hoof bounds lift the rig above the sand. HUD remains still, and reduced motion suppresses leap/camera kick and scales roll to 22%. Motion is presentation-only; physics and audio are unchanged. Browser fixture checks cover both buck and landing directions at three viewport sizes. This extension has no new independent art review or physical-phone certification.
