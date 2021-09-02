import { createContext } from 'react';

interface CollapsibleGroupContextValue {
  isUnsaved: boolean;
  setIsUnsaved: (value: boolean) => void;
}

export const CollapsibleGroupContext = createContext<CollapsibleGroupContextValue>({
  isUnsaved: false,
  setIsUnsaved: () => {},
});
