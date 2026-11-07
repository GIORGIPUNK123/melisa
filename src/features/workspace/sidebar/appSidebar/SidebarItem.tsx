import React from 'react';

export const SidebarItem = (props: {
  active: boolean;
  icon: React.ReactNode;
  label?: string;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={props.onClick}
      className={`xl:hover:text-white hover:text-[#65E0C1] relative text-[#8192A4] flex flex-col xl:flex-row items-center justify-center cursor-pointer transition-all duration-100 ease-in-out py-2 px-3 rounded-xl xl:py-0 xl:px-0 xl:shadow-2xl xl:hover:scale-110 xl:w-10 xl:h-10 xl:border-solid xl:border-[#65E0C1] ${
        props.active
          ? 'xl:bg-[#65e0c1a4] xl:border-[1px]'
          : 'xl:hover:bg-[#65e0c172]'
      }`}
    >
      {props.active && (
        <div className='absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#65E0C1] xl:hidden' />
      )}

      <div className={`${props.active && 'xl:text-white text-[#65E0C1]'}`}>
        {props.icon}
      </div>

      <span
        className={`mt-1 text-xs font-medium xl:hidden ${
          props.active ? 'text-[#65E0C1]' : ''
        }`}
      >
        {props.label}
      </span>
    </div>
  );
};
