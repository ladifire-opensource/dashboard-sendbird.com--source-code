import { useSelector } from 'react-redux';

import { selectAnnouncementVersion } from '@core/selectors';

export const useAnnouncementVersion = () =>
  useSelector((state: RootState) => {
    const application = state.applicationState.data;
    return application ? selectAnnouncementVersion(application) : undefined;
  });
