# agentic-test-demo

End-to-end Playwright tests for the live site [m4to.com](https://m4to.com) ("Rafael Matovelle - Multiverse Portfolio").

## Run the tests

```bash
npm install
npx playwright install chromium
npx playwright test
```

Runs 8 tests against the live site (Chromium, `workers: 1` to stay gentle). HTML report: `npx playwright show-report`.

## Tech stack

- **Playwright + TypeScript** (`@playwright/test`), role-based locators, auto-retrying assertions
- Specs in `tests/e2e/` — landing, navigation, buttons, contact form — with a shared splash-gate fixture

## How it was built

The site is a fully client-rendered SPA (the server returns an empty HTML shell for every path), so tests were written **discovery-first**: scripted live-browser passes (`scripts/discover*.js`) captured the real DOM before any spec was written. Findings and the flow → spec mapping are in [`tests/TEST-PLAN.md`](tests/TEST-PLAN.md).

Safety: the contact form posts to EmailJS — tests intercept all non-GET requests and the config sets `serviceWorkers: 'block'`, so a test run can never send a real message.

Built with a multi-agent workflow in Claude Code (hivemind): researcher → developer → independent reviewer → human UAT.
