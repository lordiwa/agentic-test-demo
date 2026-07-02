# Use-Case Suite

**Project:** m4to-playwright-tests
**Generated:** 2026-07-02T10:54:21.501Z

## Primary Use Cases

This manifest designates the primary use cases for this project.
Each use case is covered by one or more spec files listed below.
Tickets must only modify this suite when a primary use case changes
(new, changed, or removed use case) — never one spec per ticket.

### automation

Stack: Playwright (`@playwright/test`) + TypeScript, run with `npx playwright test`.
Full discovery findings and flow mapping: `tests/TEST-PLAN.md`.

- Landing page load + splash gate → `tests/e2e/landing.spec.ts`
- External link navigation (LinkedIn/GitHub/Remoose) → `tests/e2e/navigation.spec.ts`
- Interactive buttons (persona switcher, contact modal Back) → `tests/e2e/buttons.spec.ts`
- Contact form submission (safety-constrained, EmailJS request intercepted/mocked) → `tests/e2e/contact-form.spec.ts`
