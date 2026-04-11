# FE Synex App

Frontend web app built with React + Vite.

## Requirements

- Node.js 18+
- npm 9+

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file from template:

```bash
cp .env.example .env
```

3. Update `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

4. Start development server:

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Security Notes

- Do not commit `.env` or any secret files.
- Do not hardcode API keys, tokens, or credentials in source code.
- Use environment variables for API endpoints and sensitive configuration.
- Review pull requests for accidental secret leaks before pushing.
