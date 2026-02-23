# NGO Fund Platform

Funding Management & Operations System

## Tech Stack

- **Framework:** React + Vite 7
- **Language:** TypeScript + SWC
- **Styling:** Tailwind CSS v4
- **State:** Zustand
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Package Manager:** pnpm v10.30.1

## Prerequisites

- Node.js (v18+)
- pnpm v10.30.1

## Installation

```bash
# Install pnpm (if not installed)
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Install dependencies
pnpm install

# Approve build scripts
pnpm approve-builds

# Setup environment
cp .env.example .env
# Edit .env with your API URL
```

## Development

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint
```

## Project Structure

```
src/
├── assets/        # Images, fonts
├── components/    # Reusable UI components
├── pages/         # Route pages
├── hooks/         # Custom hooks
├── store/         # Zustand state management
├── services/      # Axios API calls
├── types/         # TypeScript types/interfaces
├── utils/         # Helper functions
└── styles/        # Global styles
```

## Key Features

- ⚡ Vite 7 for fast builds
- 🎨 Tailwind CSS v4 (no config file needed)
- 📦 Path aliases (`@/` → `src/`)
- 🔧 ESLint + Prettier
- 🚀 SWC for fast TypeScript compilation

## Notes

- Tailwind v4 uses `@import "tailwindcss"` in CSS (no tailwind.config.js)
- Never commit `.env` to version control
- Use `tsconfig.app.json` for compiler options
