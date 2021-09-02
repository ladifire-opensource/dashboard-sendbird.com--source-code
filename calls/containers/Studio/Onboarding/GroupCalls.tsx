import { FC, useState } from 'react';

import { useOnboardingContext } from './OnboardingContext';
import Prompt from './Prompt';
import { Header, Layout } from './components';
import Progress from './components/Progress';
import { GroupCallsContent } from './contents';

const pages = [
  { component: GroupCallsContent.Operator, title: 'calls.studio.onboarding.header.progress.group.operator' },
  { component: GroupCallsContent.Contacts, title: 'calls.studio.onboarding.header.progress.group.contacts' },
  { component: GroupCallsContent.Room, title: 'calls.studio.onboarding.header.progress.group.room' },
];

const GroupCalls: FC<{ onCancel?: () => void }> = ({ onCancel }) => {
  const [step, setStep] = useState(0);
  const { finishOnboarding } = useOnboardingContext();

  const increaseStep = () => {
    step < pages.length - 1 ? setStep((step) => step + 1) : finishOnboarding('group');
  };

  const decreaseStep = () => setStep((step) => step - 1);

  const handleNextClick = () => increaseStep();

  const handleBackClick = () => (step === 0 ? onCancel?.() : decreaseStep());

  const titles = pages.map((page) => page.title);
  const activeStep = { current: step + 1, total: pages.length };
  const ActivePage = pages[step].component;

  return (
    <Layout>
      <Header>
        <Progress titles={titles} activeIndex={step} />
      </Header>
      <ActivePage key={step} step={activeStep} onNextClick={handleNextClick} onBackClick={handleBackClick} />
      <Prompt />
    </Layout>
  );
};

export default GroupCalls;
