// Contributor card (Server Component, no client JS).
import type { Contributor } from '@/data/contributors';
import { getAvatarSource, getSocialLinks } from './contributor-display';
import type { SocialPlatform } from './contributor-display';
import { SOCIAL_ICONS } from './social-icons';

// Brand blue #2A8BF2 / brand purple #8E44AD, alternated by card index (Req 4.5).
const AVATAR_BORDERS = ['border-secondary', 'border-accent-purple'] as const;

// Teal is left out: white on #20B2AA is below the 3:1 non-text contrast minimum.
const LINK_BACKGROUNDS: Record<SocialPlatform, string> = {
  github: 'bg-accent-purple',
  linkedin: 'bg-secondary',
  website: 'bg-secondary',
  x: 'bg-accent-purple',
};

interface ContributorCardProps {
  contributor: Contributor;
  index: number;
}

export function ContributorCard({ contributor, index }: ContributorCardProps) {
  const avatar = getAvatarSource(contributor);
  const links = getSocialLinks(contributor);
  const border = AVATAR_BORDERS[index % AVATAR_BORDERS.length];
  const circle = `size-24 rounded-full border-[3px] ${border}`;

  return (
    <article className="flex h-full flex-col items-center rounded-xl border border-border bg-card p-6 text-center transition-colors hover:border-primary">
      {avatar.kind === 'image' ? (
        <img
          src={avatar.src}
          alt={contributor.name}
          width={96}
          height={96}
          loading="lazy"
          decoding="async"
          className={`${circle} object-cover`}
        />
      ) : (
        // Decorative: the name is rendered right below as the h2.
        <div
          aria-hidden="true"
          className={`${circle} flex items-center justify-center bg-muted text-2xl font-bold`}
        >
          {avatar.initials}
        </div>
      )}

      <h2 className="mt-4 text-lg font-bold">{contributor.name}</h2>
      {contributor.role && (
        <p className="mt-1 text-sm text-muted-foreground">{contributor.role}</p>
      )}

      {links.length > 0 && (
        <ul className="mt-4 flex flex-wrap justify-center gap-3">
          {links.map((link) => {
            const Icon = SOCIAL_ICONS[link.platform];
            return (
              <li key={link.platform}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className={`inline-flex size-9 items-center justify-center rounded-full ${LINK_BACKGROUNDS[link.platform]} text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`}
                >
                  <Icon className="size-4" />
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
