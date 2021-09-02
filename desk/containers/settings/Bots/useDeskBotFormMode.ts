import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { DeskBotFormMode } from './botDetailContext';

const getMode = (pathname: string) => {
  const modeParam = pathname.split('/').reverse()[0];
  if (modeParam === 'edit') {
    return DeskBotFormMode.EDIT;
  }
  if (modeParam === 'create') {
    return DeskBotFormMode.CREATE;
  }
  return DeskBotFormMode.DUPLICATE;
};

export const useDeskBotFormMode = () => {
  const location = useLocation();
  const [mode, setMode] = useState<DeskBotFormMode>(getMode(location.pathname));

  useEffect(() => {
    if (location.pathname) {
      setMode(getMode(location.pathname));
    }
  }, [location.pathname]);

  return useMemo(
    () => ({
      mode,
      setMode,
    }),
    [mode],
  );
};
