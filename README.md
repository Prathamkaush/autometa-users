# Autometa business portal

Independent Next.js application. Run npm ci, npm run lint, npm run typecheck and npm run build
from this folder. For host development run npm run dev with .env.local; it listens on http://localhost:3000.

Start the full Docker stack from ../backend. Current URL: http://localhost:3100.
Register a business, sign in, open the authenticated local mock inbox and verify your email.
Then edit your business profile and create/rotate/revoke server-side API keys.
The development API currently supports GET /api/v1/usage for key verification.

No secret integration key is embedded in browser code. A newly created management key is shown
once for its owner to copy to a server environment. Sessions use HttpOnly cookies through a
server-side proxy; APP_ORIGIN must match this app's public URL.

Workflow execution, customer records, live email and billing are not enabled in this increment.
See ../backend/docs/local-testing.md and ../backend/docs/development-plan.md.

Public pages: the animated landing page is / and the developer integration guide is /docs.
The guide includes five copyable server-side stacks, live key verification and clearly
labeled future event examples. Marketing styles are scoped separately from account UI.

## Avoid duplicate dev servers

Run one host dev server per users folder. The default host command uses port 3000 and
APP_ORIGIN=http://localhost:3000. The Docker frontend remains at localhost:3100 with
its own origin supplied by Compose. These are separate run modes.

If Next.js reports another server for this exact directory, reuse its printed URL or
press Ctrl+C in the original terminal before running npm run dev again. Do not delete
.next/dev/lock while that server is alive. If you need a different host port, pass
--port and update APP_ORIGIN in .env.local to match.
