import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import styled from 'styled-components';

import { cssVariables, InlineNotification, Link, LinkVariant } from 'feather';
import moment from 'moment-timezone';
import { interval, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import { commonActions, coreActions } from '@actions';
import { coreApi } from '@api';
import { fetchMemberRoleByName } from '@common/api';
import { CLOUD_FRONT_URL } from '@constants';
import { checkDNSResolveStatus, getApplicationSummary, registerCallsApplication } from '@core/api';
import { getErrorMessage } from '@epics';
import { useAuthorization } from '@hooks/useAuthorization';
import { useShowConvertFreeNotification } from '@hooks/useShowConvertFreeNotification';
import { Card, ContentContainer } from '@ui/components';
import { ConvertFreePlanNotification } from '@ui/components/ConvertFreePlanNotification';
import Tour from '@ui/components/Tour';
import { logException } from '@utils/logException';

import { Documentation } from './Documentation';
import { ProductView } from './ProductView';
import { Application } from './application';
import { EyeCatcher } from './eyeCatcher';

const OverviewContainer = styled(ContentContainer)`
  padding-top: 32px;
  padding-bottom: 80px !important;
`;

const Section = styled.div<{ gap?: number }>`
  margin: 0;
  display: grid;
  grid-row-gap: ${({ gap }) => gap || 32}px;
  & + & {
    margin-top: 16px;
  }
  ${Card} {
    margin-right: 0;
    margin-left: 0;
  }
`;

const useCallsAppRegistrationFailover = () => {
  const organizationUid = useSelector((state: RootState) => state.organizations.current.uid);
  const { applicationSummary, data: app } = useSelector((state: RootState) => state.applicationState);
  const { role } = useAuthorization();
  const dispatch = useDispatch();

  const getIsCallsEnabled = useCallback(async () => {
    if (!app) {
      return false;
    }
    if (applicationSummary) {
      return applicationSummary.is_calls_enabled;
    }
    const { data: summary } = await getApplicationSummary({ app_id: app.app_id });
    const { is_calls_enabled } = summary;

    return is_calls_enabled;
  }, [app, applicationSummary]);

  useEffect(() => {
    const handleFailover = async () => {
      if (!app) {
        return;
      }

      try {
        const isCallsEnabled = await getIsCallsEnabled();
        const isAppRegistered = app.attrs.sendbird_calls.enabled;
        const isFailoverRequired = isCallsEnabled && !isAppRegistered;

        if (isFailoverRequired) {
          await registerCallsApplication({ app_id: app.app_id });
          fetchMemberRoleByName(role.name)
            .then((response) => {
              const role = response.data;
              /* update store to enable Calls */
              dispatch(
                coreActions.registerCallsApplication({
                  role,
                }),
              );
            })
            .catch(() => {
              /* call fallback actions */
              dispatch(commonActions.verifyAuthenticationRequest());
            });
        }
      } catch (error) {
        logException({ error: getErrorMessage(error), context: { error } });
      }
    };

    handleFailover();
  }, [app, dispatch, getIsCallsEnabled, organizationUid, role.name]);
};

export const Overview: FC = () => {
  const intl = useIntl();
  const { application, user, dialogs } = useSelector((state: RootState) => {
    return { application: state.applicationState.data, user: state.auth.user, dialogs: state.dialogs };
  });
  const dispatch = useDispatch();

  const showConvertFreePlanNotification = useShowConvertFreeNotification();

  const dnsChecker = useRef<Subscription>();

  const [dnsWaiting, setDNSWaiting] = useState(false);

  useEffect(() => {
    return () => {
      if (dnsChecker.current) {
        dnsChecker.current.unsubscribe();
        dnsChecker.current = undefined;
      }
    };
  }, [dispatch]);

  const checkDNSResolved = useCallback(async () => {
    if (application) {
      try {
        await checkDNSResolveStatus({ appId: application.app_id });
        return true;
      } catch (error) {
        return false;
      }
    }
  }, [application]);

  const checker = interval(60000).pipe(
    tap(async () => {
      const isResolved = await checkDNSResolved();
      if (isResolved && moment(application?.created_at).add(5, 'minute').isBefore(moment())) {
        setDNSWaiting(false);

        if (dnsChecker.current) {
          dnsChecker.current.unsubscribe();
          dnsChecker.current = undefined;
        }
      }
    }),
  );

  useEffect(() => {
    if (moment(application?.created_at).add(5, 'minute').isAfter(moment())) {
      checkDNSResolved().then((resolved) => {
        if (!resolved) {
          setDNSWaiting(true);
          if (!dnsChecker.current) {
            dnsChecker.current = checker.subscribe();
          }
        }
      });
    }
  }, [application, checkDNSResolved, checker]);

  useCallsAppRegistrationFailover();

  const notifications: React.ReactNode[] = [
    ...(showConvertFreePlanNotification ? [<ConvertFreePlanNotification key="inlineNotiConvertFree" />] : []),
    ...(dnsWaiting
      ? [
          <InlineNotification
            key="inlineNotiPropagate"
            type="warning"
            message={intl.formatMessage({ id: 'core.overview.alerts_overviewPropagated' })}
          />,
        ]
      : []),
  ];

  const handleStepEnd = useCallback(() => {
    coreApi
      .setCoachmarkComplete()
      .then((response) => {
        dispatch(commonActions.updateUser(response.data));
      })
      .catch((error) => {
        logException({ error: getErrorMessage(error) });
      });
  }, [dispatch]);

  return (
    <OverviewContainer>
      <Section>
        <Application notifications={notifications} />
        <Documentation />
        <ProductView />
        <EyeCatcher />
        {dialogs.dialogTypes === '' && !user.coachmark_completed && (
          <Tour
            steps={[
              {
                isDialog: true,
                title: intl.formatMessage({ id: 'common.onboarding.tour.step0.title' }),
                content: intl.formatMessage({ id: 'common.onboarding.tour.step0.content' }),
                placement: 'center',
                target: 'body',
                disableOverlayClose: true,
                beaconComponent: () => <div style={{ position: 'fixed' }} />, // it override beacon and prevent body scroll
                spotlight: {
                  isHidden: true,
                },
              },
              {
                title: intl.formatMessage({ id: 'common.onboarding.tour.step1.title' }),
                content: intl.formatMessage({ id: 'common.onboarding.tour.step1.content' }),
                cover: {
                  src: `${CLOUD_FRONT_URL}/dashboard/img-tutorial-01.png`,
                  srcSet: `${CLOUD_FRONT_URL}/dashboard/img-tutorial-01.png,
                  ${CLOUD_FRONT_URL}/dashboard/img-tutorial-01%402x.png 2x,
                  ${CLOUD_FRONT_URL}/dashboard/img-tutorial-01%403x.png 3x
                  `,
                },
                target: '#tourTargetAppId',
                disableBeacon: true,
                placement: 'bottom',
                offset: 4,
                disableOverlayClose: true,
                styles: {
                  options: {
                    arrowColor: cssVariables('neutral-3'),
                  },
                },
              },
              {
                title: intl.formatMessage({ id: 'common.onboarding.tour.step2.title' }),
                content: intl.formatMessage(
                  {
                    id: 'common.onboarding.tour.step2.content',
                  },
                  {
                    a: (text: string) => (
                      <Link variant={LinkVariant.Inline} target="_blank" href="https://sendbird.com/docs">
                        {text}
                      </Link>
                    ),
                  },
                ),
                cover: {
                  src: `${CLOUD_FRONT_URL}/dashboard/img-tutorial-02.png`,
                  srcSet: `${CLOUD_FRONT_URL}/dashboard/img-tutorial-02.png,
                  ${CLOUD_FRONT_URL}/dashboard/img-tutorial-02%402x.png 2x,
                  ${CLOUD_FRONT_URL}/dashboard/img-tutorial-02%403x.png 3x
                  `,
                },
                target: '#tourTargetDocs',
                disableBeacon: true,
                placement: 'right-start',
                offset: 0,
                disableOverlayClose: true,
                styles: {
                  options: {
                    arrowColor: cssVariables('neutral-3'),
                  },
                },
              },
              {
                title: intl.formatMessage({ id: 'common.onboarding.tour.step3.title' }),
                content: intl.formatMessage(
                  { id: 'common.onboarding.tour.step3.content' },
                  {
                    a: (text: string) => (
                      <Link variant={LinkVariant.Inline} href="/settings/members" useReactRouter={true}>
                        {text}
                      </Link>
                    ),
                    strong: (text: string) => <strong>{text}</strong>,
                  },
                ),
                cover: {
                  src: `${CLOUD_FRONT_URL}/dashboard/img-tutorial-03.png`,
                  srcSet: `${CLOUD_FRONT_URL}/dashboard/img-tutorial-03.png,
                  ${CLOUD_FRONT_URL}/dashboard/img-tutorial-03%402x.png 2x,
                  ${CLOUD_FRONT_URL}/dashboard/img-tutorial-03%403x.png 3x
                  `,
                },
                target: '.tourTargetGNB > div[role="combobox"]:last-child',
                disableBeacon: true,
                placement: 'bottom-end',
                floaterProps: {
                  options: {
                    offset: {
                      offset: '-36, 10',
                    },
                  },
                },
                disableOverlayClose: true,
                styles: {
                  options: {
                    arrowColor: cssVariables('neutral-3'),
                  },
                },
              },
              {
                title: intl.formatMessage({ id: 'common.onboarding.tour.step4.title' }),
                content: intl.formatMessage(
                  { id: 'common.onboarding.tour.step4.content' },
                  {
                    strong: (text) => <strong>{text}</strong>,
                  },
                ),
                cover: {
                  src: `${CLOUD_FRONT_URL}/dashboard/img-tutorial-04.png`,
                  srcSet: `${CLOUD_FRONT_URL}/dashboard/img-tutorial-04.png,
                  ${CLOUD_FRONT_URL}/dashboard/img-tutorial-04%402x.png 2x,
                  ${CLOUD_FRONT_URL}/dashboard/img-tutorial-04%403x.png 3x
                  `,
                },
                target: '#tourTargetUsers',
                offset: 0,
                disableBeacon: true,
                placement: 'right-start',
                isFixed: true,
                disableOverlayClose: true,
                styles: {
                  options: {
                    arrowColor: cssVariables('neutral-3'),
                  },
                },
                spotlight: {
                  offset: { x: -80 },
                },
              },
            ]}
            onStepEnd={handleStepEnd}
          />
        )}
      </Section>
    </OverviewContainer>
  );
};
