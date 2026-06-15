import * as React from 'react';
import { cn } from '@/lib/utils';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * SettingsSection — card with an italic serif header bar + body.
 * Rows are expected to use the `SettingsRow` helper for consistent spacing.
 */
export function SettingsSection({
  title,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-surface shadow-soft',
        className,
      )}
    >
      <div className="flex items-baseline gap-2.5 border-b border-border-light px-4 py-3 pb-2">
        <h3 className="m-0 font-display text-[14px] font-medium italic tracking-[-0.005em] text-text-primary">
          {title}
        </h3>
      </div>
      <div className="px-4 py-2.5 pb-2.5">{children}</div>
    </div>
  );
}

interface SettingsRowProps {
  label: string;
  description?: string;
  control: React.ReactNode;
  className?: string;
}

/**
 * SettingsRow — single row of label + control, separated by a light border.
 * Use inside a `SettingsSection`.
 */
export function SettingsRow({
  label,
  description,
  control,
  className,
}: SettingsRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 border-b border-border-light py-2.5 last:border-b-0',
        className,
      )}
    >
      <div className="min-w-0">
        <div className="text-[12.5px] text-text-primary">{label}</div>
        {description && (
          <div className="mt-0.5 text-[10.5px] text-text-tertiary">
            {description}
          </div>
        )}
      </div>
      <div className="flex-shrink-0">{control}</div>
    </div>
  );
}
