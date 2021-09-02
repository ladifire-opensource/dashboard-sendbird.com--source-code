import { useState } from 'react';

import { NoCallsWidget } from '@calls/components/NoCallsWidget';

import DirectCalls from './DirectCalls';
import GroupCalls from './GroupCalls';
import Start from './Start';
import { OnboardingType } from './types';

const NewOnboarding = () => {
  const [type, setType] = useState<OnboardingType>();

  const reset = () => setType(undefined);

  const renderPage = () => {
    if (type === 'direct') return <DirectCalls onCancel={reset} />;
    if (type === 'group') return <GroupCalls onCancel={reset} />;
    return <Start setOnboardingType={setType} />;
  };

  return (
    <>
      {renderPage()}
      <NoCallsWidget />
    </>
  );
};

export default NewOnboarding;
