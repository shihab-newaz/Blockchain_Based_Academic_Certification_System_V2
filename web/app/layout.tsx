import type { Metadata } from 'next';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import { isAuthenticated } from '@/lib/session';
import { NavBar } from '@/components/NavBar';

export const metadata: Metadata = {
  title: 'Academic Certification System',
  description: 'Blockchain-based academic certificate issuance and verification',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const authenticated = await isAuthenticated();

  return (
    <html lang="en">
      <body>
        <NavBar authenticated={authenticated} />
        <div className="content-container">{children}</div>
      </body>
    </html>
  );
}
