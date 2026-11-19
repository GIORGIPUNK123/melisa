import { handleBackdropClick } from '../../shared/utils/modal';
import { ui } from '../../shared/ui';

export const ConfirmModal = (props: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) => {
  if (!props.isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-[70] flex items-center justify-center bg-background/60 backdrop-blur-sm p-4'
      onClick={(event) => handleBackdropClick(event, props.onCancel)}
    >
      <div className='w-full max-w-md overflow-hidden border shadow-panel rounded-card border-border/50 bg-panel'>
        <div className='px-6 py-4 border-b border-border'>
          <h2 className={ui.title}>{props.title}</h2>
        </div>

        <div className='p-6'>
          <p className='text-muted-foreground'>{props.message}</p>
        </div>

        <div className='flex gap-3 px-6 py-4 border-t border-border bg-surface/50'>
          <button
            onClick={props.onCancel}
            className={`${ui.btnSecondary} flex-1`}
          >
            {props.cancelText || 'Cancel'}
          </button>
          <button
            onClick={props.onConfirm}
            className={`${ui.btnPrimary} flex-1 ${
              props.danger ? 'bg-destructive hover:bg-destructive/90' : ''
            }`}
          >
            {props.confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};
