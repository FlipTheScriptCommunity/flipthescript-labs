import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { getCourseById, getLabById } from '@/data/courses';

interface LabPageProps {
  params: Promise<{ courseId: string; labId: string }>;
}

export default async function LabPage({ params }: LabPageProps) {
  const { courseId, labId } = await params;
  const course = getCourseById(courseId);
  const lab = getLabById(courseId, labId);

  if (!course || !lab) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
          <Link
            href={`/courses/${course.id}`}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ← {course.title}
          </Link>

          <h1 className="mt-4 text-4xl font-black text-balance sm:text-5xl">
            {lab.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-balance">
            {lab.summary}
          </p>

          <div className="gradient-divider mt-16" />

          <p className="mt-10 text-lg font-bold text-primary">בקרוב</p>
          <p className="mt-2 text-sm text-muted-foreground">
            תוכן המעבדה נמצא בבנייה. חזרו לבקר בקרוב.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
