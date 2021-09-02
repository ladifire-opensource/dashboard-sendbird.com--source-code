import { useState, useEffect } from 'react';

import { getDimension } from '@utils';

import { useLatestValue } from './useLatestValue';

export const useDimension = () => {
  const [dimension, setDimension] = useState(getDimension());
  const latestDimension = useLatestValue(dimension);
  useEffect(() => {
    const resizeEventListener = () => {
      const newDimension = getDimension();
      if (latestDimension.current.x !== newDimension.x || latestDimension.current.y !== newDimension.y) {
        setDimension(newDimension);
      }
    };
    window.addEventListener('resize', resizeEventListener);
    return () => {
      window.removeEventListener('resize', resizeEventListener);
    };
  }, [latestDimension]);

  return dimension;
};
