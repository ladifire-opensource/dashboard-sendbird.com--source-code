import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

import { Icon, cssVariables, Subtitles } from 'feather';

import { useAuthentication } from '@authentication';
import { OrganizationStatus } from '@constants';

import { OrgSettingPageHeader } from './OrgSettingPageHeader';

const Wrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 576px;
  margin: 0 auto;
  margin-bottom: 88px;
  svg {
    fill: ${cssVariables('neutral-5')};
  }
  color: ${cssVariables('neutral-7')};
`;

const Title = styled.h1`
  ${Subtitles['subtitle-03']};
  margin: 12px 0 4px;
  strong {
    font-weight: 600;
  }
`;

export const OrganizationStatusPage = ({ title }) => {
  const intl = useIntl();
  const { isOrganizationDeactivated } = useAuthentication();
  const { status = 'INACTIVE' } = useSelector((state: RootState) => state.organizations.current);

  if (!isOrganizationDeactivated) {
    return null;
  }

  const texts = {
    [OrganizationStatus.Inactive]: {
      title: intl.formatMessage(
        { id: 'common.settings.organizationStatus.inactive.title' },
        {
          page: title,
          strong: (text) => <strong>{text}</strong>,
        },
      ),
    },
    [OrganizationStatus.Archived]: {
      title: intl.formatMessage(
        { id: 'common.settings.organizationStatus.archived.title' },
        {
          page: title,
          strong: (text) => <strong>{text}</strong>,
        },
      ),
    },
  };
  return (
    <div
      css={`
        display: flex;
        flex-direction: column;
        height: 100%;
      `}
    >
      <OrgSettingPageHeader>
        <OrgSettingPageHeader.Title>{title}</OrgSettingPageHeader.Title>
      </OrgSettingPageHeader>
      <Wrapper>
        <Icon icon="hide" size={80} />
        <Title data-test-id="OrganizationStatusPageTitle">{texts[status]?.title}</Title>
      </Wrapper>
    </div>
  );
};
