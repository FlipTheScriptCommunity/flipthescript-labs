'use client';

import { useEffect, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LabEmbedProps {
  src: string;
  title: string;
}

export function LabEmbed({ src, title }: LabEmbedProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Escape exits fullscreen, and the background page shouldn't scroll behind it.
  useEffect(() => {
    if (!isFullscreen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isFullscreen]);

  return (
    <div
      dir="ltr"
      className={cn(
        'relative',
        isFullscreen
          ? 'fixed inset-0 z-50 bg-card'
          : 'overflow-hidden rounded-xl border border-border bg-card shadow-2xl',
      )}
    >
      {/*
        Bottom-right on purpose: the embedded AWS console has its own top nav
        utilities hugging the top-right corner, so a toggle placed there would
        overlap it. This corner stays clear in Cloudscape's layout.
      */}
      <button
        type="button"
        onClick={() => setIsFullscreen((value) => !value)}
        className="absolute right-4 bottom-4 z-10 inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-lg backdrop-blur transition-colors hover:border-primary hover:text-primary"
      >
        {isFullscreen ? (
          <>
            <Minimize2 className="size-3.5" />
            יציאה ממסך מלא
          </>
        ) : (
          <>
            <Maximize2 className="size-3.5" />
            מסך מלא
          </>
        )}
      </button>

      <iframe
        src={src}
        title={title}
        loading="lazy"
        className={cn('w-full border-0', isFullscreen ? 'h-screen' : 'h-[85vh] min-h-[720px]')}
      />
    </div>
  );
}
