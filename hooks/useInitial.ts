import { useState, useEffect } from 'react';

/* hook to keep initial truthy value */
export const useInitial = <T extends any>(value: T) => {
  const [initial, setInitial] = useState(value);

  useEffect(() => {
    if (!initial && value) {
      setInitial(value);
    }
  }, [value, initial]);

  return initial;
};
