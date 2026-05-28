'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/dashboard', label: 'タスクを依頼する' },
  { href: '/tasks', label: 'タスクを探す' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
        {/* Logo */}
        <Link href="/" className="font-bold text-xl tracking-tight text-gray-900 hover:opacity-70 transition-opacity">
          altago
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map((link) => (
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
          <Link
            href="/dashboard"
            className="ml-3 rounded-md px-5 py-2 text-sm font-semibold text-white transition-colors" style={{ background: '#007B63' }}
          >
            はじめる
          </Link>
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
          {navLinks.map((link) => (
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
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="mt-2 rounded-md px-4 py-3 text-sm font-semibold text-white text-center transition-colors" style={{ background: '#007B63' }}
          >
            はじめる
          </Link>
        </nav>
      )}
    </header>
  );
}
