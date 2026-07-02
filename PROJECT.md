---
name: m4to-playwright-tests
type: other
created_at: 2026-07-02T10:54:21.417Z
schema_version: 1
---

# m4to-playwright-tests

## Description
Playwright E2E test suite for the m4to.com portfolio site

## Target users
site owner (personal portfolio maintainer)

## Primary use cases
- automation

## Success criteria
All buttons and link navigation on m4to.com are covered by passing Playwright tests, plus one end-to-end contact form submission test, runnable locally via npx playwright test

## Problem
m4to.com (a personal portfolio site) has no automated test coverage, so regressions in navigation, buttons, or the contact form can go unnoticed after changes.

## Goals
- Every button on the site is exercised and behaves correctly
- All link navigation is verified (correct destinations, no broken links)
- A form submission test covers the contact form end-to-end
- Tests are authored with Playwright MCP assistance and run locally via npx playwright test

## Scope (in)
- Button interaction tests across all public pages
- Link/navigation tests
- One form submission test
- TypeScript + @playwright/test, run against the live site m4to.com

## Scope (out)
- Hidden/easter-egg features (deliberately untested)
- Visual/screenshot regression testing
- CI pipeline setup (local runs for now)
