import type { ReactNode } from 'react';
import { IconCheck, IconInfo } from '../../../atoms/Icon';

export const SettingsMessage = (props: {
  tone: 'error' | 'success';
  children: ReactNode;
}) => {
  const isError = props.tone === 'error';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[12px] leading-5 ${
        isError
          ? 'border-destructive/25 bg-destructive/10 text-destructive/90'
          : 'border-success/25 bg-success/10 text-success'
      }`}
    >
      <span className='mt-px shrink-0'>
        {isError ? <IconInfo size={15} /> : <IconCheck size={15} />}
      </span>
      <div className='min-w-0 text-left'>{props.children}</div>
    </div>
  );
};
