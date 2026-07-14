'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import AuthButton from '@/components/AuthButton';

const navLinks = [
  { href: '/dashboard', label: 'タスクを依頼する' },
  { href: '/tasks', label: 'タスクを探す' },
  { href: '/mypage', label: 'マイページ', authOnly: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authUser, setAuthUser] = useState<{ name: string; avatarUrl?: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setAuthUser({
          name:
            user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            user.email?.split('@')[0] ??
            'User',
          avatarUrl: user.user_metadata?.avatar_url,
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user;
      if (u) {
        setAuthUser({
          name:
            u.user_metadata?.full_name ??
            u.user_metadata?.name ??
            u.email?.split('@')[0] ??
            'User',
          avatarUrl: u.user_metadata?.avatar_url,
        });
      } else {
        setAuthUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-gray-900 hover:opacity-70 transition-opacity">
          <Image src="/icon.svg" alt="altago" width={28} height={28} />
          altago
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.filter((link) => !link.authOnly || authUser).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'text-gray-900 bg-gray-100'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-3">
            <AuthButton user={authUser} />
          </div>
        </nav>

        {/* Mobile menu button */}
        <button
          className="sm:hidden rounded-md p-2 text-gray-600 hover:bg-gray-100"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="メニューを開く"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="sm:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 flex flex-col gap-1">
          {navLinks.filter((link) => !link.authOnly || authUser).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                'rounded-md px-4 py-3 text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 px-2">
            <AuthButton user={authUser} />
          </div>
        </nav>
      )}
    </header>
  );
}
