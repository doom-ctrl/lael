import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Command — wrapper around `cmdk` styled to match the rest of Lael.
 *
 * Unlike the shadcn default, this is `unstyled: true` at the cmdk
 * level — we own the visuals via Tailwind classes. The contract
 * matches `cmdk`'s: pass children of `Command.Input`,
 * `Command.List` containing `Command.Group` + `Command.Item`, etc.
 *
 * The visual sits inside a Dialog (see `CommandDialog`) so we get
 * backdrop + portal + focus trap for free.
 */
function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded-md',
        className,
      )}
      {...props}
    />
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-12 items-center gap-2.5 border-b border-border-light px-4"
    >
      <Search className="h-3.5 w-3.5 flex-shrink-0 text-text-tertiary" strokeWidth={1.6} />
      <CommandPrimitive.Input
        data-slot="command-input"
        autoFocus
        className={cn(
          'h-12 w-full border-none bg-transparent text-[13.5px] text-text-primary outline-none',
          'placeholder:text-text-tertiary',
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        'max-h-[420px] flex-1 overflow-x-hidden overflow-y-auto px-2 py-2',
        className,
      )}
      {...props}
    />
  );
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-8 text-center"
      {...props}
    >
      <p className="font-display text-[13.5px] italic text-text-tertiary">
        No results.
      </p>
    </CommandPrimitive.Empty>
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        'overflow-hidden py-1 text-foreground',
        '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1.5',
        '[&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[10px]',
        '[&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase',
        '[&_[cmdk-group-heading]]:tracking-[0.1em] [&_[cmdk-group-heading]]:text-text-tertiary',
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn('mx-2 my-1 h-px bg-border-light', className)}
      {...props}
    />
  );
}

interface CommandItemProps extends React.ComponentProps<typeof CommandPrimitive.Item> {
  /** Optional Lucide-style icon to render on the left. */
  icon?: React.ReactNode;
}

function CommandItem({ className, icon, children, ...props }: CommandItemProps) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        'relative flex cursor-default select-none items-center gap-2.5',
        'rounded-md px-2.5 py-2 text-[12.5px] text-text-primary outline-none',
        'data-[selected=true]:bg-accent-light data-[selected=true]:text-accent',
        'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
        className,
      )}
      {...props}
    >
      {icon && <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
    </CommandPrimitive.Item>
  );
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="command-shortcut"
      className={cn(
        'ml-auto rounded border border-border-light bg-bg-warm px-1.5 py-0.5',
        'text-[10px] font-medium text-text-tertiary',
        'font-mono tracking-wider',
        className,
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
