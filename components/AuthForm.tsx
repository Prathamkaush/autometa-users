'use client';
import { useState, type FormEvent } from 'react';
import { api } from '../lib/api';
type Kind =
  'login' | 'register' | 'verify' | 'forgot-password' | 'reset-password';
export default function AuthForm({ kind }: { kind: Kind }) {
  const [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false);
  const title = {
    login: 'Welcome back',
    register: 'Create your workspace',
    verify: 'Verify your email',
    'forgot-password': 'Reset your password',
    'reset-password': 'Choose a new password',
  }[kind];
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const f = new FormData(e.currentTarget),
      email = String(f.get('email') ?? ''),
      password = String(f.get('password') ?? ''),
      token = new URLSearchParams(location.hash.slice(1)).get('token') ?? '';
    try {
      if (kind === 'register') {
        await api('auth/register', 'POST', {
          email,
          password,
          businessName: String(f.get('businessName')),
        });
        await api('auth/login', 'POST', { email, password });
        location.href = '/dashboard';
      }
      if (kind === 'login') {
        await api('auth/login', 'POST', { email, password });
        location.href = '/dashboard';
      }
      if (kind === 'verify') {
        await api('auth/verify-email', 'POST', { token });
        setMessage('Email verified. Open your workspace to continue.');
      }
      if (kind === 'forgot-password') {
        const r = await api<{ message: string }>(
          'auth/forgot-password',
          'POST',
          { email },
        );
        setMessage(r.message);
      }
      if (kind === 'reset-password') {
        await api('auth/reset-password', 'POST', { token, password });
        setMessage('Password updated. Sign in with your new password.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to continue.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-shell">
      <aside className="story">
        <a className="brand" href="/">
          <span className="mark">a</span>autometa
        </a>
        <div>
          <div className="eyebrow">YOUR BUSINESS, CONNECTED</div>
          <h1>
            A little less busy.
            <br />A lot more possible.
          </h1>
          <p>
            One workspace for your business, integrations and the automations
            that come next.
          </p>
        </div>
        <footer>
          Built for existing businesses. Designed to fit your workflow.
        </footer>
      </aside>
      <section className="auth-area">
        <div className="auth-card">
          <div className="eyebrow">BUSINESS WORKSPACE</div>
          <h1 style={{ marginTop: 16 }}>{title}</h1>
          <p>
            {kind === 'register'
              ? 'Start a 14-day onboarding trial. No payment required for this local phase.'
              : 'Secure access to your Autometa workspace.'}
          </p>
          {error && (
            <div role="alert" className="notice error">
              {error}
            </div>
          )}
          {message && (
            <div role="status" className="notice">
              {message}{' '}
              <a href={kind === 'verify' ? '/dashboard' : '/login'}>
                Continue ?
              </a>
            </div>
          )}
          {!message && (
            <form onSubmit={submit}>
              {kind === 'register' && (
                <label>
                  Business name
                  <input
                    name="businessName"
                    required
                    minLength={2}
                    maxLength={200}
                    autoComplete="organization"
                  />
                </label>
              )}
              {['register', 'login', 'forgot-password'].includes(kind) && (
                <label>
                  Email address
                  <input
                    type="email"
                    name="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                  />
                </label>
              )}
              {['register', 'login', 'reset-password'].includes(kind) && (
                <label>
                  Password
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={kind === 'login' ? 1 : 12}
                    maxLength={128}
                    autoComplete={
                      kind === 'login' ? 'current-password' : 'new-password'
                    }
                  />
                  {kind !== 'login' && <small>At least 12 characters.</small>}
                </label>
              )}
              <button disabled={busy}>
                {busy
                  ? 'Please wait?'
                  : kind === 'verify'
                    ? 'Verify email'
                    : kind === 'login'
                      ? 'Sign in ?'
                      : kind === 'register'
                        ? 'Create workspace ?'
                        : kind === 'forgot-password'
                          ? 'Prepare reset email'
                          : 'Update password'}
              </button>
            </form>
          )}
          <div className="links">
            {kind === 'login' ? (
              <>
                <a href="/register">Create an account</a>
                <a href="/forgot-password">Forgot password?</a>
              </>
            ) : (
              <a href="/login">? Back to sign in</a>
            )}
          </div>
          {kind === 'forgot-password' && (
            <p className="footnote">
              Local email is mocked. The developer inbox command can retrieve a
              reset link when you cannot sign in.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
