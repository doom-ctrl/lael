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
    <nav
      className={cn(
        'sticky top-0 z-[100] transition-all duration-300 ease-out',
        // Translucent warm background that follows the theme. We use
        // a CSS variable so the alpha-blend adapts in dark mode
        // (defined in index.css as --color-navbar-bg); the value is
        // opaque enough to obscure the page content underneath while
        // still showing the cream/warm tint through `backdrop-blur`.
        'bg-[var(--color-navbar-bg)] backdrop-blur-[16px]',
        scrolled
          ? 'border-b border-border shadow-soft'
          : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1500px] items-center px-4 sm:px-6 md:px-9">
        {/* Logo */}
        <Link
          to="/"
          className="flex flex-shrink-0 items-center gap-2.5 text-text-primary no-underline"
        >
          <img src="/logo.svg" alt="" aria-hidden="true" className="h-8 w-8" />
          <span className="font-display text-xl font-normal italic tracking-[-0.02em] text-text-primary">
            Lael
          </span>
        </Link>

        {/* Nav links — hidden on mobile, shown in the hamburger drawer instead */}
        <div className="ml-10 hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = item.key === activeKey;
            return (
              <Link
                key={item.key}
                to={item.path}
                className={cn(
                  'rounded-lg px-4 py-[7px] text-[13.5px] no-underline transition-all duration-150',
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

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={palette.open}
            title="Search (⌘K)"
            aria-label="Search"
            className={cn(
              'flex h-9 items-center gap-2 rounded-lg border border-border bg-surface',
              'pl-[10px] pr-2.5 text-text-secondary transition-colors',
              'hover:bg-bg-warm',
              // On mobile, collapse to an icon-only square.
              'w-9 justify-center p-0 sm:w-auto sm:min-w-[160px] sm:justify-start sm:pl-[10px] sm:pr-2.5',
            )}
          >
            <Search className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.4} />
            <span className="hidden flex-1 text-left text-[12px] text-text-tertiary sm:block">
              Search…
            </span>
            <kbd
              className={cn(
                'hidden rounded border border-border-light bg-bg-warm px-1.5 py-0.5',
                'text-[10px] font-medium font-mono tracking-wider text-text-tertiary sm:inline-block',
              )}
            >
              ⌘K
            </kbd>
          </button>

          <Button
            onClick={handleAddClick}
            // Mobile: icon-only square. Desktop: full label.
            className="h-9 w-9 p-0 sm:w-auto sm:px-[18px]"
            aria-label="Add Assessment"
          >
            <Plus className="h-3 w-3" strokeWidth={1.8} />
            <span className="hidden sm:inline">Add Assessment</span>
          </Button>

          {/* Mobile menu toggle — only shown below `md`. */}
          <button
            type="button"
            onClick={() => setMobileNavOpen((o) => !o)}
            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileNavOpen}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface',
              'text-text-secondary transition-colors hover:bg-bg-warm md:hidden',
            )}
          >
            {mobileNavOpen ? (
              <X className="h-3.5 w-3.5" strokeWidth={1.6} />
            ) : (
              <Menu className="h-3.5 w-3.5" strokeWidth={1.6} />
            )}
          </button>

          {/* Avatar + sign-out menu */}
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
                size={36}
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

      {/* Mobile nav drawer — slides down below the navbar. Items
          mirror the desktop nav links; clicking one navigates and
          the drawer auto-closes (via the location effect above). */}
      {mobileNavOpen && (
        <div className="border-t border-border-light bg-surface md:hidden">
          <div className="mx-auto flex max-w-[1500px] flex-col gap-0.5 px-2 py-2">
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
