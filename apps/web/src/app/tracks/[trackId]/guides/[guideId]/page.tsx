import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { GuideEmbed } from '@/components/guides/guide-embed';
import { getTrackById, getGuideById } from '@/data/tracks';

interface GuidePageProps {
  params: Promise<{ trackId: string; guideId: string }>;
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { trackId, guideId } = await params;
  const track = getTrackById(trackId);
  const guide = getGuideById(trackId, guideId);

  if (!track || !guide) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-4xl px-6 pt-14 pb-8 text-center">
          <Link
            href={`/tracks/${track.id}`}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ← {track.title}
          </Link>

          <h1 className="mt-4 text-4xl font-black text-balance sm:text-5xl">
            {guide.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-balance">
            {guide.summary}
          </p>
        </section>

        {guide.about && guide.about.length > 0 && (
          <section className="mx-auto max-w-3xl px-6 pb-12">
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <h2 className="text-xl font-bold">על ההדרכה</h2>
              <div className="mt-4 space-y-4">
                {guide.about.map((paragraph) => (
                  <p key={paragraph} className="text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}

        {guide.embedPath ? (
          <section className="mx-auto max-w-7xl px-6 pb-16">
            <GuideEmbed
              src={guide.embedPath}
              title={`${guide.title} — Interactive guide`}
            />
          </section>
        ) : (
          <section className="mx-auto max-w-4xl px-6 pb-16 text-center">
            <div className="gradient-divider mt-8" />

            <p className="mt-10 text-lg font-bold text-primary">בקרוב</p>
            <p className="mt-2 text-sm text-muted-foreground">
              תוכן ההדרכה נמצא בבנייה. חזרו לבקר בקרוב.
            </p>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
