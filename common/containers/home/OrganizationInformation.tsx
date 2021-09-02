import { FC } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import styled from 'styled-components';

import { Avatar, AvatarType, Button, cssVariables } from 'feather';

import { Page } from '@constants';
import { useAuthorization } from '@hooks';
import { makeGrid } from '@ui/components';

import { Notifications } from './Notifications';

const { ResponsiveContainer, wideGridMediaQuery } = makeGrid({
  wideWidth: 1008,
  narrowMaxWidth: 820,
});

const Container = styled(ResponsiveContainer)`
  display: block;

  ${wideGridMediaQuery`
    padding-left: 16px !important;
    padding-right: 16px !important;
  `}
  .orgNotification {
    margin-bottom: 16px;
    & + .orgNotification {
      margin-top: 6px;
    }
  }

  .InlineNotification + .InlineNotification {
    margin-top: 16px;
  }

  .InlineNotification:last-child {
    margin-bottom: 16px;
  }
`;

const Section = styled.div`
  padding: 32px 0 0;
  margin-bottom: 32px;
`;

const OrganizationRow = styled.div`
  display: flex;
  align-items: start;
  justify-content: space-between;
`;

const OrganizationBasic = styled.div`
  display: flex;
  align-items: center;
`;

const OrganizationName = styled.div`
  margin-left: 16px;

  & > .onHeader {
    font-size: 20px;
    font-weight: 600;
    line-height: 28px;
    letter-spacing: -0.25px;
    color: ${cssVariables('neutral-10')};
  }
  & > .onCounts {
    display: flex;
    align-items: center;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: -0.1px;
    color: ${cssVariables('neutral-7')};
    & > .onDivider {
      position: relative;
      content: '';
      margin: 0 8px;
      width: 3px;
      height: 3px;
      background-color: ${cssVariables('neutral-7')};
    }
  }
`;

type Props = {
  organization: Organization;
};

export const OrganizationInformation: FC<Props> = ({ organization }) => {
  const intl = useIntl();
  const history = useHistory();
  const { isAccessiblePage } = useAuthorization();

  const handleSettingsClick = () => history.push('/settings');

  return (
    <Container data-test-id="OrganizationInformation">
      <Section>
        <OrganizationRow>
          <OrganizationBasic>
            <Avatar type={AvatarType.Organization} profileID={organization.slug_name} size={64} />
            <OrganizationName>
              <div className="onHeader" data-test-id="OrganizationName">
                {organization.name}
              </div>
              <div className="onCounts" data-test-id="OrganizationSummary">
                {organization.total_members} members <div className="onDivider" /> {organization.total_applications}{' '}
                applications{' '}
              </div>
            </OrganizationName>
          </OrganizationBasic>
          {isAccessiblePage(Page.organization) && (
            <Button
              buttonType="tertiary"
              icon="settings"
              size="small"
              onClick={handleSettingsClick}
              data-test-id="OrganizationSettingsButton"
            >
              {intl.formatMessage({ id: 'common.home.organizationInformation.button.organization' })}
            </Button>
          )}
        </OrganizationRow>
      </Section>
      <Notifications />
    </Container>
  );
};
