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
    <section className='overflow-hidden rounded-2xl border border-solid border-[#1B2A3A] bg-[#0E1621] shadow-lg shadow-black/10'>
      <div className='flex items-start gap-3 px-4 py-4 sm:px-5'>
        {Icon && (
          <div className='mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-solid border-[#65E0C1]/15 bg-[#65E0C1]/10 text-[#65E0C1]'>
            <Icon size={17} />
          </div>
        )}
        <div className='min-w-0'>
          <h3 className='text-[15px] font-semibold tracking-tight text-[#F4F8FB]'>
            {props.title}
          </h3>
          {props.description && (
            <p className='mt-0.5 text-[12px] leading-5 text-[#8192A4]'>
              {props.description}
            </p>
          )}
        </div>
      </div>

      <div className='flex flex-col gap-4 border-t border-solid border-[#162231] px-4 py-4 sm:px-5 sm:py-5'>
        {props.children}
      </div>

      {props.footer && (
        <div className='border-t border-solid border-[#162231] bg-[#0A1018]/30 px-4 py-3 sm:px-5'>
          {props.footer}
        </div>
      )}
    </section>
  );
};
