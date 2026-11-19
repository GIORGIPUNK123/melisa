import type { ComponentType } from 'react';
import {
  IconBell,
  IconLock,
  IconMoon,
  IconUser,
  type IconProps,
} from '../../../atoms/Icon';
import type { SettingsTabT } from '../types';

type SettingsTab = {
  id: SettingsTabT;
  label: string;
  shortLabel?: string;
  icon: ComponentType<IconProps>;
};

type SettingsTabGroup = {
  title: string;
  tabs: SettingsTab[];
};

const TAB_GROUPS: SettingsTabGroup[] = [
  {
    title: 'ACCOUNT',
    tabs: [
      { id: 'profile', label: 'Profile', icon: IconUser },
      {
        id: 'account',
        label: 'Account & Security',
        shortLabel: 'Account',
        icon: IconLock,
      },
      {
        id: 'notifications',
        label: 'Notifications',
        shortLabel: 'Alerts',
        icon: IconBell,
      },
    ],
  },
  {
    title: 'PREFERENCES',
    tabs: [
      {
        id: 'appearance',
        label: 'Appearance',
        shortLabel: 'Theme',
        icon: IconMoon,
      },
    ],
  },
];

const ALL_TABS = TAB_GROUPS.flatMap((group) => group.tabs);

const SettingsSidebarTab = (props: {
  tab: SettingsTab;
  isActive: boolean;
  onClick: (tab: SettingsTabT) => void;
}) => {
  const { tab, isActive, onClick } = props;
  const Icon = tab.icon;

  return (
    <button
      type='button'
      aria-current={isActive ? 'page' : undefined}
      aria-label={tab.label}
      className={`flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-2.5 text-[12px] font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 lg:h-10 lg:w-full lg:flex-none lg:justify-start lg:gap-2 lg:rounded-l-none lg:rounded-r-lg lg:border-l-2 lg:px-3 ${
        isActive
          ? 'bg-[#65E0C1] text-[#07110F] lg:border-[#65E0C1] lg:bg-[#65E0C1]/10 lg:text-[#65E0C1]'
          : 'bg-[#101B26] text-[#8192A4] hover:bg-[#162231] hover:text-[#C7D3DF] lg:border-transparent lg:bg-transparent lg:hover:bg-[#162231]/60 lg:hover:text-[#EEF3F8]'
      }`}
      onClick={() => onClick(tab.id)}
    >
      <Icon size={15} className='hidden shrink-0 lg:block' />
      <span className='truncate lg:hidden'>{tab.shortLabel ?? tab.label}</span>
      <span className='hidden truncate lg:inline'>{tab.label}</span>
    </button>
  );
};

export const SettingsSidebar = (props: {
  activeTab: SettingsTabT;
  onChange: (tab: SettingsTabT) => void;
}) => {
  return (
    <nav
      aria-label='Settings sections'
      className='sticky top-0 z-20 w-full shrink-0 border-b border-solid border-[#162231] bg-[#080D14]/95 py-3 backdrop-blur-md lg:top-24 lg:w-[220px] lg:self-start lg:border-0 lg:bg-transparent lg:py-0 lg:backdrop-blur-none'
    >
      {/* Mobile: Single horizontal row of pills */}
      <div className='flex w-full flex-row items-center gap-1.5 lg:hidden'>
        {ALL_TABS.map((tab) => (
          <SettingsSidebarTab
            key={tab.id}
            tab={tab}
            isActive={props.activeTab === tab.id}
            onClick={props.onChange}
          />
        ))}
      </div>

      {/* Desktop: Grouped vertical navigation (unchanged) */}
      <div className='hidden lg:block'>
        {TAB_GROUPS.map((group, index) => (
          <div key={group.title} className={index > 0 ? 'mt-7' : ''}>
            <h3 className='px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#56687B]'>
              {group.title}
            </h3>
            <div className='flex flex-col gap-1 mt-2'>
              {group.tabs.map((tab) => (
                <SettingsSidebarTab
                  key={tab.id}
                  tab={tab}
                  isActive={props.activeTab === tab.id}
                  onClick={props.onChange}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
};
