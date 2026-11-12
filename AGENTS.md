# UI Kit Lab — Agent Instructions

## Project Goal
Build a React application for researching and comparing UI component libraries and design systems for a Persian RTL CRM/ERP application.

This is an R&D project, not a production CRM.

## Core Principles

1. Be evidence-driven. Never claim that a library supports a feature without verifying it.
2. Do not favor a library before completing the comparison.
3. Distinguish native support, official integrations, third-party integrations, custom implementation, and unsupported features.
4. Keep shared business logic and test data independent from UI library implementations.
5. Do not hide meaningful differences between libraries behind an overly generic abstraction.
6. Use identical scenarios and equivalent data when comparing libraries.
7. Never use real customer data or personal information. Use synthetic fixtures only.
8. Persian language, RTL layout, Persian numerals, and Jalali calendar support are important evaluation requirements.
9. Do not fabricate benchmark results, package capabilities, performance numbers, or compatibility claims.
10. Clearly distinguish verified facts, assumptions, and pending investigations.

## Technical Rules

- Use React and TypeScript.
- Use pnpm as the only package manager.
- Follow strict TypeScript practices.
- Prefer small, focused, maintainable components.
- Keep implementations organized by feature and UI kit.
- Avoid unnecessary dependencies and premature abstractions.
- Do not modify global machine configuration.
- Do not install additional dependencies without explaining why they are needed.
- Never manually edit pnpm-lock.yaml.
- Check official documentation when working with library-specific APIs.
- Do not use deprecated APIs unless there is a documented reason.

## Research Rules

When researching a library:

1. Prefer official documentation and official repositories.
2. Record the library version and research date.
3. Record the source URL for important technical claims.
4. Identify limitations and required third-party packages.
5. Do not confuse a UI component library with an admin framework or charting library.
6. Do not assign final scores without evidence.

## Documentation Research Workflow

1. Use Context7 MCP for library and framework documentation research.
2. Resolve the exact library ID and version whenever version-specific documentation matters.
3. Prefer the exact installed version from package.json and pnpm-lock.yaml.
4. If the exact version is unavailable, use the closest compatible version and explicitly disclose the difference.
5. Ask focused documentation questions instead of fetching entire documentation pages.
6. Do not repeat queries for information already retrieved during the current task.
7. Distinguish between official documentation evidence, browser-tested behavior, implementation assumptions, and unverified claims.
8. Use browser testing for visual behavior, CSS isolation, RTL, overlays, and accessibility. Documentation alone is not sufficient to mark these as verified.
9. Do not use Context7 when it adds no value, such as for ordinary TypeScript or React concepts that do not depend on version-specific behavior.

## Implementation Rules

- Shared fixtures must be identical across all UI kit implementations.
- Scenario behavior must remain equivalent.
- Each UI kit should have an isolated implementation.
- Library-specific capabilities should remain visible instead of being silently discarded.
- RTL and localization must be tested in actual rendered components.
- A feature is not complete until it has been tested in the browser.

## Workflow

Before implementing a major feature:

1. Read the relevant documentation in /docs.
2. Explain the proposed approach briefly.
3. Identify relevant dependencies.
4. Implement the smallest useful solution.
5. Run appropriate checks.
6. Report changed files, test results, and remaining issues.

Do not make broad architectural changes without explaining their impact.

## Project Documentation

- docs/PROJECT_BRIEF.md: project objective and scope
- docs/REQUIREMENTS.md: application requirements
- docs/RESEARCH_MATRIX.md: research criteria and comparison
- docs/POC_PLAN.md: proof-of-concept scenarios
- docs/DECISIONS.md: architectural and research decisions
- docs/FINAL_REPORT.md: final R&D findings
