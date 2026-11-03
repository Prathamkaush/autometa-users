'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon, Wordmark } from './Icons';
export default function MarketingShell({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false),
    [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener('change', sync);
    const element = root.current;
    let observer: IntersectionObserver | undefined;
    if (element && 'IntersectionObserver' in window) {
      element.dataset.motionReady = 'true';
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries)
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer?.unobserve(entry.target);
            }
        },
        { threshold: 0.08 },
      );
      element
        .querySelectorAll('[data-reveal]')
        .forEach((e) => observer!.observe(e));
    }
    return () => {
      media.removeEventListener('change', sync);
      observer?.disconnect();
    };
  }, []);
  const links = [
    ['Platform', '/#platform'],
    ['How it works', '/#integration'],
    ['Developers', '/docs'],
    ['FAQ', '/#faq'],
  ];
  return (
    <div
      ref={root}
      className={'astro' + (paused || reduced ? ' motion-paused' : '')}
    >
      <a className="astro-skip" href="#main-content">
        Skip to content
      </a>
      <header className="astro-header">
        <div className="astro-container astro-nav">
          <a href="/" aria-label="Autometa home">
            <Wordmark />
          </a>
          <nav className="astro-desktop-nav" aria-label="Main navigation">
            {links.map(([text, href]) => (
              <a href={href} key={href}>
                {text}
              </a>
            ))}
          </nav>
          <div className="astro-nav-actions">
            <button
              className="motion-toggle"
              type="button"
              disabled={reduced}
              aria-pressed={paused || reduced}
              onClick={() => setPaused(!paused)}
              aria-label={
                reduced
                  ? 'Motion disabled by your system preference'
                  : paused
                    ? 'Resume animations'
                    : 'Pause animations'
              }
              title={
                reduced
                  ? 'Reduced motion follows your system preference'
                  : paused
                    ? 'Resume animations'
                    : 'Pause animations'
              }
            >
              <Icon name={paused || reduced ? 'play' : 'pause'} size={13} />
              <span>
                {reduced ? 'Motion off' : paused ? 'Resume' : 'Pause'}
              </span>
            </button>
            <a className="astro-signin" href="/login">
              Sign in
            </a>
            <a className="astro-btn astro-btn-small" href="/register">
              Get started <Icon name="arrow" size={14} />
            </a>
            <details className="astro-mobile-nav">
              <summary aria-label="Open navigation">
                <Icon name="menu" />
              </summary>
              <nav aria-label="Mobile navigation">
                {links.map(([text, href]) => (
                  <a
                    href={href}
                    key={href}
                    onClick={(e) => {
                      const menu = e.currentTarget.closest('details');
                      if (menu) menu.open = false;
                    }}
                  >
                    {text}
                  </a>
                ))}
                <a href="/login">Sign in</a>
              </nav>
            </details>
          </div>
        </div>
      </header>
      {children}
      <footer className="astro-footer">
        <div className="astro-container">
          <div className="astro-footer-top">
            <div>
              <a href="/" aria-label="Autometa home">
                <Wordmark />
              </a>
              <p>
                Keep your stack.
                <br />
                Build what comes next.
              </p>
            </div>
            <nav aria-label="Footer navigation">
              <a href="/docs">Developer docs</a>
              <a href="/register">Create workspace</a>
              <a href="/dashboard">Your dashboard</a>
              <a href="/#faq">Questions & answers</a>
            </nav>
          </div>
          <div className="astro-footer-bottom">
            <span>© 2026 Autometa</span>
            <span>
              <i className="status-dot" /> Developer preview · Account setup
              available
            </span>
            <a href="/docs#availability">
              Platform availability <Icon name="arrow" size={12} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
