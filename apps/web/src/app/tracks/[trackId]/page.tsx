import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { getTrackById, type Guide } from '@/data/tracks';

interface TrackPageProps {
  params: Promise<{ trackId: string }>;
}

const cardClassName =
  'rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary';

function GuideGrid({ trackId, guides }: { trackId: string; guides: Guide[] }) {
  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {guides.map((guide) => (
        <Link
          key={guide.id}
          href={`/tracks/${trackId}/guides/${guide.id}`}
          className={cardClassName}
        >
          <h3 className="text-lg font-bold">{guide.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{guide.summary}</p>
        </Link>
      ))}
    </div>
  );
}

export default async function TrackPage({ params }: TrackPageProps) {
  const { trackId } = await params;
  const track = getTrackById(trackId);

  if (!track) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-4xl px-6 pt-20 pb-8 text-center">
          <h1 className="text-4xl font-black text-balance sm:text-5xl">
            {track.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-balance">
            {track.description}
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-8">
          <h2 className="text-xl font-bold">הדרכות</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            יוצרים את השירותים הבסיסיים צעד אחר צעד, בסימולציה של מסוף AWS.
          </p>
          <GuideGrid trackId={track.id} guides={track.guides} />
        </section>

        {track.setup.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-8">
            <h2 className="text-xl font-bold">הכנת סביבה</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              מקימים סביבת AWS מקומית על המחשב, לקראת המעבדות.
            </p>
            <GuideGrid trackId={track.id} guides={track.setup} />
          </section>
        )}

        <section className="mx-auto max-w-6xl px-6 pt-8 pb-16">
          <h2 className="text-xl font-bold">מעבדות</h2>
          <div className="mt-6 rounded-xl border border-dashed border-border p-6 text-center">
            <p className="text-lg font-bold text-primary">בקרוב</p>
            <p className="mt-2 text-sm text-muted-foreground">
              אתגרים שמחברים כמה שירותים יחד, על סביבת Floci מקומית, עם בדיקה
              אוטומטית של הפתרון.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
