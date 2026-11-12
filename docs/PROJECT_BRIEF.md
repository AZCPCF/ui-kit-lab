# Project Brief — UI Kit Lab

## Objective

Build an interactive React playground to evaluate UI component libraries for the Hirad CRM/ERP project.

The application must allow developers and stakeholders to inspect the same UI scenarios across multiple libraries.

The goal is to make an evidence-based technical recommendation, not simply choose the library with the most attractive default appearance.

## Main Experience

The playground should support:

- Selecting one UI kit and viewing its implementation.
- Switching between UI kits without changing the underlying data or scenario.
- Comparing multiple UI kits side by side.
- Switching between evaluation scenarios.
- Inspecting localization, RTL, theming, and component behavior.

## Initial Candidates

Primary proof-of-concept candidates:

1. Mantine
2. Ant Design
3. shadcn/ui

Secondary candidates for research:

- Material UI (MUI)
- PrimeReact

Related tools such as Refine and Tremor must be classified separately when appropriate. They should not automatically be treated as equivalent UI component libraries.

## Initial Scenarios

- Customer management table
- Search, filtering, sorting, and pagination
- Create and edit customer forms
- Customer details dialog or drawer
- Select and autocomplete
- Jalali date selection
- Dashboard widgets
- Light and dark themes

## Constraints

- React and TypeScript.
- Vite.
- pnpm.
- Persian-first experience.
- RTL support.
- Synthetic and reproducible data.
- Independent implementation for each candidate.

## Out of Scope for the Initial POC

- Production backend integration.
- Authentication and authorization.
- Real customer data.
- Production deployment.
- Complete CRM functionality.

## Success Criteria

The result should make it possible to compare the candidates fairly, document their limitations, reproduce the experiments, and provide a technically defensible recommendation.
