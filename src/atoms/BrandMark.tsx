import { APP_NAME } from '../shared/constants';

type Props = {
  align?: 'center' | 'left';
  size?: 'xs' | 'sm' | 'lg';
  subtitle?: string;
};

const titleSize = {
  xs: 'text-lg font-bold',
  sm: 'text-2xl font-bold',
  lg: 'text-4xl font-bold',
};

export const BrandMark = ({
  align = 'center',
  size = 'lg',
  subtitle,
}: Props) => {
  const titleClass = titleSize[size];
  const wrapper =
    align === 'center'
      ? 'flex flex-col items-center text-center'
      : 'flex flex-col';

  return (
    <div className={wrapper}>
      <h1
        className={`${titleClass} text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text`}
      >
        {APP_NAME}
      </h1>
      {subtitle ? (
        <p className='mt-1 text-sm text-slate-400'>{subtitle}</p>
      ) : null}
    </div>
  );
};
