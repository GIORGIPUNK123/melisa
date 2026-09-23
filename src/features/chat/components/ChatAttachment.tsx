import { useEffect, useState } from 'react';
import { ConfirmModal } from '../../../components/modals/ConfirmModal';
import { ChatFilePayload } from '../utils/chatFiles';

export const ChatAttachment = (props: {
  payload: ChatFilePayload;
  openFile: (payload: ChatFilePayload) => Promise<Blob>;
}) => {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [confirmDownload, setConfirmDownload] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const path = props.payload.path;

  useEffect(() => {
    if (props.payload.kind !== 'image') return;

    let active = true;
    let objectUrl = '';
    setFailed(false);
    setUrl(null);
    setLightboxOpen(false);

    props
      .openFile(props.payload)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path, props.payload.kind]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen]);

  const saveFile = async () => {
    try {
      const blob = await props.openFile(props.payload);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = props.payload.name || 'file';
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setFailed(true);
    }
  };

  if (props.payload.kind !== 'image') {
    return (
      <>
        <button
          type='button'
          onClick={(event) => {
            event.stopPropagation();
            setConfirmDownload(true);
          }}
          onDoubleClick={(event) => event.stopPropagation()}
          className='block max-w-full truncate text-left text-sm underline'
        >
          {failed ? 'Could not open file' : props.payload.name || 'File'}
        </button>
        <ConfirmModal
          isOpen={confirmDownload}
          title='Download file'
          message={`Download ${props.payload.name || 'this file'}?`}
          confirmText='Download'
          onCancel={() => setConfirmDownload(false)}
          onConfirm={() => {
            setConfirmDownload(false);
            void saveFile();
          }}
        />
      </>
    );
  }

  if (failed) {
    return <p className='text-sm opacity-80'>Could not open image</p>;
  }

  if (!url) {
    return <p className='text-sm opacity-70'>Opening image...</p>;
  }

  return (
    <>
      <button
        type='button'
        onClick={(event) => {
          event.stopPropagation();
          setLightboxOpen(true);
        }}
        onDoubleClick={(event) => event.stopPropagation()}
        className='block w-full max-w-full cursor-pointer p-0'
      >
        <img
          src={url}
          alt={props.payload.name || 'Image'}
          className='h-auto max-h-72 w-full rounded-lg object-contain'
        />
      </button>

      {lightboxOpen && (
        <div
          className='absolute inset-0 z-[80] flex items-center justify-center bg-black/90 p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]'
          onClick={(event) => {
            event.stopPropagation();
            setLightboxOpen(false);
          }}
          onDoubleClick={(event) => event.stopPropagation()}
          role='dialog'
          aria-modal='true'
          aria-label={props.payload.name || 'Image'}
        >
          <button
            type='button'
            className='absolute right-4 top-[max(1rem,env(safe-area-inset-top))] rounded-lg px-3 py-1.5 text-sm text-white/90 hover:bg-white/10'
            onClick={(event) => {
              event.stopPropagation();
              setLightboxOpen(false);
            }}
          >
            Close
          </button>
          <img
            src={url}
            alt={props.payload.name || 'Image'}
            className='max-h-[90dvh] max-w-full object-contain'
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};
