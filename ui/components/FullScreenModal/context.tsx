import { createContext, FC, useMemo, useState } from 'react';

export const FullScreenModalContext = createContext<{
  activeModalID: string | null;
  openModal: (id: string) => void;
  closeModal: (id?: string) => void;
}>({
  activeModalID: null,
  openModal: () => {},
  closeModal: () => {},
});

export const FullScreenModalContextProvider: FC = ({ children }) => {
  const [activeModalID, setActiveModalID] = useState<string | null>(null);

  return (
    <FullScreenModalContext.Provider
      value={useMemo(() => {
        const closeModal = (id?: string) => {
          if (!id || id === activeModalID) {
            setActiveModalID(null);
          }
        };

        return {
          activeModalID,
          openModal: setActiveModalID,
          closeModal,
        };
      }, [activeModalID])}
    >
      {children}
    </FullScreenModalContext.Provider>
  );
};
