import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'D&D Booking',
  description: 'Calendar booking for Dungeons & Dragons campaigns',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
