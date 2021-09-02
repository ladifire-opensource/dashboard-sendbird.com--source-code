import { FC, useState } from 'react';
import { useIntl } from 'react-intl';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { useShowDialog } from '@hooks';

import { useOnboardingContext } from './OnboardingContext';
import Prompt from './Prompt';
import { Header, Layout } from './components';
import Progress from './components/Progress';
import { DirectCallsContent } from './contents';

const useFinishConfirm = () => {
  const intl = useIntl();
  const showDialog = useShowDialog();

  return () => {
    showDialog({
      dialogTypes: DialogType.Custom,
      dialogProps: {
        size: 'small',
        title: intl.formatMessage({ id: 'calls.studio.onboarding.successConfirm.title' }),
        description: intl.formatMessage({
          id: 'calls.studio.onboarding.successConfirm.description',
        }),
        isNegativeButtonHidden: true,
        positiveButtonProps: {
          text: intl.formatMessage({ id: 'calls.studio.onboarding.successConfirm.submit' }),
        },
      },
    });
  };
};

const pages = [
  { component: DirectCallsContent.Install, title: 'calls.studio.onboarding.header.progress.install' },
  { component: DirectCallsContent.Phonebooth, title: 'calls.studio.onboarding.header.progress.phonebooth' },
  { component: DirectCallsContent.Contacts, title: 'calls.studio.onboarding.header.progress.contacts' },
  { component: DirectCallsContent.Signin, title: 'calls.studio.onboarding.header.progress.signin' },
];

/**
 * FIXME: When NewOnboarding.tsx replaces this file(index.tsx), this file should be renamed to DirectCalls.tsx.
 */
const DirectCalls: FC<{ onCancel?: () => void }> = ({ onCancel }) => {
  const [step, setStep] = useState(0);
  const [finishEnabled, setFinishEnabled] = useState(false);
  const { finishOnboarding } = useOnboardingContext();
  const showFinishConfirm = useFinishConfirm();

  const increaseStep = () => setStep((step) => step + 1);
  const decreaseStep = () => setStep((step) => step - 1);

  const handleNextClick = () => {
    if (finishEnabled) {
      finishOnboarding('direct');
      showFinishConfirm();
      return;
    }
    if (step === pages.length - 1) {
      setFinishEnabled(true);
      return;
    }
    if (step < pages.length - 1) {
      increaseStep();
      return;
    }
  };

  const handleBackClick = () => {
    if (step === 0) {
      return onCancel?.();
    }

    setFinishEnabled(false);
    decreaseStep();
  };

  const titles = pages.map((page) => page.title);
  const activeStep = { current: step + 1, total: pages.length };
  const ActivePage = pages[step].component;

  return (
    <Layout>
      <Header>
        <Progress titles={titles} activeIndex={finishEnabled ? step + 1 : step} />
      </Header>
      <ActivePage key={step} step={activeStep} onNextClick={handleNextClick} onBackClick={handleBackClick} />
      <Prompt />
    </Layout>
  );
};

export default DirectCalls;
