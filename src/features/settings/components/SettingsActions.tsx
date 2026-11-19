export const SettingsActions = (props: {
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  disabled?: boolean;
}) => {
  const isSubmitting = props.isSubmitting ?? false;

  return (
    <div className='flex flex-col gap-2 sm:flex-row sm:justify-end'>
      <button
        type='button'
        onClick={props.onCancel}
        disabled={isSubmitting}
        className='h-11 w-full rounded-xl border border-solid border-[#243648] px-4 text-[13px] font-semibold text-[#A7B6C6] transition-colors cursor-pointer hover:border-[#2A3E52] hover:bg-[#162231] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65E0C1]/30 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto'
      >
        Cancel
      </button>
      <button
        type='submit'
        disabled={props.disabled || isSubmitting}
        className='h-11 w-full rounded-xl bg-[#65E0C1] px-5 text-[13px] font-bold text-[#07110F] transition-colors cursor-pointer hover:bg-[#7BE9CE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65E0C1]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E1621] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto'
      >
        {isSubmitting ? 'Saving...' : (props.submitLabel ?? 'Save changes')}
      </button>
    </div>
  );
};
