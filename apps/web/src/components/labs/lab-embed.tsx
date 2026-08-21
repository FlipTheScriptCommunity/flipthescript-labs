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
    <div dir="ltr" className={cn('relative', isFullscreen && 'fixed inset-0 z-50 bg-card')}>
      {/*
        Bottom-right on purpose: the embedded AWS console has its own top nav
        utilities hugging the top-right corner, so a toggle placed there would
        overlap it. This corner stays clear in Cloudscape's layout.

        The button lives inside a full-height overlay (absolute inset-0, so it
        takes no layout space of its own) and is itself position: sticky. That
        keeps it pinned to the browser's own bottom edge for as long as any
        part of the card is in view — needed because min-h-[720px] below can
        make the card taller than a shorter browser window, which used to push
        an absolute-positioned button (anchored to the card's own bottom edge)
        out of view until the user scrolled all the way down.

        items-end overrides flex's default align-items: stretch (which
        otherwise stretched the button to the overlay's full height instead
        of sizing it to its own content) and anchors the button's normal,
        unstuck position at the BOTTOM of the overlay, matching where it
        used to sit with plain absolute positioning. That direction matters:
        sticky bottom-4 only engages once scrolling would otherwise carry
        the element's normal position past that offset — with a top-anchored
        normal position (items-start) there was nothing for it to catch, so
        it silently never stuck at all, identical to plain static
        positioning, while scrolling down through a card taller than the
        viewport.

        This overlay (and the sticky button in it) must be a sibling of the
        overflow-hidden/rounded card below, not a descendant of it: position:
        sticky is inert under any ancestor with overflow other than visible
        (it silently behaves like static positioning — no error, it just
        never sticks), and overflow-hidden was on the outer card wrapper here
        for the rounded-corner clipping. Moving overflow-hidden down onto a
        wrapper around just the iframe keeps the same visual clipping while
        leaving the button's ancestor chain up to the real page scroll clean.
      */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-end">
        <button
          type="button"
          onClick={() => setIsFullscreen((value) => !value)}
          className="pointer-events-auto sticky bottom-4 mr-4 inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-lg backdrop-blur transition-colors hover:border-primary hover:text-primary"
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
      </div>

      <div className={cn(!isFullscreen && 'overflow-hidden rounded-xl border border-border bg-card shadow-2xl')}>
        <iframe
          src={src}
          title={title}
          loading="lazy"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          className={cn('w-full border-0', isFullscreen ? 'h-screen' : 'h-[85vh] min-h-[720px]')}
        />
      </div>
    </div>
  );
}
