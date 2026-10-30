# PillNote Web

**English** | [한국어](README.ko.md)

A React website that introduces PillNote through animated walkthroughs captured from the actual Flutter app. The public site is https://pillnote.app/, and its installation guide links to the Android APK on GitHub Releases.

## Getting started

```sh
npm install
npm run dev
```

Local URL: http://127.0.0.1:5173/

### Selecting a page element to request changes

React Grab is enabled automatically on the development server. Hover over the element you want to change, press `⌘C` (Mac) or `Ctrl+C` (Windows/Linux), then paste the copied content into a Codex chat along with your requested change. The selection includes the code locations of the element and its related components.

React Grab is loaded only in development and is excluded from production builds. See the [official React Grab documentation](https://github.com/aidenybai/react-grab) for usage details.

```sh
npm test
npm run build
npm run preview
```

`npm run build` runs TypeScript checks and creates the production build. Static output is written to `dist/`.

## Presentation

Website typography uses role-based `rem` and viewport-based `clamp()` tokens. Headings, body text, buttons, menus, and supporting text scale continuously from mobile to large screens, with body text staying at 16–18px under default font settings. Browser font-size and zoom preferences are respected, while text within app captures retains its original proportions. Download buttons consistently use a single downward arrow.

There are no dividers between sections. Visitors can scroll freely without vertical scroll snap. The introduction, demo, download, and usage-guide sections have a minimum height of 100dvh without subtracting the header height; header spacing is reserved inside each section. Anchor navigation fills the screen from the top with the section background, and the desktop demo phone also accounts for viewport height. Sections expand when content exceeds the viewport, such as the longer mobile introduction or expanded instructions. Wheel, touch, and keyboard events are not intercepted, and there are no separate internal scrolling areas.

The opening screen combines a centered introduction with a light-gray feature-demo stage. The actual app screen appears only once, looping through the complete walkthrough at 1.2× speed. Play, pause, replay, and seek controls are not shown on the opening screen. Selecting a feature resumes playback from that scene. On mobile, the feature menu is fixed below the header, and selecting a feature scrolls the demo into view. The phone is displayed at up to 340px wide on desktop and 280px on mobile. Playback pauses offscreen and in hidden tabs. With reduced motion enabled, the selected feature is shown without autoplay. Current design guidance is in the root `DESIGN.md`, and applied styles are in `src/reference.css`.

Seven features can be selected on the opening screen: today's doses → add medication → dose history → my medications → scheduled reminders → caregiver connections → nearby pharmacies. Selection instructions appear above the menu, and the selected feature has a subtle background. When selection changes manually or through autoplay, the selection background moves over 320ms, and the explanatory sentence fades and slides in over 360ms. The phone continues the existing app transition. Selection-background positioning adjusts to language and viewport changes, and the feature menu wraps onto multiple lines on mobile. The previous `#tour` URL also points to this section.

Playback duration, preview labels, and screen-source captions are not displayed around the demo. With reduced motion enabled, feature selection changes immediately. Download and installation instructions sit side by side without cards, icons, or step numbers. Installation notes can be expanded. Privacy, data information, and deletion instructions live at `/privacy.html` rather than in the main page body, with links from the footer and FAQ. Previous `#privacy` and `#data-deletion` links also lead to the new page.

The main page arranges key features (`#features`), APK installation instructions (`#download`), and frequently asked questions (`#about`) as scrollable sections. The separate data-information page uses normal scrolling and supports direct links to deletion instructions (`/privacy.html#data-deletion`). Both pages support Korean and English. The installation guide starts with the download button and supported platform, followed by three installation steps. The app screens on the website are a presentation of real captures, not an interactive app that visitors can type into.

## Product fact-checking and maintenance

- As checked on October 13, 2026, the latest public release was [v0.2.2](https://github.com/kimrasng/pillnote/releases/tag/v0.2.2), with the attachment `pillnote-v0.2.2.apk`. The website uses `/releases/latest` rather than hardcoding a version string. For each new release, check that the supported platforms and described features are included in the public APK. Do not describe new screens in the development repository as already released.
- Data information was checked against the mobile app's `LocalMedicationStore`, `SnapshotSyncService`, `SessionStore`, `ApiClient`, `DevicePrivacy`, `Pushalarm`, `Menu`, and `Distanc`, along with the backend's account-deletion, invitation, and push implementations. Medication data is stored on the device and synchronized with the server when signed in. A feature that shows caregivers the complete dose history was not confirmed; push messages ask them to check medication status.
- No public policy document was found in the repository. The current `/privacy.html` provides **privacy and data information** about verified implementation details; it is not a finalized privacy policy. Confirm the responsible entity, actual service providers, processing regions and contracts, retention periods by data type, and the scope of backups and logs retained after deletion before adding a formal policy and footer policy link. Do not publish unverified policy statements or placeholders.
- External integrations found in the code include Resend email, Firebase FCM/APNs push notifications, OpenStreetMap map tiles, and medication and public-pharmacy lookups from Korea's Ministry of Food and Drug Safety and public data services. The server storage implementation includes Cloudflare Workers/D1 paths. These alone do not establish actual operating contracts or cross-border processing terms.
- Backend code includes cleanup after 30 days for operational aggregates, 7 days for email, failure, and inspection events, and 30 days for inactive signed-in devices. Account deletion removes account-linked data and authentication email records, but there is no evidence that all operational events, external service logs, and database backups are immediately deleted. Do not publish code-level cleanup rules as a finalized retention policy for the entire service.

Search input and cursors, screen push/pop transitions, tab and button responses, time pickers, dose checks, caregiver invitations, entry and acceptance, pharmacy lists, and detail sheets use intermediate frames rendered by the Flutter engine, selected according to the demo playback position. The demo uses real Flutter iOS screen transitions suited to the iPhone. Dose checks add a drawn checkmark and a small spring response. The next-dose card retains its position and label while its content, height, and progress bar change, then moves on to my medications without scrolling through the completed list. The canvas and date update in the same screen refresh, and both ends of transitions are decoded in advance to prevent intermediate-frame flicker. The lock screen is an iPhone-style web notification example: it transitions directly without turning the screen off and shows lower notification cards, unlocking, and app-window expansion. Dose reminders open today's doses; caregiver notifications open caregiver connections. Playback completes each action at a scheduled time, and seeking through the full demo lets visitors revisit earlier steps. Transition and touch distances use screen-height units so speed does not vary with scene length. Popups and backgrounds are rendered together in Flutter; the web layer does not fade or move the entire screen again. Dates follow the movement, occlusion, and dimming of the same frame. Visitors cannot click or type directly into the app screens.

A single device continues through each demo on desktop and mobile. The page uses normal document flow, and the mobile walkthrough presents explanations and app screens sequentially in the body. With reduced motion enabled, intermediate animations are skipped in favor of completed states.

Feature descriptions stay fixed within each scene, while app animations convey button presses, input, and screen transitions. The demo does not use presenter-style narration or operation captions that change at each step.

The demo uses the time-based timeline in `src/demo.ts`, reusing actual app actions from `playback.ts`. If image decoding is delayed, the clock pauses until the frame is ready. Even after a long processing delay, time advances by at most 32ms at once. The full demo retains the 400ms empty-focus pause for caregiver invitation email entry. Coordinates in `scroll.ts` are internal coordinates for selecting app captures and do not intercept page scrolling.

Visitors choose Korean or English from the header dropdown, which shows a globe icon and the current language. On mobile, language selection is inside the menu. Text remains in place: the old text is wiped away from left to right over 160ms, then the new text is revealed in the same direction over 200ms. Start delays of up to 140ms run from the topmost visible text to the bottom. Only text spans are clipped, preserving containers, dividers, and icons. Rapid reselection clears pending transitions and applies the last choice. With reduced motion enabled, switching is immediate. The choice is saved in the browser and restored after refresh. Before paint, switching restores the onscreen position of the text being read. Document scroll coordinates are adjusted so readers stay on the same content even when Korean and English paragraph heights differ. Introduction text, menus, FAQ, accessibility text, web notification examples, document language, and metadata change together. Actual app captures and the dates within them retain the Korean originals because the app supports Korean only.

The page keeps its scrollbar and native wheel, touch, and keyboard scrolling. The mobile menu closes when an item is selected, the visitor touches outside it, Escape is pressed, or focus moves outside the menu. Feature buttons support Tab navigation and Enter/Space selection, which jumps directly to the selected feature's opening screen. With reduced motion enabled, the selected feature's screen appears without autoplay.

App captures and intermediate rendered frames are 780×1688 pixels, with a logical screen size of 390×844. The existing iPhone 18 Pro WebP mockup shows the device bezel, side buttons, and Dynamic Island while preserving capture proportions. A web status bar and home indicator are placed in the capture's SafeArea. Mockup attribution and license records are in [design/device/README.md](design/device/README.md).

## Design guidelines

The design uses white backgrounds, neutral grays, ink-colored text and buttons, and blue accents from the app UI. The opening screen places a short product introduction beside the actual app demo. All features can be selected within one walkthrough section. Autoplay stops offscreen, in hidden tabs, and under reduced-motion preferences. Backgrounds and layout draw on productivity-app landing pages that use generous spacing and center the actual product screens. No images or copy from reference sites are used.

Font sizes and weights are managed by role in `src/design-system.css`: body text 16px, supporting text 14px, labels 16px, component headings 24px, and header and narrow-screen menus 16px. The website uses locally served Pretendard Variable, while app captures retain their original font. Only section headings and opening-screen copy scale with viewport size. Detailed guidance is in [design/DESIGN_SYSTEM.md](design/DESIGN_SYSTEM.md). Supporting website text is never reduced below 14px, even on mobile. Text inside real app captures keeps the app's original size and screen proportions.

Search states before entry, during focus, and after input are captured at the same mobile density so the screen outside the input field does not shift.

## Captures and release status

- Captures use actual Flutter pages, the app theme, Pretendard fonts, and navigation icons. UI and animations, including text and cursors during input, are real Flutter renders. Only the current date is overlaid using the original font and per-frame coordinates; no generated images are used.
- Dose schedules and quantities are illustrative examples. Tylenol uses an actual public search API response and an identification photo from Korea's Ministry of Food and Drug Safety. Checkmarks and the quantity change from 14 to 13 tablets were captured through real result selection, time addition, registration, and dose-recording code.
- The website does not connect to storage, authentication, medication search APIs, location, email, push services, or device notifications. It has no separate demo account or input forms.
- Caregiver screens capture the actual app flow using isolated demonstration accounts: invitation → pending → acceptance by another account → connected. No invitations or push notifications were sent to real people.
- Lock-screen notifications illustrate delivery using actual app/server titles and bodies. Dates update to the visitor's current date. Dates inside app captures also show the current date in the same original font.
- Maps and lists capture 15 real pharmacies near Seoul Station and the details of Central Pharm Pharmacy. The website does not request map tiles. [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright) appears beside the screen.
- Download buttons navigate to the APK installation steps at `#download`. Latest-release buttons in the installation guide and product status link to the [latest public release](https://github.com/kimrasng/pillnote/releases/latest), while history links open [PillNote Releases](https://github.com/kimrasng/pillnote/releases).

Detailed capture sources, reproduction code, and image hashes are in [design/capture/README.md](design/capture/README.md).

## Key files

- `src/App.tsx`: Opening screen, feature demos, full walkthrough, usage information, and download links
- `src/LandingHero.tsx`: Combined opening screen and feature walkthrough
- `src/DemoPlayer.tsx`, `src/useDemoPlayback.ts`, `src/demo.ts`: Time-based playback, pausing, and scene navigation
- `src/landing.css`, `src/demoCopy.ts`: New page layout and Korean/English demo copy
- `src/PhoneFilm.tsx`: Fixed-aspect-ratio phone and scroll-based capture display
- `src/film.ts`: Reversible capture composition and touch-indicator calculations
- `src/DoseCheckFeedback.tsx`, `src/feedback.ts`: Dose-check completion and screen-power feedback
- `src/motion.ts`: Poses for page transitions, list scrolling, popups, and notifications
- `src/useWeightedScroll.ts`: Previous scroll-control implementation (not used by the current page)
- `src/playback.ts`: Per-action start/end coordinates, thresholds, and playback durations
- `src/pacing.ts`: Shared transition and touch distances in screen-height units
- `src/typing.ts`: Korean text composition and cursor behavior based on scroll coordinates
- `src/scroll.ts`: Introduction and scene scroll-coordinate calculations
- `test/`: Regression checks for pauses, reverse scrolling, scene boundaries, and aspect-ratio calculations
- `src/story.ts`: Per-scene capture and scroll ranges
- `src/i18n.ts`: Korean and English introduction copy
- `src/ProductInfo.tsx`, `src/productCopy.ts`: Korean/English installation, data, and deletion information, plus feature descriptions
- `src/LocaleProvider.tsx`: Language selection, persistence, and document metadata
- `src/styles.css`: Page layout and reduced-motion settings
- `src/design-system.css`: Role-based font sizes, weights, line heights, buttons, and mobile-menu guidelines
- `public/images/app/`: Real Flutter app PNG captures
- `design/capture/`: Capture code, sources, and image hashes
- `design/QA.md`: Verification records
- `design/v1/`, `design/v2/`: Archived earlier designs

Developer: **Dohyun Kim** · **dohyun.kim@pillnote.app**
