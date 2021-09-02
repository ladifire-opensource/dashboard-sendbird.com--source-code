import { useIntl } from 'react-intl';

import { InlineNotification, LinkVariant } from 'feather';

import { useTechnicalIssueSubmissionAvailability } from '@common/containers/support/useTechnicalIssueSubmissionAvailability';
import { useAppId, useTypedSelector } from '@hooks';
import { CONTACT_US_ALLOWED_PERMISSIONS } from '@hooks/useOrganizationMenu';
import { LinkWithPermissionCheck } from '@ui/components';

const affectedAppIds = [
  // org: ssg.com / 70438c4c247e33521f87ce2d615fb13e234e2151
  '41C94DF4-C1DC-4E2D-8CC8-58709FEAB0BF',
  '4ED4A015-33AF-4232-B688-D85C3467A71E',
  'D37B2724-256E-4364-A133-B51340CADE12',
  // org: spotlight101 / 77bd0650c6b772cc9ed5aa7d9f4063c3a88d2f38
  'D126457C-47B8-4AE4-AAE4-C9788F8EED60',
  '097A1824-EB63-48A5-AC8B-72E2475AD421',
  // org: F&F / 9cf475bdab4211ccb2993661282f0ab0671cd8da
  '08654556-5407-4941-B798-7AD1DDCDED7F',
  // org: Coinone / c177c29f091229ff9ad42005c66570388fa0a1f1
  '947A5671-CD58-4386-8C36-4A913B5899C8',
  'A45BE021-420A-4210-A2D4-BAAA4B5D27ED',
  // org: SBS Contents Hub. / d1a149ae1e04aef751e45d83bd243920de1d84e4
  '955A89CB-5BA8-4DA2-8031-444B06620FB5',
  '43CD7073-7E02-4AA3-8685-CC03396AAD5C',
  // org: Carousell / e40098c9d1faffe83fabf3b89eb248b1a035cade
  '65CB9229-8D1D-4991-B28C-04C5A2174AF9',
  'F3CB6187-CB42-4CD1-95FC-1C46F8856006',
  'E01BE4CE-8730-4CF5-98D6-A71406C6A41A',
];

const expirationDate = new Date('2021-03-12T23:59:59.999Z');

export const CCUErrorAlert = () => {
  const appId = useAppId();
  const region = useTypedSelector((state) => state.applicationState.data?.region);
  const intl = useIntl();

  const {
    isAvailable: canSubmitTechnicalIssue,
    isLoading: isLoadingSupportPlan,
  } = useTechnicalIssueSubmissionAvailability();

  if (!affectedAppIds.includes(appId) || Date.now() > expirationDate.valueOf()) {
    return null;
  }

  const message = intl.formatMessage(
    {
      id: region?.match(/ap\-2/i)
        ? 'core.overview.statistics_label.daily.noti.ccuAP2'
        : 'core.overview.statistics_label.daily.noti.ccuAP4',
    },
    {
      a: (text) => (
        <LinkWithPermissionCheck
          href={`/settings/contact_us${
            !isLoadingSupportPlan && canSubmitTechnicalIssue ? '?category=technical_issue' : ''
          }`}
          permissions={CONTACT_US_ALLOWED_PERMISSIONS}
          variant={LinkVariant.Inline}
          useReactRouter={true}
        >
          {text}
        </LinkWithPermissionCheck>
      ),
    },
  );
  return <InlineNotification type="warning" message={message} />;
};
