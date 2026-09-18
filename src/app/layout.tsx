import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CIRE — Career Intelligence & Resume Engine',
  description: 'Evidence-grounded career knowledge base and ATS-friendly tailored resume engine.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
