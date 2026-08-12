import { BookOpen, FlaskConical, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';

const offerings = [
  {
    title: 'קורסים בחינם',
    description:
      'תכנים מובנים ועדכניים ב-DevOps וב-AWS, שנכתבים ומתעדכנים על ידי הקהילה.',
    icon: BookOpen,
    bg: 'bg-secondary',
  },
  {
    title: 'מעבדות מעשיות',
    description:
      'לא רק תיאוריה — כל נושא מלווה במעבדה שבה מתרגלים על אמת, שלב אחר שלב.',
    icon: FlaskConical,
    bg: 'bg-accent-purple',
  },
  {
    title: 'סביבת AWS לתרגול',
    description:
      'סביבות ענן מוכנות לתרגול, כדי שתתמקדו בלמידה ולא בהקמת תשתית.',
    icon: Cloud,
    bg: 'bg-accent-teal',
  },
];

export function OfferingsSection() {
  return (
    <section id="offerings" className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-6 sm:grid-cols-3">
        {offerings.map((offering) => (
          <div
            key={offering.title}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div
              className={cn(
                'flex size-12 items-center justify-center rounded-full',
                offering.bg,
              )}
            >
              <offering.icon className="size-6 text-white" />
            </div>
            <h3 className="mt-4 text-lg font-bold">{offering.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {offering.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
