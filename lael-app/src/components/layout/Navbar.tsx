import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Plus, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/useAuth';
import { authClient } from '@/lib/auth-client';
import { useAddAssessmentDialog } from '@/components/modals/AddAssessmentDialogProvider';
import { useCommandPalette } from '@/components/providers/CommandPaletteProvider';
import { toast } from '@/components/providers/Toaster';
import { Avatar } from '@/components/common/Avatar';
import { useUserImage } from '@/features/profile/useUserImage';

interface NavbarProps {
  /** Optional click handler override (e.g. in tests). Falls back to the global dialog. */
  onAddClick?: () => void;
}

interface NavItem {
  label: string;
  path: string;
  key: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', key: 'dashboard' },
  { label: 'Assessments', path: '/assessments', key: 'assessments' },
  { label: 'Calendar', path: '/calendar', key: 'calendar' },
  { label: 'Settings', path: '/settings', key: 'settings' },
];

/**
 * Navbar — sticky top floating bar.
 *
 * Becomes more opaque + gains a border when the page scrolls. Avatar
 * shows the signed-in user's first initial; clicking it opens a popover
 * with a Sign-out action.
 */
export function Navbar({ onAddClick }: NavbarProps) {
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  // Mobile nav drawer — separate state from the avatar menu so
  // they can be open/closed independently.
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dialog = useAddAssessmentDialog();
  const palette = useCommandPalette();
  const handleAddClick = onAddClick ?? dialog.open;
  const { user } = useAuth();
  const { imageUrl } = useUserImage();
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll(); // initial check
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-close the mobile drawer on route change.
  React.useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  // Close the avatar menu on outside click / Escape.
  React.useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const activeKey = React.useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/assessments')) return 'assessments';
    if (path.startsWith('/calendar')) return 'calendar';
    if (path.startsWith('/settings')) return 'settings';
    return 'dashboard';
  }, [location.pathname]);

  const handleSignOut = async () => {
    setMenuOpen(false);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success('Signed out');
            navigate('/sign-in', { replace: true });
          },
        },
      });
    } catch (err) {
      toast.error('Could not sign out');
    }
  };

  const displayName = user?.name ?? user?.email ?? '?';

  return (
    // Floating pill nav — sits centered at the top of the page instead of
    // spanning full width. The outer wrapper is just a positioning slot
    // (sticky + a bit of top padding so the pill clears the viewport edge
    // and doesn't clip behind the scrollbar). The pill itself carries the
    // visual treatment: rounded-full, warm translucent tint, backdrop-blur.
    // On scroll the pill tightens its shadow + border so it reads as
    // "settled" rather than floating in the void.
    <nav
      className={cn(
        'sticky top-3 z-[100] px-3 sm:top-4 sm:px-4',
      )}
    >
      <div
        className={cn(
          // Compression on scroll: pill keeps a fixed-px width that
          // interpolates between top and scrolled states; inner
          // children also collapse so content always fits. Opacity
          // fades in on entry and dips slightly when scrolled to
          // visually settle. `overflow-hidden` keeps the inner
          // collapse from spilling during the transition.
          'mx-auto flex items-center overflow-hidden rounded-full',
          'border border-border bg-[var(--color-navbar-bg)] backdrop-blur-[16px]',
          // Default (top of page) — generous, roomy.
          'h-10 gap-3 px-2.5',
          // Scrolled — compact (desktop only).
          scrolled && 'md:h-9 md:gap-2 md:px-2',
          'transition-[height,gap,padding,box-shadow,border-color,opacity] duration-300 ease-out motion-reduce:duration-0',
          scrolled ? 'shadow-soft' : 'shadow-none',
        )}
        style={{
          // Width is `max-content` (intrinsic to children) so the pill
          // sizes itself — no fixed-px guessing, no clipping. The
          // child collapses (search → icon-only, Add → icon-only,
          // nav gap-0) drive the natural width shrink on scroll.
          // `max-w` keeps it inside the viewport gutter. Opacity
          // dips on scroll so the settled pill feels quieter.
          width: 'max-content',
          maxWidth: 'calc(100vw - 32px)',
          opacity: scrolled ? 0.92 : 1,
        }}
      >
        {/* Logo — sized down a touch to suit the shorter pill bar. */}
        <Link
          to="/"
          className="flex flex-shrink-0 items-center gap-2 text-text-primary no-underline"
        >
          <img src="/logo.svg" alt="" aria-hidden="true" className="h-7 w-7" />
          <span className="font-display text-lg font-normal italic tracking-[-0.02em] text-text-primary">
            Lael
          </span>
        </Link>

        {/* Vertical divider — only on desktop. A subtle hairline inside
            the pill separates the brand from the section nav, matching
            how Linear / Stripe-style floating pills chunk their content. */}
        <div className="hidden h-5 w-px bg-border md:block" aria-hidden="true" />

        {/* Nav links — hidden on mobile, shown in the hamburger drawer
            instead. When the pill compresses on scroll, nav links
            shrink padding + gap so the compressed state reads tighter
            (matching Linear's behavior). */}
        <div
          className={cn(
            'hidden items-center transition-[gap] duration-300 ease-out motion-reduce:duration-0 md:flex',
            scrolled ? 'gap-0' : 'gap-1',
          )}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = item.key === activeKey;
            return (
              <Link
                key={item.key}
                to={item.path}
                className={cn(
                  'rounded-full text-[13.5px] no-underline transition-[padding] duration-300 ease-out motion-reduce:duration-0',
                  scrolled ? 'px-3 py-1' : 'px-4 py-1.5',
                  isActive
                    ? 'bg-accent-light font-medium text-accent'
                    : 'font-normal text-text-secondary hover:text-text-primary',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right side — pushed to the right edge of the pill. The parent
            `gap-3` already spaces these siblings, so this wrapper
            stays gap-free (otherwise gaps double up and inflate the
            pill width by ~16px). */}
        <div className="ml-auto flex items-center">
          <div className="hidden h-5 w-px bg-border md:block" aria-hidden="true" />

          <button
            type="button"
            onClick={palette.open}
            title="Search (⌘K)"
            aria-label="Search"
            className={cn(
              'flex h-8 items-center gap-2 overflow-hidden whitespace-nowrap rounded-full',
              'border border-border bg-surface text-text-secondary',
              'hover:bg-bg-warm',
              'justify-center p-0',
              'transition-[width,padding] duration-300 ease-out motion-reduce:duration-0',
            )}
            style={{
              width: scrolled ? 32 : 180,
              paddingLeft: scrolled ? 0 : 12,
              paddingRight: scrolled ? 0 : 10,
            }}
          >
            <Search className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.4} />
            <span
              className={cn(
                'text-left text-[12px] text-text-tertiary',
                scrolled ? 'sr-only' : 'sm:flex-1',
              )}
            >
              Search…
            </span>
            <kbd
              className={cn(
                'rounded border border-border-light bg-bg-warm px-1.5 py-0.5',
                'text-[10px] font-medium font-mono tracking-wider text-text-tertiary',
                scrolled ? 'hidden' : 'hidden sm:inline-block',
              )}
            >
              ⌘K
            </kbd>
          </button>

          <Button
            onClick={handleAddClick}
            // Mobile: icon-only circle. Desktop: pill matching the
            // search. When the parent pill compresses on scroll we
            // also collapse this to icon-only so the cluster fits.
            className={cn(
              'h-8 overflow-hidden whitespace-nowrap rounded-full p-0',
              'transition-[width,padding] duration-300 ease-out motion-reduce:duration-0',
            )}
            style={{
              width: scrolled ? 32 : 148,
              paddingLeft: scrolled ? 0 : 16,
              paddingRight: scrolled ? 0 : 16,
            }}
            aria-label="Add Assessment"
          >
            <Plus className="h-3 w-3 flex-shrink-0" strokeWidth={1.8} />
            <span
              className={cn(
                'text-[13px]',
                scrolled ? 'sr-only' : 'ml-1.5',
              )}
            >
              Add Assessment
            </span>
          </Button>

          {/* Mobile menu toggle — only shown below `md`. Sits inside the
              pill, so it's a small circle matching the other icon buttons. */}
          <button
            type="button"
            onClick={() => setMobileNavOpen((o) => !o)}
            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileNavOpen}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface',
              'text-text-secondary transition-colors hover:bg-bg-warm md:hidden',
            )}
          >
            {mobileNavOpen ? (
              <X className="h-3.5 w-3.5" strokeWidth={1.6} />
            ) : (
              <Menu className="h-3.5 w-3.5" strokeWidth={1.6} />
            )}
          </button>

          {/* Avatar + sign-out menu — `size-8` on mobile so it fits the
              pill, grows to `size-9` from `sm` up. */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              title={displayName}
              className={cn(
                'transition-transform hover:scale-105 rounded-full',
              )}
            >
              <Avatar
                src={imageUrl}
                name={user?.name}
                email={user?.email}
                size={32}
              />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className={cn(
                  'absolute right-0 top-[calc(100%+6px)] z-[110] w-56',
                  'rounded-lg border border-border bg-surface p-1.5',
                  'shadow-[0_12px_40px_rgba(28,25,23,0.12)]',
                  'animate-[modal-fade-in_0.12s_ease]',
                )}
              >
                <div className="border-b border-border-light px-2.5 py-2">
                  <div className="text-[12.5px] font-medium text-text-primary">
                    {user?.name ?? 'Signed in'}
                  </div>
                  {user?.email && (
                    <div className="truncate text-[11px] text-text-tertiary">
                      {user.email}
                    </div>
                  )}
                </div>
                <Link
                  to="/settings"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-md px-2.5 py-1.5 text-[12.5px] text-text-primary no-underline hover:bg-bg-warm"
                >
                  Settings
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSignOut}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left',
                    'text-[12.5px] text-danger hover:bg-danger-light',
                  )}
                >
                  <LogOut className="h-3 w-3" strokeWidth={1.6} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav drawer — a small popover anchored under the pill on
          mobile. Mirrors the desktop nav links; clicking one navigates
          and the drawer auto-closes (via the location effect above).
          Width is capped so it doesn't span the full screen. */}
      {mobileNavOpen && (
        <div className="mt-2 flex justify-center md:hidden">
          <div className="flex w-56 flex-col gap-0.5 rounded-2xl border border-border bg-surface p-1.5 shadow-soft">
            {NAV_ITEMS.map((item) => {
              const isActive = item.key === activeKey;
              return (
                <Link
                  key={item.key}
                  to={item.path}
                  className={cn(
                    'rounded-md px-3 py-2 text-[13.5px] no-underline transition-colors',
                    isActive
                      ? 'bg-accent-light font-medium text-accent'
                      : 'font-normal text-text-secondary hover:bg-bg-warm hover:text-text-primary',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
