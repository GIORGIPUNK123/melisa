import React from 'react';

export const SidebarItem = (props: {
  active: boolean;
  icon: React.ReactNode;
  label?: string;
  badge?: number;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={props.onClick}
      className={`xl:hover:text-foreground hover:text-primary relative text-muted flex flex-col xl:flex-row items-center justify-center cursor-pointer transition-all duration-100 ease-in-out py-2 px-3 rounded-xl xl:py-0 xl:px-0 xl:shadow-panel xl:hover:scale-110 xl:w-10 xl:h-10 xl:border-solid xl:border-primary ${
        props.active
          ? 'xl:bg-primary-strong xl:border-[1px]'
          : 'xl:hover:bg-primary-strong'
      }`}
    >
      {props.active && (
        <div className='absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-primary xl:hidden' />
      )}

      <div className={`${props.active && 'xl:text-foreground text-primary'}`}>
        {props.icon}
      </div>

      {!!props.badge && props.badge > 0 && (
        <span className='absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-background xl:right-0 xl:top-0'>
          {props.badge > 9 ? '9+' : props.badge}
        </span>
      )}

      <span
        className={`mt-1 text-xs font-medium xl:hidden ${
          props.active ? 'text-primary' : ''
        }`}
      >
        {props.label}
      </span>
    </div>
  );
};
