import { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
};

const base = ({ size = 20, className, ...props }: IconProps) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className,
  'aria-hidden': true as const,
  ...props,
});

export const IconBell = (props: IconProps) => (
  <svg {...base(props)}>
    <path d='M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9' />
    <path d='M10.3 21a1.94 1.94 0 0 0 3.4 0' />
  </svg>
);

export const IconSettings = (props: IconProps) => (
  <svg {...base(props)}>
    <path d='M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' />
    <circle cx='12' cy='12' r='3' />
  </svg>
);

export const IconUserPlus = (props: IconProps) => (
  <svg {...base(props)}>
    <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
    <circle cx='9' cy='7' r='4' />
    <line x1='19' x2='19' y1='8' y2='14' />
    <line x1='22' x2='16' y1='11' y2='11' />
  </svg>
);

export const IconInbox = (props: IconProps) => (
  <svg {...base(props)}>
    <polyline points='22 12 16 12 14 15 10 15 8 12 2 12' />
    <path d='M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z' />
  </svg>
);

export const IconLogOut = (props: IconProps) => (
  <svg {...base(props)}>
    <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
    <polyline points='16 17 21 12 16 7' />
    <line x1='21' x2='9' y1='12' y2='12' />
  </svg>
);

export const IconX = (props: IconProps) => (
  <svg {...base(props)}>
    <path d='M18 6 6 18' />
    <path d='m6 6 12 12' />
  </svg>
);

export const IconLock = (props: IconProps) => (
  <svg {...base(props)}>
    <rect width='18' height='11' x='3' y='11' rx='2' ry='2' />
    <path d='M7 11V7a5 5 0 0 1 10 0v4' />
  </svg>
);

export const IconMessage = (props: IconProps) => (
  <svg {...base(props)}>
    <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
  </svg>
);

export const IconUsers = (props: IconProps) => (
  <svg {...base(props)}>
    <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
    <circle cx='9' cy='7' r='4' />
    <path d='M22 21v-2a4 4 0 0 0-3-3.87' />
    <path d='M16 3.13a4 4 0 0 1 0 7.75' />
  </svg>
);

export const IconInfo = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx='12' cy='12' r='10' />
    <path d='M12 16v-4' />
    <path d='M12 8h.01' />
  </svg>
);

export const IconCheck = (props: IconProps) => (
  <svg {...base(props)}>
    <path d='M20 6 9 17l-5-5' />
  </svg>
);

export const IconEyeOff = (props: IconProps) => (
  <svg {...base(props)}>
    <path d='M9.88 9.88a3 3 0 1 0 4.24 4.24' />
    <path d='M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68' />
    <path d='M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61' />
    <line x1='2' x2='22' y1='2' y2='22' />
  </svg>
);

export const IconUser = (props: IconProps) => (
  <svg {...base(props)}>
    <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
    <circle cx='12' cy='7' r='4' />
  </svg>
);

export const IconVolume = (props: IconProps) => (
  <svg {...base(props)}>
    <path d='M11 5 6 9H2v6h4l5 4V5z' />
    <path d='M15.54 8.46a5 5 0 0 1 0 7.07' />
    <path d='M19.07 4.93a10 10 0 0 1 0 14.14' />
  </svg>
);

export const IconVolumeOff = (props: IconProps) => (
  <svg {...base(props)}>
    <path d='M11 5 6 9H2v6h4l5 4V5z' />
    <line x1='22' x2='16' y1='9' y2='15' />
    <line x1='16' x2='22' y1='9' y2='15' />
  </svg>
);
