import type { ComponentType, ReactNode } from 'react';
import type { IconProps } from '../../../atoms/Icon';

export const SettingsSection = (props: {
  title: string;
  description?: string;
  icon?: ComponentType<IconProps>;
  footer?: ReactNode;
  children: ReactNode;
}) => {
  const Icon = props.icon;

  return (
    <section className='overflow-hidden rounded-card border border-solid border-border-strong bg-panel shadow-lg shadow-background/10'>
      <div className='flex items-start gap-3 px-4 py-4 sm:px-5'>
        {Icon && (
          <div className='mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-solid border-primary/15 bg-primary-soft text-primary'>
            <Icon size={17} />
          </div>
        )}
        <div className='min-w-0'>
          <h3 className='text-[15px] font-semibold tracking-tight text-foreground'>
            {props.title}
          </h3>
          {props.description && (
            <p className='mt-0.5 text-[12px] leading-5 text-muted'>
              {props.description}
            </p>
          )}
        </div>
      </div>

      <div className='flex flex-col gap-4 border-t border-solid border-border px-4 py-4 sm:px-5 sm:py-5'>
        {props.children}
      </div>

      {props.footer && (
        <div className='border-t border-solid border-border bg-sidebar/30 px-4 py-3 sm:px-5'>
          {props.footer}
        </div>
      )}
    </section>
  );
};
