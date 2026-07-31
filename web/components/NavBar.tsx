'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function NavBar({ authenticated }: { authenticated: boolean }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div>
          <Link href="/">Issue Certificate</Link>
          <Link href="/view-certificate">View Certificate</Link>
        </div>
        <div>{authenticated ? <button onClick={handleLogout}>Log out</button> : <Link href="/login">Log in</Link>}</div>
      </div>
    </nav>
  );
}
