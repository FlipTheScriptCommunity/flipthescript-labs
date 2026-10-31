import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { ContributorCard } from '@/components/contributors/contributor-card';
import { contributors } from '@/data/contributors';

// Prerender at build time so contributors.yaml is always validated by the Build.
export const dynamic = 'force-static';

export const metadata = {
  title: 'משתתפים | FlipTheScript Labs',
};

export default function ContributorsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-4xl px-6 pt-20 pb-8 text-center">
          <h1 className="text-4xl font-black text-balance sm:text-5xl">
            משתתפים
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-balance">
            האנשים שבונים את FlipTheScript Labs ומשתפים את הידע שלהם עם הקהילה.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {contributors.map((contributor, index) => (
              <li key={`${index}-${contributor.name}`}>
                <ContributorCard contributor={contributor} index={index} />
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
