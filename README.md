# NGO Fund Platform

Use-case workflow frontend aligned to the supplied actor/use-case diagram.

## Tech Stack

- React 18 + Vite 5
- TypeScript
- Tailwind CSS 3 with custom component classes
- Zustand for mock auth and workflow state
- React Router DOM for route-based navigation
- Recharts for dashboards and analytics
- Lucide React for icons

## Getting Started

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run typecheck
npm run build
npm run preview
```

## What This Frontend Implements

- `Login into the System`
- `Create Account`
- Exact actor model from the diagram:
  - Super Administrator
  - Finance Officer
  - Field Staff
  - Project Manager
  - Executive Director
  - External Auditor
  - Donor User
- Role-specific dashboards for each actor
- A dedicated navigable screen for every use case in the diagram
- Local-state workflow interactions for:
  - account management
  - system settings
  - event logs
  - donor registration
  - fund receipts
  - project allocations
  - bank reconciliation
  - financial reports
  - audit trail management/review
  - expense claims
  - budget review
  - requisition approval
  - compliance verification
  - donor portal and transaction summaries
  - profile updates

## Structure

```text
src/
├── components/    # App shell, forms, tables, charts, UI primitives
├── constants/     # Actor and use-case source of truth
├── pages/         # Auth pages, dashboards, profile, use-case routes
├── store/         # Mock auth state and workflow data
├── types/         # Domain and app model types
└── index.css      # Global theme and reusable classes
```

## Notes

- This is a frontend-only prototype with mock state, not a connected backend application.
- Access control is enforced by actor and use-case route mapping.
- `npm run typecheck` and `npm run build` should both pass.
