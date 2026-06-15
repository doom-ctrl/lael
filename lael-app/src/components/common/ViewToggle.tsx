import * as React from 'react';
import { LayoutGrid, List, Columns3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ViewMode } from '@/lib/design-tokens';

/**
 * View mode for the Assessments page. The type is defined in
 * `lib/design-tokens.ts` (single source of truth, also referenced by
 * the `UserPreferences` table); we re-export it here so existing
 * imports of `ViewToggle.ViewMode` keep working.
 */
export type { ViewMode };

interface ViewToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
  className?: string;
}

interface ViewOption {
  key: ViewMode;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const VIEW_OPTIONS: ViewOption[] = [
  { key: 'list', label: 'List', icon: List },
  { key: 'grid', label: 'Grid', icon: LayoutGrid },
  { key: 'kanban', label: 'Kanban', icon: Columns3 },
];

/**
 * ViewToggle — pill-shaped segmented control for switching between
 * list/grid/kanban views.
 */
export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-0.5 rounded-lg border border-border bg-surface p-[3px]',
        className,
      )}
    >
      {VIEW_OPTIONS.map(({ key, label, icon: Icon }) => {
        const isActive = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-[5px] text-[12px] font-medium',
              'border-none transition-all duration-150',
              isActive
                ? 'bg-accent-light text-accent'
                : 'bg-transparent text-text-secondary hover:text-text-primary',
            )}
          >
            <Icon className="h-3 w-3" strokeWidth={1.6} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
