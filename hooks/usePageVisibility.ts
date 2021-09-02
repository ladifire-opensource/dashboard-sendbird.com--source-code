import { useState, useEffect } from 'react';

/**
 * When polling, we can observe visibilityState of document and stop polling when it's hidden to avoid unnecessary requests.
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState
 */
const usePageVisibility = () => {
  const [isPageVisible, setIsPageVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isPageVisible;
};

export default usePageVisibility;
