# Requirements

## 1. Project Context

The target environment is a Persian CRM/ERP application.

The supplied Hirad design proposal describes the following context:

- Approximately 10 internal users.
- 385 organizations.
- 1,395 contacts.
- Persian RTL interface.
- Jalali calendar.
- Quick access to contact details, with an interaction target below 3 seconds.

These figures are context for the POC. All generated records must be synthetic.

## 2. Functional Requirements

### FR-01: UI Kit Selection
Users must be able to select an available UI kit.

### FR-02: Scenario Selection
Users must be able to switch between evaluation scenarios.

### FR-03: Single View
Users must be able to inspect one implementation at a time.

### FR-04: Comparison View
Users should be able to compare implementations side by side.

### FR-05: Shared Data
All implementations must use the same underlying synthetic dataset.

### FR-06: Customer Table
The customer scenario should demonstrate:

- Columns
- Sorting
- Search
- Filtering
- Pagination
- Row actions
- Empty state
- Loading state

### FR-07: Forms
The form scenario should demonstrate:

- Text inputs
- Required fields
- Validation errors
- Select
- Autocomplete
- Date selection
- Submit and cancel behavior

### FR-08: Customer Details
The details scenario should demonstrate a dialog, drawer, or equivalent detail presentation.

### FR-09: Theme
Implementations should be evaluated in light and dark modes where supported.

## 3. Localization Requirements

### LR-01
The primary interface language must be Persian.

### LR-02
The primary layout direction must be RTL.

### LR-03
Persian numerals and number formatting must be evaluated.

### LR-04
Jalali calendar support must be evaluated.

### LR-05
For every date picker, document whether Jalali support is native, official integration, third-party integration, or custom implementation.

## 4. Non-Functional Requirements

- Maintainable React and TypeScript code.
- Reproducible comparisons.
- Consistent datasets and scenarios.
- Reasonable runtime performance.
- Accessible keyboard interactions where supported.
- Documented package dependencies.
- No misleading performance comparisons.

## 5. Open Questions

- Which browsers must be supported?
- Is mobile responsiveness a mandatory evaluation criterion?
- Is accessibility a formal acceptance requirement?
- Should the final POC include all five candidates or only the three primary candidates?
- What exact interaction should be measured for the below-three-second contact access target?

These questions must remain open until clarified or explicitly decided.
