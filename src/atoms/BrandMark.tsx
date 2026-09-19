import { APP_NAME } from '../shared/constants';

type Props = {
  align?: 'center' | 'left';
  size?: 'xs' | 'sm' | 'lg';
  subtitle?: string;
  showMark?: boolean;
};

const markSize = {
  xs: 'h-7 w-7 text-[13px] rounded-lg',
  sm: 'h-9 w-9 text-[15px] rounded-xl',
  lg: 'h-11 w-11 text-lg rounded-xl',
};

const titleSize = {
  xs: 'text-[17px] font-semibold tracking-tight',
  sm: 'text-[22px] font-semibold tracking-tight',
  lg: 'text-[28px] font-semibold tracking-tight',
};

export const BrandMark = ({
  align = 'center',
  size = 'lg',
  subtitle,
  showMark = true,
}: Props) => {
  const stacked = align === 'center';

  return (
    <div
      className={
        stacked
          ? 'flex flex-col items-center text-center'
          : 'flex min-w-0 items-center gap-2.5'
      }
    >
      {showMark ? (
        <div
          className={`flex items-center justify-center bg-indigo-600 font-bold text-white shadow-sm shadow-indigo-950/40 ${markSize[size]} ${
            stacked ? 'mb-3' : ''
          }`}
        >
          M
        </div>
      ) : null}
      <div className={stacked ? '' : 'min-w-0'}>
        <p className={`${titleSize[size]} text-slate-100`}>{APP_NAME}</p>
        {subtitle ? (
          <p
            className={`text-slate-400 ${
              size === 'xs' ? 'text-[12px]' : 'mt-1 text-[13px]'
            }`}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
};
