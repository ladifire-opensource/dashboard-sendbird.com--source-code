import { FC } from 'react';
import { useIntl } from 'react-intl';
import { Prompt as ReactRouterPrompt } from 'react-router';

const Prompt: FC<{ when?: boolean }> = ({ when }) => {
  const intl = useIntl();

  return (
    <ReactRouterPrompt
      when={when}
      message={(location) =>
        location.pathname.includes('/calls/studio') ||
        intl.formatMessage({ id: 'calls.studio.onboarding.leavePrompt.description' })
      }
    />
  );
};

export default Prompt;
