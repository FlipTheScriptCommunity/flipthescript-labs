import './global.css';
import { Rubik } from 'next/font/google';
import { cn } from '@/lib/utils';

const rubik = Rubik({ subsets: ['latin', 'hebrew'], variable: '--font-sans' });

export const metadata = {
  title: 'FlipTheScript Labs',
  description:
    'קורסים ומעבדות בחינם ללימוד DevOps ו-AWS, שנבנים על ידי קהילת FlipTheScript.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={cn('font-sans', rubik.variable)}>
      <body>{children}</body>
    </html>
  );
}
