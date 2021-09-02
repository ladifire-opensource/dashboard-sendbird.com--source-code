import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';

import { usePhoneboothUser } from '@calls/containers/Studio/dialogs/usePhoneboothUser';
import { useTypedSelector } from '@hooks';

import { loadUserIdsFromLocalStorage } from '../../Studio/dialogs/localStorageUtils';
import { OnboardingLocalStorageUtils } from './OnboardingLocalStorageUtils';
import { OnboardingType } from './types';

const RELEASE_TIMESTAMP = new Date('2020-12-02').getTime();

const useApplication = () => {
  const application = useTypedSelector((state) => state.applicationState.data);
  if (!application) throw new Error('Application should be stored to use OnboardingProvider');

  return application;
};

export const useOnboardingProvider = () => {
  const { app_id: appId, created_at: createdAt } = useApplication();
  const { loadUser } = usePhoneboothUser();
  const history = useHistory();

  useEffect(() => {
    // refresh SDKUser when user enters Studio
    loadUser();
  }, [loadUser]);

  const shouldCheckContacts = createdAt < RELEASE_TIMESTAMP;
  const hasContactsRef = useRef(loadUserIdsFromLocalStorage(appId).length > 0);
  const hasContacts = hasContactsRef.current;

  const initialIsFinished = useRef(OnboardingLocalStorageUtils.isFinished(appId));
  const [finished, setFinished] = useState(initialIsFinished.current);

  const finishOnboarding = (type: OnboardingType) => {
    OnboardingLocalStorageUtils.appendFinished(appId);
    setFinished(true);
    if (type) {
      history.push(`/${appId}/calls/studio/${type}`);
    }
  };

  const shouldShowOnboarding = !(finished || (shouldCheckContacts && hasContacts));

  return {
    finishOnboarding,
    shouldShowOnboarding,
    isUpdated: initialIsFinished.current !== finished,
  };
};

type ContextValue = ReturnType<typeof useOnboardingProvider>;

export const OnboardingContext = createContext<ContextValue | undefined>(undefined);

export const useOnboardingContext = () => {
  const contextValue = useContext(OnboardingContext);

  if (!contextValue) {
    throw new Error('The component using OnboardingContext must be a descendant of OnboardingContext.Provider');
  }

  return contextValue;
};
