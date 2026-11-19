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
        className='h-11 w-full rounded-xl border border-solid border-border-strong px-4 text-[13px] font-semibold text-muted-foreground transition-colors cursor-pointer hover:border-border-strong hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto'
      >
        Cancel
      </button>
      <button
        type='submit'
        disabled={props.disabled || isSubmitting}
        className='h-11 w-full rounded-xl bg-primary px-5 text-[13px] font-bold text-background transition-colors cursor-pointer hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-panel disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto'
      >
        {isSubmitting ? 'Saving...' : (props.submitLabel ?? 'Save changes')}
      </button>
    </div>
  );
};
