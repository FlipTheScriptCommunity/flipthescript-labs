'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navLinks = [
  { label: 'קורסים', href: '/courses' },
  // '/#mission', not a bare '#mission': the mission section only exists on
  // the homepage, so a same-page-only hash href silently did nothing on
  // any other route (e.g. /courses) — there's no id="mission" there for
  // the browser to jump to. Prefixing with '/' sends the user home first,
  // then the hash resolves once that section actually exists in the DOM.
  { label: 'קהילה', href: '/#mission' },
  { label: 'GitHub', href: 'https://github.com/FlipTheScriptCommunity' },
];

export function SiteHeader() {
  // Below the md breakpoint the desktop <nav> (hidden md:flex) disappears
  // entirely with no fallback, which is what made קורסים/קהילה/GitHub
  // unreachable on mobile. This toggle drives a mobile-only dropdown panel
  // carrying the same links, opened via a hamburger button that only
  // renders below md (md:hidden — the mirror image of the desktop nav).
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/*
          <html dir="rtl"> means the first DOM child in this row sits on the
          right and the last one on the left. This first group is the
          right-hand cluster: the hamburger comes first within it (so it's
          the rightmost element overall — first thing reached reading
          right-to-left), with מצטרפים just to its left, matching how it
          used to sit next to the logo before the logo moved to the other
          side. מצטרפים is unconditional (no hidden/md:flex) since it's
          meant to show at every width now, not just desktop.
        */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={isMenuOpen ? 'סגירת התפריט' : 'פתיחת התפריט'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>

          {/* Same bug as קהילה above: get-involved-section only renders on
              the homepage, so this needs the leading '/' to work from
              other pages like /courses, not just a same-page hash. */}
          <Button render={<Link href="/#get-involved" />}>מצטרפים</Button>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) =>
            link.href.startsWith('/') ? (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>

        {/* Last child = leftmost under dir="rtl", per the logo-on-the-left request. */}
        <Link
          href="/"
          className="text-xl font-black"
          onClick={() => setIsMenuOpen(false)}
        >
          Flip<span className="text-primary">TheScript</span>
        </Link>
      </div>

      {isMenuOpen && (
        <nav className="border-t border-border bg-background px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) =>
              link.href.startsWith('/') ? (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ),
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
