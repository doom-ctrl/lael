import { Toaster as SonnerToaster, toast } from 'sonner';
import { CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Toaster — Lael-flavored wrapper around `sonner`.
 *
 * Re-themed to match Direction B (warm editorial):
 *  - Top-right stack (above the navbar)
 *  - Soft warm-cream surface, accent-colored 3px left border per
 *    variant (success/error/info/warning)
 *  - Rounded-xl + soft shadow
 *  - Custom icons per variant (Lucide, not emoji)
 *
 * Components call `toast.success('Saved')` directly — they don't
 * need a hook or provider. The styling flows from the
 * `toastOptions` block here.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      visibleToasts={5}
      expand
      offset={16}
      gap={8}
      closeButton
      duration={4000}
      icons={{
        success: <CheckCircle2 className="h-4 w-4 text-success" strokeWidth={1.6} />,
        error: <XCircle className="h-4 w-4 text-danger" strokeWidth={1.6} />,
        info: <Info className="h-4 w-4 text-info" strokeWidth={1.6} />,
        warning: <AlertCircle className="h-4 w-4 text-warning" strokeWidth={1.6} />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: cn(
            'group relative flex w-[360px] items-start gap-3 overflow-hidden',
            'rounded-xl border border-border bg-surface px-4 py-3',
            'shadow-[0_12px_40px_rgba(28,25,23,0.12)]',
            'data-[type=success]:border-l-[3px] data-[type=success]:border-l-success',
            'data-[type=error]:border-l-[3px] data-[type=error]:border-l-danger',
            'data-[type=info]:border-l-[3px] data-[type=info]:border-l-info',
            'data-[type=warning]:border-l-[3px] data-[type=warning]:border-l-warning',
          ),
          title: 'text-[12.5px] font-medium text-text-primary',
          description: 'text-[11.5px] text-text-secondary mt-0.5',
          closeButton:
            'absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-md bg-transparent text-text-tertiary transition-colors hover:bg-bg-warm hover:text-text-primary',
          icon: 'mt-0.5 flex-shrink-0',
        },
      }}
    />
  );
}

// Re-export the `toast` API so consumers don't need to import from
// `sonner` directly (keeps the dependency surface tight).
export { toast };
