import { useMemo, useContext, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import styled from 'styled-components';

import {
  cssVariables,
  Headings,
  Body,
  Link,
  LinkVariant,
  Button,
  Icon,
  Lozenge,
  LozengeVariant,
  Spinner,
} from 'feather';

import { SupportPlanContext } from '@/SupportPlanContext';
import { SettingsGridCard } from '@common/containers/layout';

const GridTitle = styled.div`
  display: flex;
  align-items: center;

  ${Lozenge} {
    margin-left: 8px;
  }
`;

const PlanWrapper = styled.div`
  display: flex;
  & + .supportPlanNotification {
    margin-top: 24px;
  }
`;

const Plan = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const PlanName = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const PlanAction = styled.div`
  margin-left: auto;

  a {
    font-size: 14px;
  }
`;

const PlanDescription = styled.p`
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-7')};
  margin: 0;
`;

const SpinnerWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
`;

const Current = styled.div`
  ${Headings['heading-02']};
  color: ${cssVariables('neutral-10')};
`;

const Future = styled.div`
  display: flex;
  align-items: center;
  ${Headings['heading-02']};
  color: ${cssVariables('neutral-5')};
  svg {
    margin: 0 4px;
    fill: ${cssVariables('neutral-5')};
  }
`;

export const SupportPlan = () => {
  const intl = useIntl();
  const { isLoading, current, future } = useContext(SupportPlanContext);
  const history = useHistory();

  const handleChangeButtonClick = useCallback(() => {
    history.push('/settings/general/plans/support', { background: history.location });
  }, [history]);

  const renderPlanAction = useMemo(() => {
    if (future) {
      return <Link variant={LinkVariant.Inline}>View plans</Link>;
    }
    return (
      <Button buttonType="primary" onClick={handleChangeButtonClick}>
        Change
      </Button>
    );
  }, [future, handleChangeButtonClick]);
  return (
    <SettingsGridCard
      title={
        <GridTitle>
          {intl.formatMessage({ id: 'common.settings.general.supportPlan.title' })}
          {future && (
            <Lozenge variant={LozengeVariant.Light} color="blue">
              SCHEDULED
            </Lozenge>
          )}
        </GridTitle>
      }
      titleColumns={4}
      gridItemConfig={{
        subject: {
          alignSelf: 'start',
        },
      }}
    >
      <PlanWrapper>
        <Plan>
          {isLoading ? (
            <SpinnerWrapper>
              <Spinner />
            </SpinnerWrapper>
          ) : (
            <>
              <PlanName>
                <Current data-test-id="CurrentSupportPlanName">{current ? current.display_name : 'Community'}</Current>
                {future && (
                  <Future>
                    <Icon icon="arrow-right" size={16} />
                    {future.display_name}
                  </Future>
                )}
              </PlanName>
              <PlanDescription>
                {intl.formatMessage({ id: 'common.settings.general.supportPlan.planDescription' })}
              </PlanDescription>
            </>
          )}
        </Plan>
        <PlanAction>{renderPlanAction}</PlanAction>
      </PlanWrapper>
    </SettingsGridCard>
  );
};
