'use client';
import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
type TopUp = {
  id: string;
  packId: string;
  amountPaise: number;
  status: string;
  errorCode: string | null;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  refundedPaise: number;
  disputed: boolean;
  createdAt: string;
};
type Overview = {
  enabled: boolean;
  mode: string;
  currency: string;
  emailPricePaise: number;
  lowBalanceThresholdPaise: number;
  balance: { availablePaise: number; reservedPaise: number; blocked: boolean };
  waitingEmails: number;
  packs: { id: string; amountPaise: number }[];
  ledger: {
    id: string;
    kind: string;
    amountPaise: number;
    reservedDeltaPaise: number;
    description: string;
    createdAt: string;
  }[];
  topups: TopUp[];
};
type Checkout = {
  topUpId: string;
  providerOrderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
  status: string;
  mode: string;
};
type CheckoutResult = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};
type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (result: CheckoutResult) => void;
  modal: { ondismiss: () => void };
  theme: { color: string };
};
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open(): void;
      on(event: string, handler: () => void): void;
    };
  }
}
let checkoutScript: Promise<void> | undefined;
async function loadCheckout() {
  if (window.Razorpay) return;
  if (!checkoutScript)
    checkoutScript = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      const timeout = setTimeout(() => {
        script.remove();
        checkoutScript = undefined;
        reject(new Error('Payment checkout timed out. Try again.'));
      }, 15000);
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
      script.onerror = () => {
        clearTimeout(timeout);
        script.remove();
        checkoutScript = undefined;
        reject(
          new Error('Could not load payment checkout. Check your connection.'),
        );
      };
      document.head.appendChild(script);
    });
  await checkoutScript;
}
const money = (paise: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
    paise / 100,
  );
export default function Billing() {
  const [data, setData] = useState<Overview>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const request = useRef<{ packId: string; requestId: string } | undefined>(
    undefined,
  );
  async function load() {
    setData(await api<Overview>('billing/overview'));
  }
  useEffect(() => {
    let mounted = true;
    const refresh = () => {
      void api<Overview>('billing/overview')
        .then((r) => {
          if (mounted) setData(r);
        })
        .catch((e) => {
          if (mounted) setError(e.message);
        });
    };
    refresh();
    const timer = setInterval(refresh, 20000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);
  async function open(order: Checkout) {
    if (order.mode !== 'test')
      throw new Error('Only test checkout is enabled.');
    if (order.status !== 'CREATED') {
      setNotice('This order is already recorded. Review payment history.');
      setBusy(false);
      await load();
      return;
    }
    await loadCheckout();
    if (!window.Razorpay) throw new Error('Checkout is unavailable.');
    let submitted = false;
    const checkout = new window.Razorpay({
      key: order.keyId,
      amount: order.amountPaise,
      currency: order.currency,
      name: 'Autometa',
      description: 'Test prepaid usage credits',
      order_id: order.providerOrderId,
      theme: { color: '#315c43' },
      modal: {
        ondismiss: () => {
          if (!submitted) {
            setBusy(false);
            setNotice(
              'Checkout closed. If you completed payment, use Check status below.',
            );
            void load();
          }
        },
      },
      handler: (result) => {
        submitted = true;
        void (async () => {
          try {
            if (result.razorpay_order_id !== order.providerOrderId)
              throw new Error('Checkout order did not match.');
            const verified = await api<{ credited: boolean; status: string }>(
              'billing/verify',
              'POST',
              {
                topUpId: order.topUpId,
                paymentId: result.razorpay_payment_id,
                signature: result.razorpay_signature,
              },
            );
            setNotice(
              verified.credited
                ? 'Test payment verified. Your balance is updated.'
                : 'Payment is awaiting capture. Use Check status shortly.',
            );
            if (verified.credited) request.current = undefined;
            await load();
          } catch (e) {
            setError(
              e instanceof Error
                ? e.message
                : 'Payment verification failed. Use Check status.',
            );
          } finally {
            setBusy(false);
          }
        })();
      },
    });
    checkout.on('payment.failed', () => {
      setError(
        'The test payment failed. No credits were added for this attempt.',
      );
      setBusy(false);
    });
    checkout.open();
  }
  async function buy(packId: string) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      if (request.current?.packId !== packId)
        request.current = { packId, requestId: crypto.randomUUID() };
      const order = await api<Checkout>(
        'billing/topups',
        'POST',
        request.current,
      );
      await load();
      await open(order);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Checkout unavailable.');
      setBusy(false);
    }
  }
  async function reconcile(id: string) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const r = await api<{
        credited: boolean;
        status: string;
        message?: string;
      }>('billing/topups/' + id + '/reconcile', 'POST');
      setNotice(
        r.credited
          ? 'Verified payment status: ' + r.status
          : (r.message ?? 'No captured payment confirmed yet.'),
      );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not check payment.');
    } finally {
      setBusy(false);
    }
  }
  async function resume(id: string) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await open(await api<Checkout>('billing/topups/' + id + '/checkout'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Checkout unavailable.');
      setBusy(false);
    }
  }
  if (!data)
    return (
      <section className="card">
        {error ? <p role="alert">{error}</p> : 'Loading billing...'}
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
          <h2>Billing &amp; credits</h2>
          <span className="badge">RAZORPAY TEST MODE</span>
        </div>
        <p>
          Top up prepaid usage credits. No subscription or automatic recharge.
          This environment uses test payments and test prices; no real money is
          charged.
        </p>
        {!data.enabled && (
          <div className="notice">
            Prepaid billing is disabled by the platform operator.
          </div>
        )}
        {data.balance.blocked && (
          <div className="notice error" role="alert">
            Your billing account needs review. Paid email actions are paused.
            Contact the platform administrator.
          </div>
        )}
        {data.enabled &&
          data.balance.availablePaise <= data.lowBalanceThresholdPaise && (
            <div className="notice" role="status">
              Your available balance is low.{' '}
              {data.waitingEmails
                ? data.waitingEmails +
                  ' email action(s) are waiting for credits.'
                : 'Add credits before your next paid automation.'}{' '}
              Your existing contact form continues working.
            </div>
          )}
        <div className="metrics">
          <article className="metric">
            <div className="metric-label">Available credits</div>
            <div className="value">{money(data.balance.availablePaise)}</div>
          </article>
          <article className="metric">
            <div className="metric-label">Reserved credits</div>
            <div className="value">{money(data.balance.reservedPaise)}</div>
            <p>Reserved for pending or uncertain sends.</p>
          </article>
          <article className="metric">
            <div className="metric-label">Per email action</div>
            <div className="value">{money(data.emailPricePaise)}</div>
            <p>Acknowledgements and follow-ups each count separately.</p>
          </article>
        </div>
        <p>
          Credits are charged when the email provider accepts a message for
          sending. This is not delivery confirmation. Duplicate event requests
          and send retries do not create another charge. Authentication and
          ordinary mock emails are free.
        </p>
        <button
          className="secondary"
          disabled={busy}
          onClick={() => {
            setError('');
            void load().catch((e) => setError(e.message));
          }}
        >
          Refresh balance
        </button>
      </section>
      <section className="card">
        <h2>Add test credits</h2>
        <div className="metrics">
          {data.packs.map((pack) => (
            <article className="metric" key={pack.id}>
              <h3>{money(pack.amountPaise)}</h3>
              <p>
                {Math.floor(pack.amountPaise / data.emailPricePaise)} email
                actions at the current test rate.
              </p>
              <button
                disabled={busy || !data.enabled || data.balance.blocked}
                onClick={() => void buy(pack.id)}
              >
                Add {money(pack.amountPaise)}
              </button>
            </article>
          ))}
        </div>
        <p>
          Use Razorpay test payment details. Final production pricing, tax
          invoices and refund terms are not enabled in this local test
          environment.
        </p>
      </section>
      <section className="card">
        <h2>Payment history</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment reference</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.topups.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.createdAt).toLocaleString()}</td>
                  <td>
                    {money(t.amountPaise)}
                    {t.refundedPaise > 0 && (
                      <small style={{ display: 'block' }}>
                        Refunded: {money(t.refundedPaise)}
                      </small>
                    )}
                  </td>
                  <td>
                    <span className="badge">{t.status}</span>
                    {t.errorCode && (
                      <small style={{ display: 'block' }}>{t.errorCode}</small>
                    )}
                  </td>
                  <td style={{ overflowWrap: 'anywhere' }}>
                    {t.providerPaymentId ??
                      t.providerOrderId ??
                      'Pending order confirmation'}
                  </td>
                  <td>
                    {t.providerOrderId && (
                      <button
                        className="secondary"
                        disabled={busy}
                        onClick={() => void reconcile(t.id)}
                      >
                        Check status
                      </button>
                    )}
                    {t.status === 'CREATED' && (
                      <button
                        className="secondary"
                        disabled={busy}
                        onClick={() => void resume(t.id)}
                      >
                        Continue payment
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!data.topups.length && <p className="empty">No payment orders yet.</p>}
      </section>
      <section className="card">
        <h2>Credit activity</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th>Available change</th>
                <th>Reserved change</th>
              </tr>
            </thead>
            <tbody>
              {data.ledger.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.createdAt).toLocaleString()}</td>
                  <td>
                    {entry.description}
                    <small style={{ display: 'block' }}>
                      {entry.kind}
                      {entry.kind === 'CHARGE'
                        ? ' / ' + money(-entry.reservedDeltaPaise)
                        : ''}
                    </small>
                  </td>
                  <td>{money(entry.amountPaise)}</td>
                  <td>{money(entry.reservedDeltaPaise)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!data.ledger.length && (
          <p className="empty">
            Your credit purchases and automation usage will appear here.
          </p>
        )}
      </section>
    </div>
  );
}
