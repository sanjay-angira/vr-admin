# Vrindavan Rasa Admin

Standalone Next.js administration panel using the existing admin UI, API services, and authentication flow from `vr-frontend`.

## Requirements

- Node.js compatible with the Next.js version in `package.json`
- `vr-backend` running and reachable from the browser

## Setup

```powershell
Copy-Item .env.example .env.local
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root page redirects to `/admin/dashboard`; unauthenticated users are sent to the admin login.

Set `NEXT_PUBLIC_API_URL` in `.env.local` to the backend API base URL, for example:

```text
NEXT_PUBLIC_API_URL=http://localhost:8080/backend/api
```

## Scope

This project contains the standalone admin routes and their required shared components, API clients, Redux auth state, and static assets. Storefront route pages are not included. Admin page and API changes should be made here going forward.
