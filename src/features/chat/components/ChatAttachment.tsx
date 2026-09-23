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
  const path = props.payload.path;

  useEffect(() => {
    if (props.payload.kind !== 'image') return;

    let active = true;
    let objectUrl = '';
    setFailed(false);
    setUrl(null);

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
    <img
      src={url}
      alt={props.payload.name || 'Image'}
      className='max-h-72 max-w-full rounded-lg object-contain'
    />
  );
};
