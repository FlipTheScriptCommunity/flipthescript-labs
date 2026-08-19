import Link from 'next/link';
import { Button } from '@/components/ui/button';

const navLinks = [
  { label: 'קורסים', href: '/courses' },
  { label: 'מעבדות', href: '/courses' },
  { label: 'קהילה', href: '#mission' },
  { label: 'GitHub', href: 'https://github.com/FlipTheScriptCommunity' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-black">
          Flip<span className="text-primary">TheScript</span>
        </Link>

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

        <Button render={<a href="#get-involved" />}>מצטרפים</Button>
      </div>
    </header>
  );
}
