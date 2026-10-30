# PillNote landing design

## Reference and scope

Reference: a landing page with a centered introduction, high-contrast headings,
pill-shaped buttons, and neutral gray demonstration surfaces, inspected in a
browser at 1440px and 390px on 2026-10-23. This is a visual adaptation, not a copy of its product,
claims, logos, illustrations, or service interface.

Runtime observations: 64px header; white hero with centered text; 30px
regular lead and 64px/600 main heading on desktop, 20px and 36px on mobile;
heading tracking -0.045em; ink rgb(16,15,9), secondary rgb(86,83,75);
section surfaces rgb(246,246,245); 999px CTA radius; 200ms button transitions;
large section headings and generous spacing rather than full-height snapping.

## PillNote adaptation

Keep the existing local Pretendard font, teal capsule logo, actual app captures,
language switch, download destinations, and privacy page. Restore the existing
photographic iPhone device asset, including its hardware details. Do not draw a
replacement phone in CSS. Do not show playback controls in the landing hero.

The hero is a centered lead, headline, short description, one installation CTA,
and a neutral Android availability badge. The gray product stage pairs feature
selection and its description with a real phone; on mobile these stack with
a single horizontally scrolling feature row below the phone. Mobile uses
16px gaps, a 24px stage gutter, 44px feature targets and a proportionally sized
phone with clearance above the feature row. Selection without playback controls keeps the animation running.
Reduced-motion users retain static chapter selection.

## Tokens

- Ink #100f09; secondary #56534b; muted surface #f6f6f5; border #e7e6e2.
- CTA hover #302e27; focus uses the existing blue focus outline.
- Header 64px, page gutter 24px mobile and 6vw desktop.
- Hero lead 20–30px/400, main 36–64px/600, heading line-height 1.12.
- Section heading 30–48px/600; body retains existing readable text tokens.
- Spacing 8, 12, 16, 24, 32, 48, 64, 96px.
- Buttons 48–52px high, pill radius, 200ms background/transform feedback.

## Components and states

Use existing `LocaleText`, `LanguageSwitch`, `DemoPlayer`, `PhoneFilm`,
`DownloadGuide` and native disclosure elements. Buttons retain hover and keyboard
focus states. Feature buttons expose aria-pressed and a muted selected surface.
FAQ contains only sign-in, dose reminder troubleshooting and caregiver alerts,
with short answers. Installation details and privacy stay at their existing
destinations instead of being duplicated in FAQ.

## Responsive and motion

Installation help and FAQ disclosures use a 280ms cubic-bezier(0.22,0.8,0.24,1)
height reveal with opacity and a matching chevron rotation. Native details/summary
keyboard behavior is preserved. CSS intrinsic-size interpolation enhances supported
browsers; other browsers retain native disclosure behavior. Reduced motion disables
these transitions. Interrupted transitions retarget from their current position.

Header reference measurements: initial container max-width 1400px, height 64px,
horizontal padding 4vw, three columns 1fr/auto/1fr with a 24px gap; centered
15px/400 links with 8px 14px pill padding and 4px gap. CTA is 40px high with
14px/500 text and no arrow. The scrolled header contracts to 1040px by 56px,
floats 10px from the top, and uses a 76% muted-surface backdrop with 16px blur,
1.4 saturation, and a pill silhouette. The transition lasts 600ms with
cubic-bezier(0.22,0.8,0.24,1), background/shadow 400ms. Mobile uses a 38px circular
two-line menu toggle and a panel 12px from either side, 74px from the header top,
with 20px radius, 12px padding and 3px row gap. The floating mobile container
is 52px high and 12px from either side. Keep PillNote's real logo and destinations.

Desktop: centered introduction; two-column gray demonstration; two-column
installation guide; narrow three-question FAQ. Mobile: centered introduction,
stacked demo and installation, 44px minimum touch areas. The document is the
only vertical scroll container, without vertical scroll snapping.
Introduction, product demonstration, installation and FAQ each have a minimum
height of 100dvh, without subtracting the header height. The header overlays
each section's background, with header clearance inside its top padding.
The introduction begins behind the header at the top of the document.
Anchor navigation aligns each section with the viewport top.
Long content grows
naturally instead of being clipped or put in a nested scroller. The footer
scrolls normally without a snap point. Existing capture
animation and off-screen suspension are preserved. Reduced motion bypasses
automatic playback and interface transitions.

Language selection uses a native select with a globe, the current language and
a chevron instead of two always-visible language buttons. The shared component
retains localized labels, browser language preference storage and document
metadata updates across the landing page, mobile navigation and privacy guide.

Download content uses a 1400px maximum width, a narrow introduction column and
a wider installation column. Installation sentences are concise and may wrap
naturally on small screens, never clipped or forced onto one overflowing line.
Mobile uses a single column, full-width download actions, numbered installation
steps with neutral hairline separators, and no platform caption below the action.
All primary download actions use the same Download glyph.
The installation section's download button uses a compact 48px height, 16px
horizontal padding, an 8px icon gap and 1.25 line-height. Keep 24px between
the introduction and its action, retaining the full-width button on mobile.
Header navigation follows the page content: Overview links to #top, Features
links to the actual demonstration at #features, and FAQ links to #about.
The right-hand Download action links to #download. Desktop and mobile share
these same destinations; the #tour alias also opens the demonstration.
At phone widths the app bar uses a 20px brand, a 12px column gap and 12px button
side padding so the brand, download action and menu fit a 320px viewport.
