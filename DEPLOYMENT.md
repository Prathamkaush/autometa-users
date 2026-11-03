# Independent Vercel deployment

This Next.js app includes its server-only API proxy in lib/platform-proxy.ts. It needs
no sibling backend folder to build or run. The backend is deployed separately on the VPS.

- Repository with all three apps: Vercel Root Directory = users.
- Repository containing only this app: Vercel Root Directory = repository root (.).
- Framework = Next.js; install = npm ci; build = npm run build; output = default.
- Node.js = 22.x.

Configure Production environment variables:

```dotenv
INTERNAL_API_BASE_URL=https://roxodeal.com/api/v1
APP_ORIGIN=https://YOUR-USERS-PRODUCTION-DOMAIN
```

Use the exact browser origin without a trailing slash. Set APP_ORIGIN to a custom domain
if that is the address visitors use. A different preview deployment needs its own matching
origin. Redeploy after changing Vercel environment variables. These variables are server-side;
no NEXT_PUBLIC_ variables or secret integration API keys are needed by this app.

Update WEB_ORIGIN in the VPS backend/.env to the users production origin and restart the
API/worker with the backend Compose files. Test registration, verification and login after
the public API health URL returns JSON. The proxy preserves route allowlists, origin checks,
role checks, request timeouts and HttpOnly/Secure session cookies.

Maintainers: the checked-in proxy copies in users and admin share the policy in
backend/packages/web-proxy/src/index.ts. Apply policy fixes to all copies together; frontend
deployments must include the checked-in local copy rather than a sibling-folder import.
