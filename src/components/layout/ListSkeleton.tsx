const nameWidths = ['58%', '72%', '46%', '64%', '52%', '68%'];

export const ListSkeleton = (props: {
  rows?: number;
  withAction?: boolean;
  withHeader?: boolean;
}) => {
  const rows = Math.min(Math.max(props.rows ?? 6, 4), 8);

  return (
    <div aria-hidden>
      {props.withAction && (
        <div className='px-2 pt-2'>
          <div className='skeleton h-11 w-full rounded-xl' />
        </div>
      )}
      {props.withHeader && (
        <div className='border-b border-slate-800 px-4 py-3'>
          <div className='skeleton h-3 w-24 rounded-full' />
        </div>
      )}
      <div className='space-y-1 p-2'>
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            className='flex items-center gap-3 rounded-xl px-2.5 py-2.5'
          >
            <div className='skeleton h-10 w-10 shrink-0 rounded-full' />
            <div className='min-w-0 flex-1 space-y-2'>
              <div
                className='skeleton h-3.5 rounded-full'
                style={{ width: nameWidths[index % nameWidths.length] }}
              />
              <div
                className='skeleton h-2.5 rounded-full'
                style={{ width: `${36 + ((index * 13) % 24)}%` }}
              />
            </div>
            <div className='skeleton h-2.5 w-8 shrink-0 rounded-full' />
          </div>
        ))}
      </div>
    </div>
  );
};
