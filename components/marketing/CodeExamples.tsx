'use client';
import { useId, useState, type KeyboardEvent } from 'react';
import {
  examples,
  languages,
  type Language,
  type ExampleMode,
} from '../../lib/integration-examples';
import { Icon } from './Icons';
export function CopyBlock({
  code,
  label = 'example',
}: {
  code: string;
  label?: string;
}) {
  const [status, setStatus] = useState('');
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus('Copied');
    } catch {
      setStatus('Select the code to copy');
    }
  }
  return (
    <div className="astro-plain-code">
      <button
        type="button"
        className="code-copy"
        aria-label={'Copy ' + label}
        onClick={() => void copy()}
      >
        <Icon name={status === 'Copied' ? 'check' : 'copy'} size={13} />
        {status || 'Copy'}
      </button>
      <pre tabIndex={0} aria-label={label}>
        <code>{code}</code>
      </pre>
      <span role="status" className="astro-sr-only">
        {status}
      </span>
    </div>
  );
}
function Highlight({ code }: { code: string }) {
  return (
    <>
      {code.split('\n').map((line, index) => (
        <span
          className={
            'code-line' + (/^\s*(\/\/|#)/.test(line) ? ' code-comment' : '')
          }
          key={index}
        >
          {/^\s*(\/\/|#)/.test(line)
            ? line
            : line.split(/('[^']*'|"[^"]*")/).map((part, i) => (
                <span
                  key={i}
                  className={/^["']/.test(part) ? 'code-string' : undefined}
                >
                  {part}
                </span>
              ))}
          {'\n'}
        </span>
      ))}
    </>
  );
}
export default function CodeExamples({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [language, setLanguage] = useState<Language>('Node.js'),
    [mode, setMode] = useState<ExampleMode>('verify'),
    [copyState, setCopyState] = useState('');
  const id = useId(),
    example = examples[mode][language];
  function onKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % languages.length;
    else if (event.key === 'ArrowLeft')
      next = (index - 1 + languages.length) % languages.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = languages.length - 1;
    else return;
    event.preventDefault();
    setLanguage(languages[next]);
    setCopyState('');
    const tabs =
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
        '[role=tab]',
      );
    tabs?.[next]?.focus();
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(example.code);
      setCopyState('Copied');
    } catch {
      setCopyState('Select code to copy');
    }
  }
  return (
    <div className={'code-examples' + (compact ? ' code-compact' : '')}>
      {!compact && (
        <div className="example-modes">
          <button
            type="button"
            className={mode === 'verify' ? 'selected' : ''}
            aria-pressed={mode === 'verify'}
            onClick={() => {
              setMode('verify');
              setCopyState('');
            }}
          >
            Verify API key <span>Available</span>
          </button>
          <button
            type="button"
            className={mode === 'event' ? 'selected' : ''}
            aria-pressed={mode === 'event'}
            onClick={() => {
              setMode('event');
              setCopyState('');
            }}
          >
            Submit an event <span>Available</span>
          </button>
        </div>
      )}
      {mode === 'event' && (
        <div className="docs-callout docs-callout-amber">
          <strong>Enable Email automation in your dashboard first.</strong> Use
          the original submission timestamp and only request an acknowledgement
          when the customer requested a response. HTTP 202 means accepted for
          processing.
        </div>
      )}
      <div className="code-window">
        <div className="code-topline">
          <div className="window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <span>{example.file}</span>
          <span
            className={
              'endpoint-chip ' + (mode === 'event' ? 'is-planned' : '')
            }
          >
            <b>{mode === 'verify' ? 'GET' : 'POST'}</b> /
            {mode === 'verify' ? 'usage' : 'events'}
          </span>
        </div>
        <div className="code-tabs" role="tablist" aria-label="Example language">
          {languages.map((lang, index) => (
            <button
              key={lang}
              id={id + '-tab-' + index}
              role="tab"
              aria-selected={language === lang}
              aria-controls={id + '-panel'}
              tabIndex={language === lang ? 0 : -1}
              onKeyDown={(e) => onKey(e, index)}
              onClick={() => {
                setLanguage(lang);
                setCopyState('');
              }}
            >
              {lang}
            </button>
          ))}
        </div>
        <div
          className="code-panel"
          id={id + '-panel'}
          role="tabpanel"
          aria-labelledby={id + '-tab-' + languages.indexOf(language)}
        >
          <button
            className="code-copy"
            type="button"
            onClick={() => void copy()}
            aria-label={
              'Copy ' +
              language +
              ' ' +
              (mode === 'verify' ? 'verification' : 'planned event') +
              ' example'
            }
          >
            <Icon name={copyState === 'Copied' ? 'check' : 'copy'} size={13} />
            {copyState || 'Copy'}
          </button>
          <pre tabIndex={0}>
            <code>
              <Highlight code={example.code} />
            </code>
          </pre>
        </div>
        <div className="code-status">
          <i className="status-dot" />
          <span>
            {mode === 'verify'
              ? 'Server-side only · 3-second deadline'
              : 'Planned endpoint · stable idempotency key'}
          </span>
          <span role="status">
            {copyState === 'Copied' ? 'Copied to clipboard' : ''}
          </span>
        </div>
      </div>
      {!compact && <p className="example-note">{example.note}</p>}
    </div>
  );
}
