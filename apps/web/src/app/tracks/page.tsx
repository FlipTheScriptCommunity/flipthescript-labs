import Link from 'next/link';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { tracks } from '@/data/tracks';

export const metadata = {
  title: 'מסלולים | FlipTheScript Labs',
};

export default function TracksPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-4xl px-6 pt-20 pb-8 text-center">
          <h1 className="text-4xl font-black text-balance sm:text-5xl">
            מסלולים
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-balance">
            מתחילים בהדרכות צעד אחר צעד ב-DevOps וב-AWS, ובהמשך עוברים לאתגרים
            מעשיים.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tracks.map((track) => (
              <Link
                key={track.id}
                href={`/tracks/${track.id}`}
                className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary"
              >
                <h2 className="text-lg font-bold">{track.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {track.description}
                </p>
                <p className="mt-4 text-xs font-medium text-muted-foreground">
                  {track.guides.length + track.setup.length} הדרכות
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
