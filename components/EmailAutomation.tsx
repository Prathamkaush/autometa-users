'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../lib/api';
type Settings = {
  enabled: boolean;
  followUpEnabled: boolean;
  enabledEvents: string[];
  subject: string;
  body: string;
  dailyLimit: number;
};
type Mail = {
  id: string;
  recipient: string;
  subject: string;
  status: string;
  errorCode: string | null;
  attemptCount: number;
  provider: string;
  purpose: string;
  scheduledAt: string | null;
};
type Message = Mail & {
  text: string;
  sender: string;
  attempts: {
    number: number;
    outcome: string;
    safeCode: string | null;
    startedAt: string;
  }[];
};
type Overview = {
  runtime: {
    provider: string;
    sender: string;
    testMode: boolean;
    tenantDailyMaximum: number;
    followUpAvailable: boolean;
    followUpDelayMinutes: number;
  };
  settings: Settings;
  emails: Mail[];
  events: {
    id: string;
    externalEventId: string;
    eventType: string;
    emailDecision: string;
    contact: { name: string; email: string };
  }[];
  suppressions: { id: string; email: string; reason: string }[];
  quota: { reserved: number; limit: number; day: string };
};
const triggers = [
  'contact.created',
  'lead.created',
  'inquiry.received',
  'feedback.submitted',
];
export default function EmailAutomation() {
  const [data, setData] = useState<Overview>();
  const [settings, setSettings] = useState<Settings>();
  const [message, setMessage] = useState<Message>();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  async function load() {
    const result = await api<Overview>('email/overview');
    setData(result);
    const {
      enabled,
      followUpEnabled,
      enabledEvents,
      subject,
      body,
      dailyLimit,
    } = result.settings;
    setSettings({
      enabled,
      followUpEnabled,
      enabledEvents,
      subject,
      body,
      dailyLimit,
    });
  }
  useEffect(() => {
    void load().catch((e) => setError(e.message));
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
  async function suppress(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get('email');
    await action(async () => {
      await api('email/suppressions', 'POST', { email });
      form.reset();
      setNotice('Recipient suppressed for this business.');
    });
  }
  if (!data || !settings)
    return (
      <section className="card">
        {error ? <p role="alert">{error}</p> : 'Loading email automation...'}
      </section>
    );
  return (
    <div className="email-automation">
      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="notice" role="status">
          {notice}
        </div>
      )}
      <section className="card">
        <div className="section-heading">
          <h2>Email automation</h2>
          <button
            className="secondary"
            disabled={busy}
            onClick={() => void action(async () => {})}
          >
            Refresh activity
          </button>
        </div>
        <p>
          Send a transactional acknowledgement after your website saves a
          contact, inquiry, lead or feedback submission.
        </p>
        <div className="notice">
          <strong>
            {data.runtime.provider === 'mock'
              ? 'Mock provider: no external email is sent.'
              : 'Gmail SMTP: outbound email is enabled.'}
          </strong>
          <p>
            Platform sender: {data.runtime.sender}.{' '}
            {data.runtime.testMode && data.runtime.provider === 'gmail'
              ? 'Local test mode permits only the recipients configured by the platform operator.'
              : ''}
          </p>
        </div>
        <p>
          Today: {data.quota.reserved} / {data.quota.limit} unique messages
          reserved ({data.quota.day}, UTC). Retries use the same reservation.
        </p>
        {!data.settings.enabled && (
          <div className="notice" role="status">
            Acknowledgements are off for this workspace. Check Enable email
            acknowledgements below and save your settings. Selected event
            triggers alone do not enable sending. Then submit a new contact from
            your website; previously accepted events are not replayed.
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void action(async () => {
              const {
                enabled,
                followUpEnabled,
                enabledEvents,
                subject,
                body,
                dailyLimit,
              } = settings;
              await api('email/settings', 'PUT', {
                enabled,
                followUpEnabled,
                enabledEvents,
                subject,
                body,
                dailyLimit,
              });
              setNotice('Automation settings saved.');
            });
          }}
        >
          <label className="email-toggle">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) =>
                setSettings({ ...settings, enabled: e.target.checked })
              }
            />{' '}
            Enable email acknowledgements
          </label>
          <label className="email-toggle" style={{ marginTop: 16 }}>
            <input
              type="checkbox"
              checked={settings.followUpEnabled}
              disabled={!data.runtime.followUpAvailable}
              onChange={(e) =>
                setSettings({ ...settings, followUpEnabled: e.target.checked })
              }
            />
            Send one follow-up {data.runtime.followUpDelayMinutes} minutes after
            the acknowledgement
          </label>
          <p>
            Follow-ups apply to new submissions only and count toward email
            quotas. Replies are not tracked yet. Cancel a pending follow-up
            below, suppress the recipient, or turn this option off if the
            inquiry is resolved. Disabling follow-ups cancels pending ones.
          </p>
          <fieldset>
            <legend>Send for these events</legend>
            <div className="email-triggers">
              {triggers.map((event) => (
                <label key={event}>
                  <input
                    type="checkbox"
                    checked={settings.enabledEvents.includes(event)}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        enabledEvents: e.target.checked
                          ? [...settings.enabledEvents, event]
                          : settings.enabledEvents.filter((x) => x !== event),
                      })
                    }
                  />
                  {event}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid-form">
            <label className="wide">
              Subject
              <input
                required
                maxLength={180}
                value={settings.subject}
                onChange={(e) =>
                  setSettings({ ...settings, subject: e.target.value })
                }
              />
            </label>
            <label className="wide">
              Plain text message
              <textarea
                required
                maxLength={4000}
                rows={7}
                value={settings.body}
                onChange={(e) =>
                  setSettings({ ...settings, body: e.target.value })
                }
              />
            </label>
            <label>
              Daily message cap
              <input
                type="number"
                required
                min={1}
                max={data.runtime.tenantDailyMaximum}
                value={settings.dailyLimit}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    dailyLimit: Number(e.target.value),
                  })
                }
              />
            </label>
          </div>
          <p>
            Available placeholders: <code>{'{{businessName}}'}</code>,{' '}
            <code>{'{{contactName}}'}</code>, <code>{'{{reference}}'}</code>.
            The sender is managed by the platform.
          </p>
          <button disabled={busy || !settings.enabledEvents.length}>
            Save email settings
          </button>
        </form>
      </section>
      <section className="card">
        <h2>Connect your website</h2>
        <p>
          Create a development API key, then add one server-side call after your
          current contact handler saves successfully. Include the original
          record ID, submission time and permission evidence. Your existing
          application can keep working when Autometa is unavailable.
        </p>
        <a className="button secondary" href="/docs#quickstart">
          Open integration documentation
        </a>
      </section>
      <section className="card">
        <h2>Recent email messages</h2>
        <p>
          MOCK_ACCEPTED means a local simulation. SMTP_ACCEPTED means Gmail
          accepted the message for sending; delivery is unconfirmed. UNKNOWN
          requires review and is never automatically resent. Inbound reply
          tracking is not enabled.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Recipient / subject</th>
                <th>Status</th>
                <th>Attempts</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {data.emails.map((mail) => (
                <tr key={mail.id}>
                  <td>
                    {mail.recipient}
                    <small style={{ display: 'block' }}>{mail.subject}</small>
                  </td>
                  <td>
                    <span className="badge">{mail.status}</span>
                    {mail.purpose === 'FOLLOW_UP' && (
                      <small style={{ display: 'block' }}>
                        Follow-up
                        {mail.scheduledAt
                          ? ' / due ' +
                            new Date(mail.scheduledAt).toLocaleString()
                          : ''}
                      </small>
                    )}
                    {mail.errorCode && (
                      <small style={{ display: 'block' }}>
                        {mail.errorCode}
                      </small>
                    )}
                  </td>
                  <td>{mail.attemptCount}</td>
                  <td>
                    <button
                      className="secondary"
                      disabled={busy}
                      onClick={() =>
                        void action(async () => {
                          setMessage(
                            (
                              await api<{ email: Message }>(
                                'email/messages/' + mail.id,
                              )
                            ).email,
                          );
                        })
                      }
                    >
                      Inspect
                    </button>
                    {mail.purpose === 'FOLLOW_UP' &&
                      ['QUEUED', 'RETRY', 'WAITING_CREDITS'].includes(
                        mail.status,
                      ) && (
                        <button
                          className="secondary"
                          disabled={busy}
                          onClick={() =>
                            void action(async () => {
                              await api(
                                'email/messages/' + mail.id + '/cancel',
                                'POST',
                              );
                              setNotice('Pending follow-up cancelled.');
                            })
                          }
                        >
                          Cancel follow-up
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!data.emails.length && (
          <p className="empty">
            No emails yet. Enable the automation and submit a permitted contact
            event.
          </p>
        )}
        {message && (
          <article className="inbox">
            <div className="section-heading">
              <h3>{message.subject}</h3>
              <button
                className="secondary"
                onClick={() => setMessage(undefined)}
              >
                Close details
              </button>
            </div>
            <p>
              From {message.sender} to {message.recipient}
            </p>
            <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
              {message.text}
            </pre>
            <ul>
              {message.attempts.map((a) => (
                <li key={a.number}>
                  Attempt {a.number}: {a.outcome}
                  {a.safeCode ? ' / ' + a.safeCode : ''} (
                  {new Date(a.startedAt).toLocaleString()})
                </li>
              ))}
            </ul>
            {!message.attempts.length && <p>No send attempts recorded.</p>}
          </article>
        )}
      </section>
      <section className="card">
        <h2>Recent event receipts</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>External reference</th>
                <th>Event</th>
                <th>Decision</th>
              </tr>
            </thead>
            <tbody>
              {data.events.map((event) => (
                <tr key={event.id}>
                  <td>
                    {event.externalEventId}
                    <small style={{ display: 'block' }}>
                      {event.contact.email}
                    </small>
                  </td>
                  <td>{event.eventType}</td>
                  <td>{event.emailDecision}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!data.events.length && (
          <p className="empty">No events accepted yet.</p>
        )}
      </section>
      <section className="card">
        <h2>Suppressed recipients</h2>
        <p>
          Block acknowledgements to an address for this business. Removing a
          block permits future eligible events; it does not resend old messages.
        </p>
        <form className="key-form" onSubmit={suppress}>
          <label>
            Email address
            <input name="email" type="email" required maxLength={254} />
          </label>
          <button disabled={busy}>Suppress recipient</button>
        </form>
        {data.suppressions.map((s) => (
          <div className="status-row" key={s.id}>
            <span>
              {s.email} <small>{s.reason}</small>
            </span>
            <button
              className="secondary"
              disabled={busy}
              onClick={() =>
                void action(() => api('email/suppressions/' + s.id, 'DELETE'))
              }
            >
              Remove suppression
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
