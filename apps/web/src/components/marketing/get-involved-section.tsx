import { Button } from '@/components/ui/button';

export function GetInvolvedSection() {
  return (
    <section id="get-involved" className="px-6 py-20">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card px-8 py-12 text-center">
        <h2 className="text-3xl font-black sm:text-4xl">מוכנים להצטרף?</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          בין אם באתם ללמוד ובין אם באתם לבנות ולתרום — יש כאן מקום בשבילכם.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" className="px-6 text-base font-extrabold">
            להתחיל ללמוד
          </Button>
          <Button size="lg" variant="secondary" className="px-6 text-base">
            להצטרף כתורם/ת
          </Button>
        </div>
      </div>
    </section>
  );
}
