'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../lib/api';
import EmailAutomation from './EmailAutomation';
import Billing from './Billing';
type User = { email: string; verified: boolean };
type Key = {
  id: string;
  name: string;
  prefix: string;
  environment: string;
  revokedAt: string | null;
  lastUsedAt: string | null;
};
type Data = {
  tenant: {
    id: string;
    name: string;
    status: string;
    timezone: string;
    website: string | null;
    description: string | null;
    trialEndsAt: string;
  };
  keys: Key[];
  audit: { id: string; action: string; createdAt: string }[];
  metrics: { activeKeys: number };
};
export default function Dashboard() {
  const [mailProvider, setMailProvider] = useState('mock');
  const [user, setUser] = useState<User>(),
    [data, setData] = useState<Data>(),
    [view, setView] = useState('Overview'),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false),
    [secret, setSecret] = useState(''),
    [mail, setMail] = useState<{ id: string; subject: string; body: string }[]>(
      [],
    );
  async function load() {
    const me = await api<{ user: User; mail: { provider: string } }>('auth/me');
    setUser(me.user);
    setMailProvider(me.mail.provider);
    if (me.user.verified) setData(await api<Data>('business'));
    setError('');
  }
  useEffect(() => {
    void load().catch((e) => {
      if (e.status === 401) location.href = '/login';
      else setError(e.message);
    });
  }, []);
  async function action(work: () => Promise<unknown>) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await work();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed.');
    } finally {
      setBusy(false);
    }
  }
  async function inbox() {
    await action(async () => {
      const r = await api<{ messages: typeof mail }>('auth/development-inbox');
      setMail(r.messages);
      setView('Inbox');
    });
  }
  async function profile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await action(async () => {
      await api('business', 'PATCH', Object.fromEntries(f));
      setNotice('Business profile saved.');
    });
  }
  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await action(async () => {
      const r = await api<{ secret: string }>(
        'api-keys',
        'POST',
        Object.fromEntries(f),
      );
      setSecret(r.secret);
    });
  }
  return (
    <div className="shell">
      <aside className="sidebar">
        <a className="brand" href="/">
          <span className="mark">a</span>autometa
        </a>
        <nav>
          {[
            'Overview',
            'Email automation',
            'Billing & credits',
            'API keys',
            'Business settings',
            'Activity',
          ].map((v) => (
            <button
              key={v}
              className={view === v ? 'current' : ''}
              onClick={() => setView(v)}
            >
              {v}
            </button>
          ))}
        </nav>
        <div className="side-note">
          <strong>Built for your business</strong>
          <p>
            Connect your website and manage transactional email
            acknowledgements.
          </p>
          <span className="badge">LOCAL DEVELOPMENT</span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>
            Workspace / <strong>{view}</strong>
          </span>
          <div className="account">
            <small>{user?.email}</small>
            <span className="avatar">
              {user?.email.slice(0, 2).toUpperCase() ?? '?'}
            </span>
            <button
              className="secondary"
              onClick={() =>
                void action(async () => {
                  await api('auth/logout', 'POST');
                  location.href = '/login';
                })
              }
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="content">
          <div className="heading">
            <div>
              <div className="eyebrow">BUSINESS WORKSPACE</div>
              <h1 style={{ marginTop: 12 }}>
                {data?.tenant.name ?? 'Your workspace'}
              </h1>
              <p>
                Manage your business identity and server-side integration
                access.
              </p>
            </div>
            {mailProvider === 'mock' && (
              <button
                className="secondary"
                disabled={busy}
                onClick={() => void inbox()}
              >
                Open local test inbox
              </button>
            )}
          </div>
          {error && (
            <div role="alert" className="notice error">
              {error}
              <button
                className="secondary"
                disabled={busy}
                onClick={() => void action(async () => {})}
              >
                Retry workspace connection
              </button>
            </div>
          )}
          {notice && (
            <div role="status" className="notice">
              {notice}
            </div>
          )}
          {!user && !error && (
            <div className="card">Loading your workspace?</div>
          )}
          {user && !user.verified && (
            <section className="card">
              <h2>One more step: verify your email</h2>
              <p>
                Check your email for a verification link. In mock mode, open the
                local test inbox. Gmail local test mode permits only addresses
                configured by the platform operator.
              </p>
              <div className="actions">
                {mailProvider === 'mock' && (
                  <button disabled={busy} onClick={() => void inbox()}>
                    View verification email
                  </button>
                )}
                <button
                  className="secondary"
                  disabled={busy}
                  onClick={() =>
                    void action(async () => {
                      await api('auth/resend-verification', 'POST');
                      setNotice(
                        'Verification requested. Check your email or the mock inbox; local Gmail allowlist restrictions apply.',
                      );
                    })
                  }
                >
                  Resend
                </button>
              </div>
            </section>
          )}
          {view === 'Inbox' && (
            <section className="card">
              <div className="section-heading">
                <h2>Local test inbox</h2>
                <span className="badge">MOCK ? NOT SENT EXTERNALLY</span>
              </div>
              <p>
                Only your account?s unexpired authentication messages appear
                here.
              </p>
              {mail.map((m) => (
                <article className="inbox" key={m.id}>
                  <strong>{m.subject}</strong>
                  <a href={m.body}>{m.body}</a>
                </article>
              ))}
              {!mail.length && (
                <div className="empty">
                  No unexpired messages. You can request a new verification
                  message.
                </div>
              )}
            </section>
          )}
          {data && view === 'Email automation' && <EmailAutomation />}
          {data && view === 'Billing & credits' && <Billing />}
          {data && view === 'Overview' && (
            <>
              <div className="metrics">
                {[
                  [
                    'Business status',
                    data.tenant.status.toLowerCase(),
                    'Current account status',
                  ],
                  [
                    'Active API keys',
                    data.metrics.activeKeys,
                    'Server-side credentials',
                  ],
                  [
                    'Trial ends',
                    new Date(data.tenant.trialEndsAt).toLocaleDateString(),
                    'Onboarding trial',
                  ],
                  ['Timezone', data.tenant.timezone, 'Reporting preference'],
                ].map(([name, value, detail]) => (
                  <article className="metric" key={name}>
                    <div className="metric-label">
                      {name}
                      <span>?</span>
                    </div>
                    <div
                      className="value"
                      style={{ fontSize: typeof value === 'number' ? 32 : 22 }}
                    >
                      {value}
                    </div>
                    <p>{detail}</p>
                  </article>
                ))}
              </div>
              <div className="columns">
                <section className="card">
                  <h2>Your integration checklist</h2>
                  {[
                    [
                      'Email verified',
                      'Your account identity is confirmed.',
                      'Ready',
                    ],
                    [
                      'Business profile',
                      'Add a website, description and timezone.',
                      'Available',
                    ],
                    [
                      'Server-side API key',
                      'Create a key and verify it at GET /api/v1/usage.',
                      'Available',
                    ],
                    [
                      'Automation workflows',
                      'Enable contact acknowledgements in Email automation.',
                      'Available',
                    ],
                  ].map(([name, detail, state]) => (
                    <div className="status-row" key={name}>
                      <div>
                        <strong>{name}</strong>
                        <p>{detail}</p>
                      </div>
                      <span className="badge">{state}</span>
                    </div>
                  ))}
                </section>
                <section className="card">
                  <h2>Build on what you have</h2>
                  <p>
                    Your existing database, login and frontend stay in place.
                    The event API connects from your server-side contact or lead
                    handler.
                  </p>
                  <div className="notice">
                    Enable email automation, then send a contact event from your
                    server.
                  </div>
                  <button onClick={() => setView('API keys')}>
                    Manage API keys ?
                  </button>
                </section>
              </div>
            </>
          )}
          {data && view === 'Business settings' && (
            <section className="card">
              <h2>Business profile</h2>
              <form onSubmit={profile} key={JSON.stringify(data.tenant)}>
                <div className="grid-form">
                  <label>
                    Business name
                    <input
                      name="name"
                      required
                      minLength={2}
                      maxLength={200}
                      defaultValue={data.tenant.name}
                    />
                  </label>
                  <label>
                    Timezone
                    <input
                      name="timezone"
                      required
                      defaultValue={data.tenant.timezone}
                      placeholder="Asia/Kolkata"
                    />
                  </label>
                  <label className="wide">
                    Website
                    <input
                      name="website"
                      type="url"
                      defaultValue={data.tenant.website ?? ''}
                      placeholder="https://your-business.com"
                    />
                  </label>
                  <label className="wide">
                    Business description
                    <textarea
                      name="description"
                      maxLength={2000}
                      defaultValue={data.tenant.description ?? ''}
                    />
                  </label>
                </div>
                <div className="actions">
                  <button disabled={busy}>Save changes</button>
                </div>
              </form>
            </section>
          )}
          {data && view === 'API keys' && (
            <section className="card">
              <div className="section-heading">
                <h2>Server-side API keys</h2>
                <span className="badge">
                  {data.metrics.activeKeys} / 10 ACTIVE
                </span>
              </div>
              <p>
                Create separate keys for development and production. Keep them
                in your server environment.
              </p>
              <form className="key-form" onSubmit={create}>
                <label>
                  Key name
                  <input
                    name="name"
                    required
                    maxLength={100}
                    placeholder="Website development"
                  />
                </label>
                <label>
                  Environment
                  <select name="environment">
                    <option value="development">Development</option>
                    <option value="production">Production</option>
                  </select>
                </label>
                <button disabled={busy}>Create key</button>
              </form>
              {secret && (
                <div className="secret" role="status">
                  <strong>Copy your key now. It is shown only once.</strong>
                  <code>{secret}</code>
                  <button
                    className="secondary"
                    onClick={() =>
                      void navigator.clipboard
                        .writeText(secret)
                        .then(() =>
                          setNotice('API key copied. Store it on your server.'),
                        )
                        .catch(() =>
                          setError('Select the key and copy it manually.'),
                        )
                    }
                  >
                    Copy key
                  </button>{' '}
                  <button className="secondary" onClick={() => setSecret('')}>
                    I have saved it
                  </button>
                  <p>
                    Never embed this key in browser code or commit it to source
                    control.
                  </p>
                </div>
              )}
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Prefix</th>
                      <th>Environment</th>
                      <th>Last used</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.keys.map((k) => (
                      <tr key={k.id}>
                        <td>
                          <strong>{k.name}</strong>
                          <small>{k.revokedAt ? 'Revoked' : 'Active'}</small>
                        </td>
                        <td>
                          <code>{k.prefix}?</code>
                        </td>
                        <td>{k.environment}</td>
                        <td>
                          {k.lastUsedAt
                            ? new Date(k.lastUsedAt).toLocaleString()
                            : 'Never'}
                        </td>
                        <td>
                          <div className="row-actions">
                            {!k.revokedAt && (
                              <>
                                <button
                                  className="secondary"
                                  disabled={busy}
                                  onClick={() => {
                                    if (
                                      confirm(
                                        'Rotate this key? The old key will stop working immediately.',
                                      )
                                    )
                                      void action(async () => {
                                        const r = await api<{ secret: string }>(
                                          'api-keys/' + k.id + '/rotate',
                                          'POST',
                                          {
                                            name: k.name,
                                            environment: k.environment,
                                          },
                                        );
                                        setSecret(r.secret);
                                      });
                                  }}
                                >
                                  Rotate
                                </button>
                                <button
                                  className="danger"
                                  disabled={busy}
                                  onClick={() => {
                                    if (
                                      confirm(
                                        'Revoke this key? This cannot be undone.',
                                      )
                                    )
                                      void action(() =>
                                        api('api-keys/' + k.id, 'DELETE'),
                                      );
                                  }}
                                >
                                  Revoke
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!data.keys.length && (
                  <div className="empty">
                    No keys yet. Create your first development key above.
                  </div>
                )}
              </div>
              <p className="footnote">
                Test with GET /api/v1/usage and Authorization: Bearer YOUR_KEY
                from a server or terminal. Enable Email automation, then use the
                event examples in the developer guide.
              </p>
            </section>
          )}
          {data && view === 'Activity' && (
            <section className="card">
              <h2>Workspace activity</h2>
              <p>Latest 15 administrative changes for your business.</p>
              {data.audit.map((a) => (
                <div className="activity" key={a.id}>
                  <strong>
                    {a.action.replaceAll('.', ' ? ').replaceAll('_', ' ')}
                  </strong>
                  <p>{new Date(a.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </section>
          )}
          <p className="footnote">
            Account management and email acknowledgements are available. Inbound
            replies, Telegram and reports remain planned. Prepaid test credits
            are available in Billing &amp; credits.
          </p>
        </main>
      </div>
    </div>
  );
}
