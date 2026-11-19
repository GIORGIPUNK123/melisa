export const ToggleRow = (props: {
  title: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) => {
  return (
    <div className='flex items-center justify-between gap-4 rounded-xl border border-solid border-[#1B2A3A] bg-[#0A1018]/50 p-3.5'>
      <div className='min-w-0'>
        <div className='text-[13px] font-semibold text-[#EEF3F8]'>
          {props.title}
        </div>
        {props.description && (
          <p className='mt-1 text-[11px] leading-5 text-[#8192A4]'>
            {props.description}
          </p>
        )}
      </div>
      <button
        type='button'
        role='switch'
        aria-checked={props.checked}
        aria-label={props.title}
        disabled={props.disabled}
        onClick={() => props.onChange(!props.checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer after:absolute after:-inset-2 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65E0C1]/30 disabled:cursor-not-allowed disabled:opacity-50 ${
          props.checked ? 'bg-[#65E0C1]' : 'bg-[#243648]'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            props.checked ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
};
