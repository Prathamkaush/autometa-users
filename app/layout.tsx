import type { Metadata } from 'next';
import './styles.css';
export const metadata: Metadata = {
  title: 'Autometa | Business workspace',
  description: 'Your business integration workspace',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
