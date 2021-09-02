import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables } from 'feather';

import { ChevronLink } from '@ui/components';
import { InformationCard, contentStyle } from '@ui/components/InformationCard';

const StyledEyeCatcher = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 32px;
`;

const EyeCatcherItem = styled(InformationCard)`
  ${contentStyle}
  background: ${cssVariables('neutral-1')};
  border-radius: 4px;
  padding: 24px;
`;

export const EyeCatcher = () => {
  const intl = useIntl();
  return (
    <StyledEyeCatcher>
      <EyeCatcherItem>
        <h3>{intl.formatMessage({ id: 'core.overview.eyeCatcher.title.docs' })}</h3>
        <p>{intl.formatMessage({ id: 'core.overview.eyeCatcher.description.docs' })}</p>
        <ChevronLink href="https://sendbird.com/docs" target="_blank" useReactRouter={false}>
          {intl.formatMessage({ id: 'core.overview.eyeCatcher.link.docs' })}
        </ChevronLink>
      </EyeCatcherItem>
      <EyeCatcherItem>
        <h3>{intl.formatMessage({ id: 'core.overview.eyeCatcher.title.help' })}</h3>
        <p>{intl.formatMessage({ id: 'core.overview.eyeCatcher.description.help' })}</p>
        <ChevronLink href="https://help.sendbird.com" target="_blank" useReactRouter={false}>
          {intl.formatMessage({ id: 'core.overview.eyeCatcher.link.help' })}
        </ChevronLink>
      </EyeCatcherItem>
    </StyledEyeCatcher>
  );
};
