import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
      <p className="text-sm font-bold tracking-wide text-secondary uppercase">
        קהילת FlipTheScript
      </p>

      <h1 className="mt-4 text-4xl font-black text-balance sm:text-5xl md:text-6xl">
        לומדים <span className="text-primary">DevOps</span> ו-
        <span className="text-secondary">AWS</span> דרך עשייה
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-balance">
        קורסים ומעבדות מעשיות בחינם, שנבנים על ידי אנשי קהילה בשביל אנשי
        קהילה — לומדים, מתנסים בסביבות אמיתיות, וצוברים ניסיון פרקטי בדרך
        לקריירה בענן.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button
          size="lg"
          className="px-6 text-base font-extrabold"
          render={<a href="#offerings" />}
        >
          יוצאים לדרך!
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="px-6 text-base"
          render={<a href="#mission" />}
        >
          למי זה מתאים?
        </Button>
      </div>

      <div className="gradient-divider mt-16" />
    </section>
  );
}
