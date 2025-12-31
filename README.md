# SPE Exchange Tool

A video game reselling tool with barcode scanning and AI-powered price lookup. Scan items, identify them via AI, calculate profit across platforms, and track inventory.

## Features

- **AI-Powered Scanning**: Use Claude vision to identify video games from photos
- **Barcode Scanning**: Quick lookup via UPC/barcode
- **Multi-Platform Pricing**: Compare prices across eBay, Amazon, and more
- **Profit Calculator**: Calculate fees and shipping costs automatically
- **Inventory Tracking**: Manage your reselling inventory
- **PWA Support**: Install as a mobile app for on-the-go scanning

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- shadcn/ui components
- Zustand (state management)
- Supabase (auth, database, storage)
- Claude AI via Supabase Edge Functions

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/getboring/spe-exchange-tool.git
cd spe-exchange-tool

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Development

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Deployment

This project is configured for automatic deployment to Vercel. Push to `main` to deploy.

## Project Structure

```
src/
  app/           # Page components
  components/    # Reusable UI components
  hooks/         # Custom React hooks
  lib/           # Business logic, utilities
  stores/        # Zustand state stores
  types/         # TypeScript type definitions
supabase/
  migrations/    # Database schema migrations
  functions/     # Edge functions (AI scanning)
```

## Price Format

All prices are stored as integers in cents (e.g., 3500 = $35.00). Use the utility functions in `src/lib/utils.ts`:
- `toCents()` - Convert dollars to cents
- `toDollars()` - Convert cents to dollars
- `formatCents()` - Format cents as currency string

## License

MIT License - see [LICENSE](LICENSE) for details.
