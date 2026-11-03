import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import MarketingShell from '../../components/marketing/MarketingShell';
import CodeExamples, {
  CopyBlock,
} from '../../components/marketing/CodeExamples';
import {
  environmentExample,
  eventPayload,
} from '../../lib/integration-examples';
import '../marketing.css';
export const metadata: Metadata = {
  title: 'Developer integration guide | Autometa',
  description:
    'Integrate contact-form email automation with a small server-side API call. Node.js, NestJS, Next.js, PHP and cURL examples.',
};
const sections = [
  ['quickstart', 'Quickstart'],
  ['environment', 'Environment & URLs'],
  ['authentication', 'Authentication'],
  ['examples', 'Copyable examples'],
  ['event-contract', 'Event payload'],
  ['reliability', 'Reliability & idempotency'],
  ['errors', 'Errors & rate limits'],
  ['localhost', 'Local testing'],
  ['billing', 'Prepaid test credits'],
  ['security', 'SMTP & webhooks'],
];
function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="docs-section" id={id}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
export default function Docs() {
  return (
    <MarketingShell>
      <div className="docs-topbar">
        <div className="astro-container">
          <span>DEVELOPERS / INTEGRATION GUIDE</span>
          <span>Email automation / Local development</span>
        </div>
      </div>
      <div className="astro-container docs-grid">
        <aside className="docs-toc">
          <span>ON THIS PAGE</span>
          <nav aria-label="Documentation contents">
            {sections.map(([id, title]) => (
              <a href={'#' + id} key={id}>
                {title}
              </a>
            ))}
          </nav>
        </aside>
        <main className="docs-main" id="main-content">
          <header className="docs-hero">
            <p className="astro-kicker">
              YOUR CODE. YOUR STACK. ONE CONNECTION.
            </p>
            <h1>Your contact form. Automated email.</h1>
            <p>
              Add a small server-side call after your existing handler saves
              successfully. Keep your current database, authentication, frontend
              and success response.
            </p>
            <div className="docs-hero-meta">
              <span className="astro-chip">Events available</span>
              <span className="astro-chip">Mock + Gmail SMTP</span>
              <span className="astro-chip chip-muted">
                Telegram / AI / inbound: planned
              </span>
            </div>
          </header>
          <Section id="quickstart" title="Your first acknowledgement">
            <ol>
              <li>
                <a href="/register">Create a business workspace</a>, sign in and
                verify your account. Mock mode uses the protected local test
                inbox. Gmail mode sends verification through the email queue,
                subject to the local recipient allowlist.
              </li>
              <li>
                In <a href="/dashboard">your dashboard</a>, open{' '}
                <strong>API keys</strong> and create a development key. Copy its
                secret immediately; it is shown once.
              </li>
              <li>
                Open <strong>Email automation</strong>, enable acknowledgements,
                choose event triggers and save your template and daily cap.
              </li>
              <li>
                Set the API URL and key in your existing application's server
                environment. Verify the key, then choose{' '}
                <strong>Submit an event</strong> below.
              </li>
              <li>
                Call the helper after your handler saves. Map its ID and
                original submission timestamp from your saved record. Include
                transactional permission only when the customer requested a
                response.
              </li>
              <li>
                Expect HTTP 202. Refresh Email automation to inspect the event
                decision, message status and attempt history.
              </li>
            </ol>
            <div className="docs-callout">
              Local defaults use mock email. Gmail test mode permits only the
              addresses configured in the platform's EMAIL_TEST_RECIPIENTS.
              Never use real customer addresses for mock fixtures.
            </div>
          </Section>
          <Section id="environment" title="Server environment and API URLs">
            <CopyBlock code={environmentExample} label="Server environment" />
            <p>
              Restart your application after saving its environment. PHP needs
              its framework or server environment loader. Secrets must never use
              a NEXT_PUBLIC_ prefix or appear in browser requests.
            </p>
            <p>
              From another Docker container, localhost refers to that container.
              Use the API service name on a shared private network, or
              host.docker.internal:4100 for an application running in Docker
              Desktop. Production must use your deployed HTTPS API URL and a
              production key.
            </p>
          </Section>
          <Section id="authentication" title="Use a server-side API key">
            <p>
              Send Authorization: Bearer YOUR_KEY. Tenant identity comes from
              the key; do not pass a tenant ID. Keys cannot access the owner
              dashboard or admin management routes. Development keys work in
              development; production keys work in production. Suspended
              businesses, expired trials and revoked keys are rejected.
            </p>
            <p>
              Each business can have ten active keys. Rotate and revoke keys in
              the dashboard. Keep the secret in your server environment.
            </p>
          </Section>
          <Section id="examples" title="Copy an example for your stack">
            <p>
              The helpers have a three-second timeout, never expose credentials
              to the browser and return a failure result so your original
              handler can retain its success response. Map the sample field
              names to your existing saved record; no schema migration is
              required in your application.
            </p>
            <CodeExamples />
          </Section>
          <Section id="event-contract" title="Event payload and receipts">
            <CopyBlock code={eventPayload} label="event.json payload" />
            <p>
              Replace the sample recipient, reference and occurredAt before
              submitting. Use an ISO 8601 timestamp from the original
              submission, within the last 30 days and no more than five minutes
              in the future. Retries must reuse that same timestamp.
            </p>
            <p>
              Supported events: lead.created, contact.created, inquiry.received
              and feedback.submitted. POST /leads accepts the same payload
              without event and uses lead.created; POST /feedback uses
              feedback.submitted.
            </p>
            <p>
              Acknowledgements require emailTransactional: true and
              communicationEvidence with basis customer_request, source, a
              reference matching externalEventId and the original occurredAt. A
              preference flag alone does not authorize email. This endpoint does
              not send marketing campaigns.
            </p>
            <CopyBlock
              label="Example HTTP 202 response"
              code={JSON.stringify(
                {
                  success: true,
                  eventId: 'generated-uuid',
                  status: 'accepted',
                  duplicate: false,
                  email: {
                    id: 'message-uuid',
                    status: 'QUEUED',
                    errorCode: null,
                  },
                  decision: 'EMAIL_QUEUED',
                },
                null,
                2,
              )}
            />
            <p>
              HTTP 202 confirms durable acceptance. It does not mean email
              delivery. An event can be accepted with email: null when
              automation is disabled, its trigger is disabled, permission is
              missing or the address is suppressed. Test restrictions can create
              a SUPPRESSED message.
            </p>
            <p>
              GET /events/:eventId with the same server key returns its decision
              and current email status. Another tenant cannot read that receipt.
            </p>
            <h3>Optional five-minute follow-up</h3>
            <p>
              When the platform operator makes follow-ups available, enable the
              follow-up option in Email automation. Each new acknowledgement can
              schedule one follow-up five minutes after provider acceptance. The
              due time and status appear in the dashboard and event receipt.
              Both messages count toward your email quota.
            </p>
            <p>
              Cancel a pending follow-up from its dashboard row, suppress the
              recipient, or disable follow-ups when the inquiry is resolved.
              Replies are not tracked yet, so they do not automatically cancel
              this message. Existing accepted acknowledgements are not
              backfilled.
            </p>
          </Section>
          <Section
            id="reliability"
            title="Keep your existing application working"
          >
            <ul>
              <li>
                Validate and save with your existing handler first. Call
                Autometa outside your database transaction.
              </li>
              <li>
                Use a stable externalEventId and Idempotency-Key of 8–128
                letters, numbers, dots, colons, underscores or hyphens. The
                examples use lead.created:YOUR_RECORD_ID.
              </li>
              <li>
                The same tenant, environment and event identity with the same
                payload returns the original event. A changed payload under the
                same key or external ID returns 409. Concurrent retries create
                one event and one email.
              </li>
              <li>
                Keep the original handler's success response on timeouts,
                connection errors, 429 or 5xx. Never roll back the customer's
                successful submission.
              </li>
              <li>
                A best-effort call may lose an event. If eventual forwarding is
                required, use an existing durable application queue or outbox
                with bounded backoff and the original immutable payload.
              </li>
            </ul>
            <p>
              Inside Autometa, event, contact, email and outbox records commit
              together. BullMQ processes sends asynchronously. Definite
              temporary SMTP failures use exponential retry backoff; ambiguous
              SMTP outcomes become UNKNOWN and are never automatically resent.
            </p>
          </Section>
          <Section id="errors" title="Errors and limits">
            <div className="docs-table-wrap">
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Meaning</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      '200',
                      'Key check or receipt succeeded',
                      'Inspect response.',
                    ],
                    [
                      '202',
                      'Event accepted',
                      'Check receipt or dashboard later.',
                    ],
                    [
                      '400',
                      'Invalid payload or missing idempotency key',
                      'Fix the request.',
                    ],
                    [
                      '401',
                      'Invalid, revoked or wrong-environment key',
                      'Check server configuration.',
                    ],
                    ['403', 'Inactive business', 'Review account status.'],
                    [
                      '404',
                      'Receipt unavailable for this key',
                      'Check the event ID and environment.',
                    ],
                    [
                      '409',
                      'Idempotency payload conflict',
                      'Reuse the original payload.',
                    ],
                    [
                      '429',
                      'Request rate or daily event quota exceeded',
                      'Back off; keep the original event.',
                    ],
                    [
                      '503 / timeout',
                      'Service unavailable',
                      'Preserve your existing handler result.',
                    ],
                  ].map((row) => (
                    <tr key={row[0]}>
                      {row.map((value) => (
                        <td key={value}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Default ingestion limits: 60 requests per minute per key, 60 per
              minute per tenant and 1,000 accepted events per tenant per UTC
              day. Default email limits: 10 global and 5 per tenant per minute,
              100 global and 20 per tenant per UTC day. The operator can
              configure lower caps; the dashboard cap cannot exceed the platform
              allowance.
            </p>
            <p>
              Email quotas reserve one slot per unique message before sending.
              Retries reuse its reservation. Failed or uncertain attempts retain
              the reservation conservatively; mock and Gmail accounting are
              separate.
            </p>
          </Section>
          <Section id="billing" title="Prepaid usage credits (test mode)">
            <p>
              Open Billing &amp; credits in your dashboard to purchase Razorpay
              test credits. Current test packs are ₹100, ₹500 and ₹1,000. An
              acknowledgement costs ₹1 and its optional follow-up costs another
              ₹1. Ordinary mock emails and account verification/reset emails are
              free. These are local test prices, not final production prices.
            </p>
            <p>
              The server verifies the payment signature, captured status, order,
              amount and currency before adding credits. Use Check status if a
              completed checkout has not updated your balance. Payment retries
              and duplicate callbacks never add the same top-up twice.
            </p>
            <p>
              Each paid email reserves its quoted price before sending.
              Acceptance by the email provider finalizes the charge; this does
              not confirm delivery. A known failed send releases its credits. An
              uncertain send keeps the reservation for review, with no automatic
              resend.
            </p>
            <p>
              At insufficient balance the event can still return HTTP 202, while
              its email enters WAITING_CREDITS. Your existing contact handler
              should retain its normal success response. Pending work rechecks
              credits approximately once per minute and can resume after a
              top-up, subject to expiry, suppressions and sending limits.
              Previously quoted emails retain their original price.
            </p>
          </Section>
          <Section id="localhost" title="Run and test locally">
            <CopyBlock
              label="Docker startup"
              code={
                'cd backend\nnpm ci\nnpm run dev:configure\ndocker compose build api backups\ndocker compose up -d --wait --no-build'
              }
            />
            <p>
              Preserve your saved backend/.env credentials. Development
              configuration defaults to mock providers. Local addresses: users
              on localhost:3100 in Docker (3000 when run directly), admin on
              3200 and API on 4100. Use the actual ports from your saved
              environment.
            </p>
            <CopyBlock
              label="Mock integration test"
              code={'cd backend\ndocker compose exec api npm run test:email'}
            />
            <p>
              The integration test starts a sample external contact handler,
              checks asynchronous acceptance, duplicate protection, tenant
              isolation and continued application success during an API outage.
              It does not change another project.
            </p>
            <p>
              For Gmail, set MAIL_PROVIDER=gmail and the SMTP fields privately
              in backend/.env. Keep EMAIL_TEST_MODE=true and set
              EMAIL_TEST_RECIPIENTS to addresses you control. Recreate API and
              worker containers after changing environment values. Run npm run
              smtp:verify before an authorized test send.
            </p>
          </Section>
          <Section id="security" title="SMTP, suppressions and webhooks">
            <p>
              All tenants use one platform sender matching SMTP_USER and
              MAIL_FROM. Templates cannot choose arbitrary From addresses. SMTP
              credentials stay on the backend. Raw SMTP errors and passwords are
              never returned to clients.
            </p>
            <p>
              SMTP_ACCEPTED means Gmail accepted an outbound submission. It is
              not a delivered-message confirmation. Gmail SMTP alone does not
              provide inbound reply events or reliable bounce webhooks. Inbound
              processing is disabled in this phase and requires a separate Gmail
              API, IMAP or signed provider webhook adapter with secure
              conversation matching.
            </p>
            <p>
              Manage manual recipient suppressions in Email automation. A
              permanent SMTP rejection is recorded as a failed attempt.
              Automated bounce classification is not available through Gmail
              SMTP.
            </p>
            <p>
              No HTTPS tunnel is needed for outbound local API calls or SMTP.
              When an inbound adapter is implemented, expose only its dedicated
              authenticated webhook route through an HTTPS development tunnel
              and verify signatures, timestamps and replay protection before
              processing.
            </p>
          </Section>
        </main>
      </div>
    </MarketingShell>
  );
}
