import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NUWRRRLD - Futuristic Display',
  description: 'An immersive 3D industrial environment with futuristic displays',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
