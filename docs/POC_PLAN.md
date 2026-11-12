# Proof of Concept Plan

## Objective

Implement equivalent CRM scenarios using the primary UI kit candidates and compare their real behavior.

## Shared Data

Create synthetic fixtures representing:

- 385 organizations.
- 1,395 contacts.

All UI kit implementations must consume the same data source.

No implementation may use a separate or manually altered dataset to make its results look better.

## Scenarios

### Scenario 1: Customer Management

Demonstrate:

- Data table
- Search
- Filters
- Sorting
- Pagination
- Empty state
- Row actions

### Scenario 2: Customer Form

Demonstrate:

- Text fields
- Select
- Autocomplete
- Validation
- Jalali date picker
- Submission feedback

### Scenario 3: Customer Details

Demonstrate:

- Dialog or drawer
- Contact information
- Organization information
- Quick access interaction

### Scenario 4: Theme and Localization

Demonstrate:

- Persian language
- RTL layout
- Persian number formatting
- Light mode
- Dark mode
- Jalali calendar

### Scenario 5: Dashboard

Demonstrate a small dashboard with equivalent summary widgets.

Charting libraries must be recorded separately from the UI kit itself.

## Comparison Modes

The application should support:

1. Single mode: one selected implementation.
2. Compare mode: two or more implementations side by side.

## Fair Comparison Rules

- Use the same synthetic data.
- Use equivalent user tasks.
- Keep scenario scope consistent.
- Record when a candidate needs extra dependencies.
- Record implementation effort.
- Do not hide library-specific limitations.
- Do not compare a fully customized implementation against another library's untouched defaults without documenting that difference.

## Validation

For each scenario:

1. Run the application.
2. Perform the same interaction in every candidate.
3. Verify RTL behavior.
4. Verify localization and date behavior.
5. Record limitations and implementation notes.
6. Capture screenshots where useful.

## Completion Criteria

The POC is ready for evaluation when the primary candidates can run the same scenarios and the comparison results can be reproduced.
