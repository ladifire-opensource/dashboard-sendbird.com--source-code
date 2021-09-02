import { FC, useContext, useRef, useCallback, Fragment } from 'react';
import { useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import {
  Headings,
  Body,
  Button,
  Icon,
  Lozenge,
  LozengeVariant,
  Subtitles,
  Typography,
  Table,
  ContextualHelp,
  cssVariables,
} from 'feather';
import moment from 'moment-timezone';

import { SupportPlanContext } from '@/SupportPlanContext';
import { EMPTY_TEXT, DEFAULT_DATE_FORMAT, SubscriptionName } from '@constants';
import { FullScreenModal } from '@ui/components/FullScreenModal';
import FullScreenModalHeader from '@ui/components/FullScreenModal/components/FullScreenModalHeader';

enum SupportPlanStatus {
  Available = 'Available',
  InUse = 'InUse',
  Scheduled = 'Scheduled',
  Disabled = 'Disabled',
}

type SupportPlan = {
  subscription_name: Subscription['subscription_name'];
  name: string;
  details: {
    pricing: string;
    community: string;
    apiStatus: string;
    guaranteedFirstResponseTime?: string;
    ticketSupportInEmail?: string;
    emergencyHotline?: string;
    slackSupport?: string;
    customerSuccessManager?: string; // Customer success manager
    quarterlyBusinessReview?: string;
  };
};

const supportPlans: SupportPlan[] = [
  {
    subscription_name: SubscriptionName.Community,
    name: 'Community',
    details: {
      pricing: 'Free',
      community: 'Yes',
      apiStatus: 'Yes',
    },
  },
  {
    subscription_name: SubscriptionName.SupportL0,
    name: 'Base',
    details: {
      pricing: 'Included in Paid Plan',
      community: 'Yes',
      apiStatus: 'Yes',
      guaranteedFirstResponseTime: 'Best effort',
      ticketSupportInEmail: 'Yes (8x5)',
    },
  },
  {
    subscription_name: SubscriptionName.SupportL1,
    name: 'L1',
    details: {
      pricing: `4% of monthly\nor (min. $1,000/mo) *`,
      apiStatus: 'Yes',
      community: 'Yes',
      guaranteedFirstResponseTime: `P1 - 3 business hrs\nP2 - 6 business hrs\nP3 - 16 business hrs`,
      ticketSupportInEmail: 'Yes (8x5)',
    },
  },
  {
    subscription_name: SubscriptionName.SupportL2,
    name: 'L2',
    details: {
      pricing: `6% of monthly\nor (min. $2,000/mo) *`,
      community: 'Yes',
      apiStatus: 'Yes',
      guaranteedFirstResponseTime: `P1 - 2 business hrs\nP2 - 4 business hrs\nP3 - 8 business hrs`,
      ticketSupportInEmail: 'Yes (8x5)',
      emergencyHotline: 'Yes',
    },
  },
  {
    subscription_name: SubscriptionName.SupportL3,
    name: 'L3',
    details: {
      pricing: `8% of monthly\nor (min. $5,000/mo) *`,
      community: 'Yes',
      apiStatus: 'Yes',
      guaranteedFirstResponseTime: `P1 - 1 hr (24x7)\nP2 - 3 business hrs\nP3 - 6 business hrs`,
      ticketSupportInEmail: 'Yes (24x7)',
      emergencyHotline: 'Yes',
      slackSupport: 'Optional with extra payment',
      customerSuccessManager: 'Yes',
      quarterlyBusinessReview: 'Yes',
    },
  },
];

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 1024px;
  margin: 0 auto;
`;

const SupportPlansWrapper = styled.div`
  width: 100%;
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid ${cssVariables('neutral-3')};
  border-radius: 4px;
`;

const SupportPlansTable = styled.table`
  border-collapse: collapse;

  tr {
    border-bottom: 1px solid ${cssVariables('neutral-3')};
  }

  td {
    vertical-align: top;
    padding: 12px 8px;
    font-size: 14px;
    line-height: 20px;
    color: ${cssVariables('neutral-10')};
    white-space: pre-wrap;
  }

  thead {
    border-bottom: 1px solid ${cssVariables('neutral-3')};

    th {
      width: 165px;
      height: 112px;
      padding: 16px 8px 12px;
    }
    th:first-child {
      width: 120px;
    }
  }

  tbody > tr td:first-child {
    width: 120px;
    word-break: break-word;
    font-size: 13px;
    font-weight: 600;
    line-height: 16px;
  }
`;

const SupportPlanHeader = styled.div`
  display: flex;
  flex-direction: column;
`;

const SupportPlanNameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  margin-bottom: 20px;
  height: 52px;
`;

const SupportPlanName = styled.div<{ status: SupportPlanStatus }>`
  ${Headings['heading-05']}
  color: ${({ status }) => {
    if (status === SupportPlanStatus.InUse) {
      return cssVariables('purple-7');
    }
    if (status === SupportPlanStatus.Disabled) {
      return cssVariables('neutral-6');
    }
    return cssVariables('neutral-10');
  }};
`;

const SupportPlanStatusWrapper = styled.div`
  display: flex;
  height: 32px;
  align-items: center;
`;

const ScheduledDate = styled.div`
  ${Body['body-short-01']}
  color: ${cssVariables('neutral-7')};
`;

const CurrentPlan = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 32px;
  border: 1px solid ${cssVariables('neutral-2')};
  border-radius: 4px;
  ${Headings['heading-01']}
  color: ${cssVariables('purple-7')};
`;

const FreeTrialOnly = styled.div`
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-7')};
`;

const Footnote = styled.p`
  margin-top: 16px;
  ${Subtitles['subtitle-01']}
  color: ${cssVariables('neutral-10')};
  text-align: right;
`;

const DetailsWrapper = styled.div`
  width: 100%;
  border-bottom: 1px solid ${cssVariables('neutral-3')};
`;

const DetailWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 32px;
`;

const DetailName = styled.div`
  width: 232px;
  ${Subtitles['subtitle-02']}
  color: ${cssVariables('neutral-10')};
`;

const DetailDescriptionWrapper = styled.div`
  width: calc(1024px - 232px);
  padding-left: 32px;
  ${Body['body-short-01']}
  color: ${cssVariables('neutral-10')};
`;

const SupportPriorityTable = styled(Table)`
  margin-top: 16px;

  strong {
    font-weight: 600;
  }
  td {
    white-space: pre-wrap;
  }
`;

const Policy = styled.p`
  margin-top: 32px;
  ${Typography['label-03']}
  color: ${cssVariables('neutral-6')};
`;

const Asterisk = styled.span`
  color: ${cssVariables('red-5')};
`;

const SupportPlanModal: FC = () => {
  const history = useHistory<{ background: Location }>();
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const { current, future } = useContext(SupportPlanContext);

  const getPlanStatus = (subscription_name: Subscription['subscription_name']) => {
    if (current ? current.subscription_name === subscription_name : subscription_name === SubscriptionName.Community) {
      return SupportPlanStatus.InUse;
    }
    if (future && future.subscription_name === subscription_name) {
      return SupportPlanStatus.Scheduled;
    }
    if (future && future.subscription_name !== subscription_name) {
      return SupportPlanStatus.Disabled;
    }
    return SupportPlanStatus.Available;
  };

  const handleContactSalesClick = () => {
    history.push('/settings/contact_us?category=pricing');
  };

  const handleMoveToTopButtonClick = () => {
    modalContainerRef.current?.scrollTo(0, 0);
  };

  const handleCloseModalButtonClick = useCallback(() => {
    if (history.location.state?.background) {
      history.goBack();
      return;
    }

    history.push('/settings/general');
  }, [history]);

  const renderStatus = (status: SupportPlanStatus, subscription_name: SubscriptionName) => {
    if (status === SupportPlanStatus.Scheduled) {
      return (
        <ScheduledDate>
          {future ? `Starts on ${moment(future.start_date).format(DEFAULT_DATE_FORMAT)})` : 'Scheduled'}
        </ScheduledDate>
      );
    }
    if (status === SupportPlanStatus.InUse) {
      return (
        <CurrentPlan data-test-id="SupportPlanModalCurrentPlan">
          Current plan
          <Icon
            icon="done"
            size={16}
            color={cssVariables('purple-7')}
            css={css`
              margin-left: 4px;
            `}
          />
        </CurrentPlan>
      );
    }
    if (subscription_name === SubscriptionName.Community) {
      return <FreeTrialOnly data-test-id="SupportPlanFreeTrialOnly">Free trial only</FreeTrialOnly>;
    }
    if (status === SupportPlanStatus.Disabled) {
      return (
        <ContextualHelp
          content="You can't choose because you are already scheduling to change to another plan."
          placement="bottom"
          css="width: 100%;"
          tooltipContentStyle={css`
            width: 256px;
            margin-top: 3px;
            text-align: left;
            font-weight: 400;
          `}
        >
          <Button
            buttonType="primary"
            size="small"
            css="width: 100%;"
            disabled={true}
            data-test-id="SupportPlanModalDisabledContactSales"
          >
            Contact sales
          </Button>
        </ContextualHelp>
      );
    }
    return (
      <Button
        buttonType="primary"
        size="small"
        css="width: 100%;"
        data-test-id="SupportPlanContactSales"
        onClick={handleContactSalesClick}
      >
        Contact sales
      </Button>
    );
  };

  return (
    <FullScreenModal
      ref={modalContainerRef}
      id="SupportPlanModal"
      aria-labelledby="SupportPlanModalTitle"
      aria-describedby="SupportPlanModalDescription"
      onClose={handleCloseModalButtonClick}
    >
      <FullScreenModalHeader>
        <FullScreenModalHeader.Title id="SupportPlanModalTitle">Sendbird Support Plans</FullScreenModalHeader.Title>
        <FullScreenModalHeader.Subtitle id="SupportPlanModalDescription">
          <strong>24x7 global support, guaranteed response times, customer success manager, slack support</strong>
          <br />
          Sendbird provides customers with several support options. The base plan comes free with any paid plan. Starter
          and Pro customers can optionally upgrade to Level 1 support for guaranteed response times. Enterprise plan
          customers can upgrade to any level of their choosing.
        </FullScreenModalHeader.Subtitle>
      </FullScreenModalHeader>
      <ModalBody>
        <SupportPlansWrapper>
          <SupportPlansTable>
            <thead>
              <tr>
                <th />
                {supportPlans.map(({ subscription_name, name }, index) => {
                  const status = getPlanStatus(subscription_name);
                  return (
                    <th key={index}>
                      <SupportPlanHeader>
                        <SupportPlanNameWrapper>
                          <SupportPlanName status={status}>{name}</SupportPlanName>
                          {status === SupportPlanStatus.InUse && (
                            <Lozenge variant={LozengeVariant.Light} color="purple">
                              IN USE
                            </Lozenge>
                          )}
                          {status === SupportPlanStatus.Scheduled && (
                            <Lozenge variant={LozengeVariant.Light} color="blue">
                              SCHEDULED
                            </Lozenge>
                          )}
                        </SupportPlanNameWrapper>
                        <SupportPlanStatusWrapper>{renderStatus(status, subscription_name)}</SupportPlanStatusWrapper>
                      </SupportPlanHeader>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Pricing</td>
                {supportPlans.map(({ details: { pricing } }, index) => (
                  <td key={index}>
                    {pricing.split(/(\*)/).map((text) => {
                      const Component = text === '*' ? Asterisk : Fragment;
                      return <Component key={text}>{text}</Component>;
                    })}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Community Access/Support</td>
                {supportPlans.map(({ details: { community } }, index) => (
                  <td key={index}>{community}</td>
                ))}
              </tr>
              <tr>
                <td>API Status (in Q2)</td>
                {supportPlans.map(({ details: { apiStatus } }, index) => (
                  <td key={index}>{apiStatus}</td>
                ))}
              </tr>
              <tr>
                <td>Guaranteed first response time</td>
                {supportPlans.map(({ details: { guaranteedFirstResponseTime } }, index) => (
                  <td key={index}>{guaranteedFirstResponseTime || EMPTY_TEXT}</td>
                ))}
              </tr>
              <tr>
                <td>Ticket Support in Email</td>
                {supportPlans.map(({ details: { ticketSupportInEmail } }, index) => (
                  <td key={index}>{ticketSupportInEmail || EMPTY_TEXT}</td>
                ))}
              </tr>
              <tr>
                <td>Emergency Hotline</td>
                {supportPlans.map(({ details: { emergencyHotline } }, index) => (
                  <td key={index}>{emergencyHotline || EMPTY_TEXT}</td>
                ))}
              </tr>
              <tr>
                <td>Slack Support</td>
                {supportPlans.map(({ details: { slackSupport } }, index) => (
                  <td key={index}>{slackSupport || EMPTY_TEXT}</td>
                ))}
              </tr>
              <tr>
                <td>Customer success manager</td>
                {supportPlans.map(({ details: { customerSuccessManager } }, index) => (
                  <td key={index}>{customerSuccessManager || EMPTY_TEXT}</td>
                ))}
              </tr>
              <tr>
                <td>Quarterly business review</td>
                {supportPlans.map(({ details: { quarterlyBusinessReview } }, index) => (
                  <td key={index}>{quarterlyBusinessReview || EMPTY_TEXT}</td>
                ))}
              </tr>
            </tbody>
          </SupportPlansTable>
          <Footnote>
            <Asterisk>*</Asterisk> Annual pricing is available upon request
          </Footnote>
        </SupportPlansWrapper>
        <DetailsWrapper>
          <DetailWrapper>
            <DetailName>Guaranteed first response time</DetailName>
            <DetailDescriptionWrapper>
              The speed of our support team's response time depends on the priority level you select when you submit
              your ticket, your support plan, and how your plan works with our business hours. Your ticket’s priority
              level can be reclassified by the agent to be higher or lower based on how an issue impacts your business.
              <SupportPriorityTable
                columns={[
                  {
                    title: 'Priority',
                    dataIndex: 'priority',
                    width: '88px',
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    width: '392px',
                    render: ({ status }) => status,
                  },
                  {
                    title: 'L1',
                    dataIndex: 'l1',
                    width: '88px',
                  },
                  {
                    title: 'L2',
                    dataIndex: 'l2',
                    width: '88px',
                  },
                  {
                    title: 'L3',
                    dataIndex: 'l3',
                    width: '88px',
                  },
                ]}
                dataSource={[
                  {
                    priority: 'P1',
                    status: (
                      <p>
                        <strong>Key functionality impaired in production: No workaround</strong>
                        <br />
                        Only applies to apps in production for key functionality. Represents a complete loss of service
                        or significant features that are completely unavailable, and no workaround exists. Features in
                        Early Access Program (EAP) do not apply.
                      </p>
                    ),
                    l1: `Within 3\nbusiness hours`,
                    l2: `Within 2\nbusiness hours`,
                    l3: `Within 1\nhr(24x7)`,
                  },
                  {
                    priority: 'P2',
                    status: (
                      <p>
                        <strong>Moderate impact in production with workaround</strong>
                        <br />
                        Includes intermittent issues and reduced quality of service in production. A workaround may be
                        available. Features in Early Access Program (EAP) do not apply.
                      </p>
                    ),
                    l1: `Within 6\nbusiness hours`,
                    l2: `Within 4\nbusiness hours`,
                    l3: `Within 3\nbusiness hours`,
                  },
                  {
                    priority: 'P3',
                    status: (
                      <p>
                        <strong>General Issue</strong>
                        <br />
                        Includes bugs and development issues, product questions and enhancement requests.
                      </p>
                    ),
                    l1: `Within 16\nbusiness hours`,
                    l2: `Within 8\nbusiness hours`,
                    l3: `Within 6\nbusiness hours`,
                  },
                ]}
              />
            </DetailDescriptionWrapper>
          </DetailWrapper>
          <DetailWrapper>
            <DetailName>Business Hour and Day</DetailName>
            <DetailDescriptionWrapper>
              The business day runs from 8AM to 5PM local time per the time zone selected by the customer (PT, KST) from
              Monday through Friday, excluding local public holidays.
            </DetailDescriptionWrapper>
          </DetailWrapper>
        </DetailsWrapper>
        <Policy>
          Sendbird may, at its sole discretion, update these support plans at any time; however, in no event will any
          update to these support plans result in any material reduction in the features of the individual support plan
          to which you are subscribed at the time of such update. The then-current support plans will be available on
          this webpage.
        </Policy>
        <Button buttonType="secondary" variant="ghost" css="margin-top: 32px;" onClick={handleMoveToTopButtonClick}>
          Move to top <Icon icon="arrow-up" size={20} color={cssVariables('neutral-9')} css="margin-left: 2px;" />
        </Button>
      </ModalBody>
    </FullScreenModal>
  );
};

export default SupportPlanModal;
