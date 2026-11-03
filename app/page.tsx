import type { Metadata } from 'next';
import MarketingShell from '../components/marketing/MarketingShell';
import CodeExamples from '../components/marketing/CodeExamples';
import { Icon, Wordmark, type IconName } from '../components/marketing/Icons';
import './marketing.css';
export const metadata: Metadata = {
  title: 'Autometa | Your stack. Your business. Connected.',
  description:
    'A developer-first business automation platform. Create a workspace, secure your server-side integration and explore the API documentation.',
};
function OrbitScene() {
  return (
    <figure className="orbital-visual">
      <div className="scene-coordinates">
        <span>PLATFORM ARCHITECTURE</span>
        <span>001 / SYSTEM MAP</span>
      </div>
      <div
        className="orbit-scene"
        role="img"
        aria-label="Your website connects to Autometa email automation. AI and Telegram are planned."
      >
        <div className="scene-grid" />
        <div className="orbit-halo" />
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="orbit orbit-three" />
        <div className="orbit-track">
          <i />
          <i />
        </div>
        <svg
          className="scene-connectors"
          viewBox="0 0 520 440"
          fill="none"
          aria-hidden="true"
        >
          <path
            className="connector"
            d="M80 120h70q25 0 25 25v40q0 25 30 25h45M65 320h75q35 0 35-35v-25q0-40 60-40M280 215h50q20 0 20-25v-65q0-20 25-20h60M280 220h145M280 225h45q25 0 25 25v75q0 20 25 20h60"
          />
          <path
            className="connector-signal"
            d="M80 120h70q25 0 25 25v40q0 25 30 25h45M280 220h145"
          />
        </svg>
        <div className="scene-core">
          <div className="scene-core-icon">
            <Wordmark />
          </div>
          <span>CONNECTIVE CORE</span>
          <small>Event engine / available</small>
        </div>
        <div className="scene-node node-input">
          <span className="node-icon">
            <Icon name="globe" size={16} />
          </span>
          <div>
            <small>YOUR WEBSITE</small>
            <strong>lead.created</strong>
          </div>
          <i />
        </div>
        <div className="scene-node node-database">
          <span className="node-icon">
            <Icon name="database" size={16} />
          </span>
          <div>
            <small>YOUR DATABASE</small>
            <strong>Stays yours.</strong>
          </div>
        </div>
        <div className="scene-node node-email">
          <span className="node-icon">
            <Icon name="layers" size={16} />
          </span>
          <div>
            <small>EMAIL</small>
            <strong>Acknowledge</strong>
          </div>
        </div>
        <div className="scene-node node-ai">
          <span className="node-icon">
            <Icon name="spark" size={16} />
          </span>
          <div>
            <small>AI ASSISTANCE</small>
            <strong>Understand</strong>
          </div>
        </div>
        <div className="scene-node node-telegram">
          <span className="node-icon">
            <Icon name="pulse" size={16} />
          </span>
          <div>
            <small>TELEGRAM</small>
            <strong>Stay informed</strong>
          </div>
        </div>
        <span className="scene-axis axis-top">Y + 042</span>
        <span className="scene-axis axis-bottom">X / 087</span>
      </div>
      <figcaption>
        <span>
          <i className="status-dot" /> Architecture preview
        </span>
        <span>Email acknowledgements available</span>
      </figcaption>
    </figure>
  );
}
const featureCards: [IconName, string, string, string][] = [
  [
    'shield',
    'Your data, your boundary.',
    'Tenant-scoped API keys and verified accounts keep workspace access specific to each business.',
    'AVAILABLE NOW',
  ],
  [
    'code',
    'A connection. Not a rebuild.',
    'Keep your database, authentication and interface. The event contract is designed around one small server-side call.',
    'INTEGRATION DESIGN',
  ],
  [
    'key',
    'Built with servers in mind.',
    'Separate development and production keys. Reveal a secret once, then store only its hash on the platform.',
    'AVAILABLE NOW',
  ],
];
const faqs = [
  [
    'Do I need to rebuild my website?',
    'No. The integration is designed to sit after your existing contact, lead or feedback handler. Keep your current database, authentication and frontend. Create a key, enable Email automation and submit business events from your server.',
  ],
  [
    'What can I test right now?',
    'Enable email acknowledgements and submit contact events. Inspect mock email, or configure Gmail SMTP for an allowlisted real test. The developer guide includes examples for five stacks.',
  ],
  [
    'What if the automation service is unavailable?',
    'The event helpers use a bounded timeout and return a failure result instead of undoing your successful application operation. If eventual delivery is essential, use an existing durable application queue or outbox with a stable event ID.',
  ],
  [
    'Can I run it on localhost?',
    'Yes. The local Docker Compose setup includes the user portal, admin console, NestJS API, PostgreSQL, Redis and a separate BullMQ worker. Authentication email is mocked for safe local testing. The documentation explains the current ports and environment settings.',
  ],
  [
    'Are Gmail, AI and Telegram available?',
    'Gmail SMTP and mock outbound email are available. AI and Telegram are planned. Inbound replies require a separate integration; SMTP acceptance does not confirm delivery.',
  ],
];
export default function Home() {
  return (
    <MarketingShell>
      <main id="main-content">
        <section className="astro-hero">
          <div className="hero-light" aria-hidden="true" />
          <div className="astro-container hero-layout">
            <div className="hero-copy">
              <a className="release-pill" href="/docs#availability">
                <span className="release-tag">DEVELOPER PREVIEW</span>
                <span>The foundation is live</span>
                <Icon name="arrow" size={13} />
              </a>
              <p className="astro-kicker">LESS MANUAL. MORE POSSIBLE.</p>
              <h1>
                Your business.
                <br />
                <span>Beyond busywork.</span>
              </h1>
              <p className="hero-description">
                A connective layer for the tools you already use. Bring your
                stack. Build your workspace. Make room for what comes next.
              </p>
              <div className="hero-buttons">
                <a className="astro-btn" href="/register">
                  Create your workspace <Icon name="arrow" size={16} />
                </a>
                <a className="astro-btn astro-btn-outline" href="/docs">
                  <Icon name="code" size={17} /> Explore the docs
                </a>
              </div>
              <div className="hero-assurance">
                <span>
                  <Icon name="check" size={13} /> Your database stays yours
                </span>
                <span>
                  <Icon name="check" size={13} /> Server-side integration
                </span>
              </div>
              <p className="hero-disclosure">
                Account setup and API-key verification are available.
                <br />
                The automation pipeline is the next layer.
              </p>
            </div>
            <OrbitScene />
          </div>
          <div className="astro-container stack-rail">
            <span>
              MADE FOR YOUR
              <br />
              <b>EXISTING STACK</b>
            </span>
            <div>
              {['Node.js', 'NestJS', 'Next.js', 'PHP', 'REST API'].map(
                (stack, i) => (
                  <span key={stack}>
                    <i>{['JS', 'N', 'N', 'php', '{ }'][i]}</i>
                    {stack}
                  </span>
                ),
              )}
            </div>
          </div>
        </section>
        <section className="astro-section" id="platform">
          <div className="astro-container">
            <div className="section-intro" data-reveal>
              <p className="astro-kicker">01 / THE PLATFORM</p>
              <h2>
                Keep your stack.
                <br />
                <span>Expand your possibilities.</span>
              </h2>
              <p>
                The best integration fits into your business.
                <br />
                It shouldn’t ask you to start from scratch.
              </p>
            </div>
            <div className="feature-bento">
              <article className="bento-main" data-reveal>
                <div className="feature-label">
                  <Icon name="layers" size={18} />
                  <span>ONE WORKSPACE. CLEAR BOUNDARIES.</span>
                </div>
                <h3>
                  Your business.
                  <br />
                  Connected on your terms.
                </h3>
                <p>
                  Set up your identity, manage server credentials and give each
                  environment its own access. Start with a foundation you can
                  inspect.
                </p>
                <a className="astro-text-link" href="/dashboard">
                  Open your workspace <Icon name="arrow" size={15} />
                </a>
                <div
                  className="boundary-diagram"
                  aria-label="Your application retains its database and login; Autometa provides a separate integration connection"
                >
                  <div className="boundary-app">
                    <span>YOUR APPLICATION</span>
                    <strong>
                      <Icon name="globe" size={18} /> Website / backend
                    </strong>
                    <div>
                      <span>
                        <Icon name="database" size={13} /> Your database
                      </span>
                      <span>
                        <Icon name="shield" size={13} /> Your auth
                      </span>
                    </div>
                  </div>
                  <div className="boundary-bridge">
                    <span />
                    <Icon name="arrow" size={18} />
                    <span />
                  </div>
                  <div className="boundary-core">
                    <Icon name="spark" size={26} />
                    <small>AUTOMETA</small>
                  </div>
                </div>
              </article>
              <div className="bento-stack">
                {featureCards.map(([icon, title, description, label]) => (
                  <article className="bento-small" data-reveal key={title}>
                    <div className="bento-icon">
                      <Icon name={icon} />
                    </div>
                    <div>
                      <span className="mini-label">{label}</span>
                      <h3>{title}</h3>
                      <p>{description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="astro-section integration-section" id="integration">
          <div className="astro-container integration-layout">
            <div data-reveal>
              <p className="astro-kicker">02 / DEVELOPER EXPERIENCE</p>
              <h2>
                One small connection.
                <br />
                <span>A bigger possibility.</span>
              </h2>
              <p>
                Start with a real API-key check. Copy an example for your stack,
                set your server environment, and verify the connection.
              </p>
              <ol className="integration-steps">
                <li>
                  <span>01</span>
                  <div>
                    <strong>Create & verify your workspace</strong>
                    <p>Register your business and confirm your email.</p>
                  </div>
                </li>
                <li>
                  <span>02</span>
                  <div>
                    <strong>Generate a development API key</strong>
                    <p>Store it on your server. Keep it out of browser code.</p>
                  </div>
                </li>
                <li>
                  <span>03</span>
                  <div>
                    <strong>Make your first connection</strong>
                    <p>Call GET /usage with a three-second deadline.</p>
                  </div>
                </li>
              </ol>
              <a className="astro-text-link" href="/docs">
                Read the integration guide <Icon name="arrow" size={15} />
              </a>
            </div>
            <div data-reveal>
              <CodeExamples compact />
            </div>
          </div>
        </section>
        <section className="astro-section" id="availability">
          <div className="astro-container availability-layout">
            <div className="section-intro" data-reveal>
              <p className="astro-kicker">03 / BUILDING IN THE OPEN</p>
              <h2>
                Know what’s ready.
                <br />
                <span>See what’s next.</span>
              </h2>
              <p>
                A clear contract starts with a clear status. Connect to the
                features that are available today, and explore the direction of
                the platform.
              </p>
              <a className="astro-text-link" href="/docs#quickstart">
                View API availability <Icon name="arrow" size={15} />
              </a>
            </div>
            <div className="roadmap-panel" data-reveal>
              <div className="roadmap-row">
                <span className="roadmap-icon">
                  <Icon name="check" size={16} />
                </span>
                <div>
                  <small>AVAILABLE</small>
                  <h3>The secure foundation</h3>
                  <p>
                    Verified accounts, business profiles, tenant isolation and
                    API-key lifecycle.
                  </p>
                </div>
                <span className="astro-chip">Ready</span>
              </div>
              <div className="roadmap-row">
                <span className="roadmap-icon">
                  <Icon name="code" size={16} />
                </span>
                <div>
                  <small>AVAILABLE</small>
                  <h3>Your first authenticated request</h3>
                  <p>
                    Server-side GET /usage verifies your key and environment.
                  </p>
                </div>
                <span className="astro-chip">Ready</span>
              </div>
              <div className="roadmap-row">
                <span className="roadmap-icon">
                  <Icon name="layers" size={16} />
                </span>
                <div>
                  <small>AVAILABLE</small>
                  <h3>Contact email acknowledgements</h3>
                  <p>
                    Durable event acceptance, mock and Gmail SMTP, attempt logs
                    and tenant quotas.
                  </p>
                </div>
                <span className="astro-chip">Ready</span>
              </div>
              <div className="roadmap-row future">
                <span className="roadmap-icon">
                  <Icon name="layers" size={16} />
                </span>
                <div>
                  <small>NEXT LAYER</small>
                  <h3>Events → workflows → actions</h3>
                  <p>AI, Telegram, scheduled follow-ups and reporting.</p>
                </div>
                <span className="astro-chip chip-muted">Planned</span>
              </div>
            </div>
          </div>
        </section>
        <section className="astro-section faq-section" id="faq">
          <div className="astro-container faq-layout">
            <div className="section-intro" data-reveal>
              <p className="astro-kicker">04 / GOOD QUESTIONS</p>
              <h2>
                A few things
                <br />
                <span>worth knowing.</span>
              </h2>
              <p>
                Need the technical details?
                <br />
                <a className="astro-text-link" href="/docs">
                  Start with the developer guide <Icon name="arrow" size={14} />
                </a>
              </p>
            </div>
            <div className="faq-list" data-reveal>
              {faqs.map(([q, a], i) => (
                <details key={q}>
                  <summary>
                    <span>
                      <small>0{i + 1}</small>
                      {q}
                    </span>
                    <Icon name="chevron" size={17} />
                  </summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
        <section className="astro-cta-section">
          <div className="astro-container">
            <div className="astro-cta" data-reveal>
              <div className="cta-orbits" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <div>
                <p className="astro-kicker">YOUR NEXT CHAPTER STARTS HERE</p>
                <h2>
                  Build the connection.
                  <br />
                  <span>Keep your momentum.</span>
                </h2>
                <p>
                  Create a workspace today. Take the next step on your terms.
                </p>
              </div>
              <div className="cta-buttons">
                <a className="astro-btn" href="/register">
                  Get started <Icon name="arrow" size={16} />
                </a>
                <a className="astro-text-link" href="/docs">
                  Developer documentation <Icon name="code" size={15} />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
