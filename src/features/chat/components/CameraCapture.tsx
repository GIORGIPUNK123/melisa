import { useEffect, useRef, useState } from 'react';

type FacingMode = 'user' | 'environment';

export const CameraCapture = (props: {
  onCapture: (file: File) => void;
  onClose: () => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<FacingMode>('environment');
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      setReady(false);
      setError(null);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: facing } },
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setReady(true);
      } catch {
        if (!cancelled) {
          setError('Could not open the camera. Allow camera access and try again.');
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [facing]);

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        props.onCapture(
          new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' }),
        );
      },
      'image/jpeg',
      0.85,
    );
  };

  return (
    <div className='fixed inset-0 z-[80] flex flex-col bg-black'>
      <div className='flex items-center px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]'>
        <button
          type='button'
          onClick={props.onClose}
          className='rounded-full bg-white/15 px-5 py-2.5 text-base font-medium text-white backdrop-blur-sm transition hover:bg-white/25 active:bg-white/30'
        >
          Cancel
        </button>
      </div>

      <div className='relative min-h-0 flex-1'>
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`h-full w-full object-cover ${facing === 'user' ? '-scale-x-100' : ''}`}
        />
        {error && (
          <p className='absolute inset-x-6 top-6 text-center text-sm text-white'>
            {error}
          </p>
        )}
      </div>

      <div className='grid grid-cols-3 items-center px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4'>
        <div />
        <div className='flex justify-center'>
          <button
            type='button'
            onClick={capture}
            disabled={!ready}
            aria-label='Take photo'
            className='h-16 w-16 rounded-full border-4 border-white bg-white/20 disabled:opacity-40'
          />
        </div>
        <div className='flex justify-end'>
          <button
            type='button'
            onClick={() =>
              setFacing((current) =>
                current === 'environment' ? 'user' : 'environment',
              )
            }
            className='rounded-full px-3 py-2 text-sm text-white'
          >
            Flip
          </button>
        </div>
      </div>
    </div>
  );
};
