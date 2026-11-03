import type { CSSProperties } from 'react';
export type IconName =
  | 'arrow'
  | 'code'
  | 'shield'
  | 'key'
  | 'pulse'
  | 'layers'
  | 'globe'
  | 'check'
  | 'chevron'
  | 'pause'
  | 'play'
  | 'database'
  | 'spark'
  | 'menu'
  | 'copy';
const paths: Record<IconName, string[]> = {
  arrow: ['M5 12h14', 'm13 6 6 6-6 6'],
  code: ['m8 6-6 6 6 6', 'm16 6 6 6-6 6', 'm14 3-4 18'],
  shield: ['M12 3 3 7v5c0 5 9 9 9 9s9-4 9-9V7l-9-4Z', 'm8 12 3 3 5-6'],
  key: ['M14 14a6 6 0 1 0-4-4L3 17v4h4v-3h3v-3l4-1Z'],
  pulse: ['M2 12h5l3-8 4 16 3-8h5'],
  layers: ['m12 3 10 6-10 6L2 9l10-6Z', 'm2 13 10 6 10-6', 'm2 17 10 6 10-6'],
  globe: [
    'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    'M3 12h18',
    'M12 3a17 17 0 0 1 0 18 17 17 0 0 1 0-18Z',
  ],
  check: ['m5 12 4 4L19 6'],
  chevron: ['m6 9 6 6 6-6'],
  pause: ['M8 5v14', 'M16 5v14'],
  play: ['m8 4 12 8-12 8V4Z'],
  database: [
    'M21 5c0 2-4 3-9 3S3 7 3 5s4-3 9-3 9 1 9 3Z',
    'M3 5v14c0 2 4 3 9 3s9-1 9-3V5',
    'M3 12c0 2 4 3 9 3s9-1 9-3',
  ],
  spark: ['m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  copy: ['M9 9h12v12H9z', 'M15 5V3H3v12h2'],
};
export function Icon({
  name,
  size = 20,
  style,
}: {
  name: IconName;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      {paths[name].map((d, i) => (
        <path d={d} key={i} />
      ))}
    </svg>
  );
}
export function Wordmark() {
  return (
    <span className="astro-wordmark">
      <svg
        width="29"
        height="29"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="1"
          y="1"
          width="30"
          height="30"
          rx="9"
          stroke="currentColor"
          opacity=".45"
        />
        <path d="m8 22 6-13h4l6 13h-4l-4-9-4 9H8Z" fill="currentColor" />
        <path d="M13 21h6" stroke="currentColor" strokeWidth="2" />
      </svg>
      autometa<span className="wordmark-dot">.</span>
    </span>
  );
}
