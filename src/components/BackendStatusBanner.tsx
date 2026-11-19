import { useEffect, useState } from 'react';
import { api } from '../api/instance';
import { APP_NAME } from '../shared/constants';

const isBackendUnavailable = (error: any) => {
  return (
    !error?.response ||
    error?.code === 'ERR_NETWORK' ||
    error?.code === 'ECONNABORTED'
  );
};

export const BackendStatusBanner = () => {
  const [isBackendDown, setIsBackendDown] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const userFriendlyMessage =
    'Sorry for the inconvenience, our servers are currently down. Please try again in a moment.';

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('/api/health', {
          method: 'GET',
          cache: 'no-store',
          signal: AbortSignal.timeout(20000),
        });
        if (!response.ok) throw new Error('health failed');
        setIsBackendDown(false);
      } catch {
        setIsBackendDown(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkBackend();

    const intervalId = setInterval(checkBackend, 10000);

    const interceptorId = api.interceptors.response.use(
      (response) => {
        setIsBackendDown(false);
        return response;
      },
      (error) => {
        if (isBackendUnavailable(error)) {
          setIsBackendDown(true);
        }
        return Promise.reject(error);
      },
    );

    return () => {
      clearInterval(intervalId);
      api.interceptors.response.eject(interceptorId);
    };
  }, []);

  if (!isBackendDown || isChecking) {
    return null;
  }

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-background/90 text-foreground'>
      <div className='mx-4 w-full max-w-md rounded-lg border border-destructive/60 bg-panel p-6 text-center shadow-panel'>
        <h2 className='text-xl font-semibold text-destructive'>
          {APP_NAME} is unavailable
        </h2>
        <p className='mt-3 text-sm text-muted-foreground'>{userFriendlyMessage}</p>
      </div>
    </div>
  );
};
