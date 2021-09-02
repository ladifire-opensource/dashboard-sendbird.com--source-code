import { createContext, useState, FC } from 'react';

export type RelatedChatContextState = {
  current: RelatedChannel | null;
  isOpen: boolean;
  open: (relatedChannel: RelatedChannel) => void;
  close: () => void;
};

export const RelatedChatContext = createContext<RelatedChatContextState>({
  current: null,
  isOpen: false,
  open: () => {},
  close: () => {},
});

export const RelatedChatContextProvider: FC = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [current, setCurrent] = useState<RelatedChannel | null>(null);

  const handleOpen = (relatedChannel: RelatedChannel) => {
    setCurrent(relatedChannel);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <RelatedChatContext.Provider value={{ current, isOpen, open: handleOpen, close: handleClose }}>
      {children}
    </RelatedChatContext.Provider>
  );
};
