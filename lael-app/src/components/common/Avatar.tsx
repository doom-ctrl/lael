import * as React from 'react';
import { cn, getInitials } from '@/lib/utils';

/**
 * Avatar — circular image with initials fallback.
 *
 * Used in three places that all want the same look: the navbar
 * popover button, the auth screen's logo lockup, and the Settings
 * Profile section. Pass `src` to show the image; if the URL fails to
 * load (or no `src` is provided) the initials are rendered in the
 * warm-accent circle that matches the existing brand color.
 *
 * The container is always the same size as `size` so callers can
 * align them in a flex row without layout shifts between image and
 * initials modes.
 */
interface AvatarProps {
  /** Image URL (`null` = fall through to initials). */
  src?: string | null;
  /** Name used for the initials + `alt` fallback. */
  name?: string | null;
  /** Email used as initials fallback when `name` is missing. */
  email?: string | null;
  /** Diameter in px. Defaults to 36 (matches the auth layout). */
  size?: number;
  className?: string;
}

export function Avatar({
  src,
  name,
  email,
  size = 36,
  className,
}: AvatarProps) {
  // Track image load failures so we swap to initials instead of
  // showing a broken-image glyph. Most common case: the storage URL
  // expired between page loads and hasn't been re-resolved yet.
  // We compare against the URL itself (rather than a boolean flag)
  // so a *new* src is always tried even if a previous one failed.
  const [erroredSrc, setErroredSrc] = React.useState<string | null>(null);
  const showImage = !!src && src !== erroredSrc;

  const fontSize = Math.max(11, Math.round(size * 0.4));
  const initials = getInitials(name ?? email ?? '?');

  return (
    <div
      className={cn(
        'flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full',
        'border border-accent-border bg-accent-light text-accent',
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden={showImage ? 'true' : undefined}
    >
      {showImage ? (
        <img
          src={src!}
          alt={name ?? 'Profile photo'}
          className="h-full w-full object-cover"
          onError={() => setErroredSrc(src!)}
          draggable={false}
        />
      ) : (
        <span
          className="font-display font-semibold italic"
          style={{ fontSize }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
