import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { getCourseById } from '@/data/courses';

interface CoursePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = await params;
  const course = getCourseById(courseId);

  if (!course) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-4xl px-6 pt-20 pb-8 text-center">
          <h1 className="text-4xl font-black text-balance sm:text-5xl">
            {course.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-balance">
            {course.description}
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-xl font-bold">מעבדות</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {course.labs.map((lab) => (
              <Link
                key={lab.id}
                href={`/courses/${course.id}/labs/${lab.id}`}
                className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary"
              >
                <h3 className="text-lg font-bold">{lab.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {lab.summary}
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
