import Link from 'next/link';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { courses } from '@/data/courses';

export const metadata = {
  title: 'קורסים | FlipTheScript Academy',
};

export default function CoursesPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-4xl px-6 pt-20 pb-8 text-center">
          <h1 className="text-4xl font-black text-balance sm:text-5xl">
            קורסים
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-balance">
            תכנים מובנים ומעבדות מעשיות ב-DevOps וב-AWS.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary"
              >
                <h2 className="text-lg font-bold">{course.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {course.description}
                </p>
                <p className="mt-4 text-xs font-medium text-muted-foreground">
                  {course.labs.length} מעבדות
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
