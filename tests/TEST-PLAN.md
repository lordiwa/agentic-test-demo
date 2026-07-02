# m4to.com Playwright E2E Test Plan

Suite runs against the **live production site** `https://m4to.com`. Run with:

```
npx playwright test
```

## Discovery findings

Discovery was done with ad-hoc scripts under `scripts/discover*.js` (kept in the
repo for reference; not part of the test suite) run via `node scripts/discover*.js`
against the live site, before any spec was written.

- **Routing model**: the server returns the *same* empty HTML shell for every
  path (`/`, `/about`, `/projects`, `/contact`, `/robots.txt`, and even a
  nonexistent path all return HTTP 200 with identical shell HTML). This is a
  fully client-rendered SPA with a catch-all fallback — there is no
  server-side routing and no distinct pages to navigate between. All content
  lives on `/` behind client-side state, not separate routes.
- **Splash gate**: on first load the page shows a "SYSTEMS ONLINE" splash
  screen with a single `button "START MULTIVERSE MACHINE"`. No headings,
  links, or forms exist in the DOM until this button is clicked — every spec
  must go through this gate first (handled once in `tests/e2e/fixtures.ts`).
- **No cookie-consent banner** was found on the live site during discovery.
  `fixtures.ts` still includes a defensive `dismissCookieBannerIfPresent`
  helper (best-effort, short timeout, no-op if absent) per the engineering
  brief, in case one appears later (e.g. behind a geo/consent-mode gate).
- **Main content** (after entering): a single long-scroll profile page —
  `h1 "Rafael Matovelle"`, skills, languages, summary, professional
  experience list, and a "Personal Links & Current Projects" section.
- **Persona tab-switcher**: three buttons — "Multiverse Me", "Current
  Universe Me", "API" — sit above the profile. "Multiverse Me" swaps to a
  **randomized alternate persona** (observed "Amateur Dancer" on one
  discovery run and a completely different "Dragon Tamer" persona with its
  own layout on a later test run — the randomization is per-visit, not
  fixed); "Current Universe Me" restores the default identity ("Full Stack
  Engineer @ Software Mind ..."). Because the alternate content is random,
  the spec asserts that the default subtitle disappears (rather than pinning
  exact random copy) and that `h1 "Rafael Matovelle"` stays stable across
  personas. This is the site's primary documented button interaction.
- **External links** (all `target="_blank"`): LinkedIn
  (`linkedin.com/in/rmatovelle`), GitHub (`github.com/lordiwa`), and Remoose
  Interactive (`remoose.com`). These are the only navigational links on the
  page — there is no internal nav to other routes/sections via `<a>` tags.
- **Contact form** ("📡 Send Neural Message" button → "NEURAL LINK
  COMMUNICATION" view): fields are Your Name, Your Email, Subject, Message
  (all required), a "← Back" button, a "Cancel" button, and a "Send Message"
  submit button, plus a reCAPTCHA disclosure.
  - **Submission mechanism**: confirmed via a network-intercepted discovery
    run (`scripts/discover3.js`) that clicking "Send Message" fires
    `POST https://api.emailjs.com/api/v1.0/email/send` (the EmailJS browser
    SDK) with `template_params` containing name/email/subject/message/
    recaptcha_token. **No mailto: link is used.**
  - On a (mocked) 200 response the UI shows heading "Message Sent
    Successfully!" and a "Return to Portfolio" button.
- **Out of scope (per `PROJECT.md` scope-out: "Hidden/easter-egg features
  (deliberately untested)")**: the "Interactive Experiences" / "Current
  Active Projects" buttons that open mini-games (Neural Tetris, Mad Libs,
  Skate Runner, Generative Art Experiments, AI Integration Projects). These
  are self-contained games, not core portfolio flows, and are excluded
  deliberately rather than left flaky.

## Core flow → spec mapping

| Core flow | Spec file | Test(s) | AC |
|---|---|---|---|
| Landing page load + splash gate | `tests/e2e/landing.spec.ts` | title + splash button visible; entering reveals main content | AC1, AC3 |
| External link navigation (LinkedIn/GitHub/Remoose) | `tests/e2e/navigation.spec.ts` | each link opens a `popup` at the correct hostname | AC2, AC3 |
| Persona tab-switcher buttons | `tests/e2e/buttons.spec.ts` | "Multiverse Me" ⇄ "Current Universe Me" swaps visible subtitle | AC3 |
| Contact modal Back button | `tests/e2e/buttons.spec.ts` | Back returns to the main portfolio view | AC3 |
| Contact form submission (safety-constrained) | `tests/e2e/contact-form.spec.ts` | fills form, intercepts/mocks the EmailJS POST so no real email is ever sent, asserts success UI + intercepted request shape | AC3 |

`tests/e2e/fixtures.ts` holds the shared splash-gate entry sequence
(`enteredPortfolioPage` fixture) and cookie-banner dismissal used by every
spec above except the two `landing.spec.ts` tests, which exercise the entry
sequence itself and so drive it explicitly.

## Safety constraint

No test ever lets a real request reach `api.emailjs.com`. `contact-form.spec.ts`
registers a `page.route('**/*', ...)` interceptor before filling or
submitting the form; every non-GET request is captured and fulfilled locally
with a mocked 200 response, then the test asserts on the captured request
shape (recipient endpoint, payload fields) rather than on any real side
effect.
