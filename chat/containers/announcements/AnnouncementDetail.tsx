import { FC, useMemo, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useParams, useRouteMatch, Switch, Route, Redirect } from 'react-router-dom';
import { Link, useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { cssVariables, animationFadeInOut, Headings, Button, Subtitles, Body, ScrollBar } from 'feather';
import moment from 'moment-timezone';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { useAuthorization, useShowDialog } from '@hooks';
import { QueryInjectedLocation } from '@interfaces';
import { ContentContainer, CopyButton, LastUpdatedAt, PageHeader } from '@ui/components';

import {
  useAnnouncementDetailContext,
  useAnnouncementDetailActionsContext,
  AnnouncementDetailContextProvider,
} from './AnnouncementDetailContext';
import { AnnouncementDetailInfo } from './AnnouncementDetailInfo';
import { AnnouncementStatistics } from './AnnouncementStatistics';
import { AnnouncementStatusLozenge } from './AnnouncementStatusLozenge';
import { useAnnouncementTimezone } from './AnnouncementTimezoneContextProvider';
import { EditAnnouncement } from './EditAnnouncement';
import { formatCeaseAtResumeAt } from './formatters';
import { UnexpectedAnnouncementStatusError } from './useAnnouncementActions';
import { useAnnouncementVersion } from './useAnnouncementVersion';

type Props = { onAnnouncementUpdated: (item: AnnouncementUnknownVersion) => void };

const GridLayout = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: grid;
  grid-template-rows: 56px 1fr;
  grid-gap: 1px;
  background: ${cssVariables('neutral-3')};

  > * {
    background: white;
  }
`;

const Main = styled.div`
  max-width: 1024px;
  padding-bottom: 56px;
`;

const TitleText = styled.h2`
  ${Headings['heading-03']};
  margin: 0;
  margin-right: 4px;
  max-width: 460px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EmptyStatsView = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: ${cssVariables('neutral-1')};
  border-radius: 4px;
  height: 56px;
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-7')};
`;

const AnimationFadeInOut = styled.div<{ running: boolean }>`
  ${(props) =>
    props.running
      ? css<{ running: boolean }>`
          animation-name: ${animationFadeInOut};
          animation-duration: 2s;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
          animation-fill-mode: both;
        `
      : null};
`;

const Actions = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 8px;
`;

const ActionButton = styled(Button).attrs({ type: 'button', size: 'small' })``;

const SectionTitle = styled.h3`
  ${Subtitles['subtitle-02']};
  color: ${cssVariables('neutral-7')};
  margin-bottom: 12px;

  &:not(:first-child) {
    margin-top: 32px;
  }
`;

const StatusText = styled.span`
  ${Headings['heading-02']};
  color: ${cssVariables('neutral-7')};
  text-align: right;
`;

const useNotEnoughTimeForEditDialog = () => {
  const intl = useIntl();
  const showDialog = useShowDialog();
  return useCallback(
    (minutes: number, onConfirm: () => void) =>
      showDialog({
        dialogTypes: DialogType.Custom,
        dialogProps: {
          size: 'small',
          title: intl.formatMessage({ id: 'chat.announcements.detail.dialogs.notEnoughTimeForEditDialog.title' }),
          description: intl.formatMessage(
            {
              id: 'chat.announcements.detail.dialogs.notEnoughTimeForEditDialog.description',
            },
            { minutes },
          ),
          positiveButtonProps: {
            text: intl.formatMessage({
              id: 'chat.announcements.detail.dialogs.notEnoughTimeForEditDialog.btn.confirm',
            }),
            onClick: onConfirm,
          },
          negativeButtonProps: {
            text: intl.formatMessage({ id: 'chat.announcements.detail.dialogs.notEnoughTimeForEditDialog.btn.cancel' }),
          },
        },
      }),
    [intl, showDialog],
  );
};

const AnnouncementDetailIndex: FC = () => {
  const intl = useIntl();

  const {
    id,
    item: announcement,
    stats,
    statsLoadTimestamp,
    updateStatus,
    isWaitingToResume,
  } = useAnnouncementDetailContext();

  const { cancel, pause, resume, stop, reload } = useAnnouncementDetailActionsContext();

  const timezone = useAnnouncementTimezone();
  const { isPermitted } = useAuthorization();
  const announcementVersion = useAnnouncementVersion();
  const showDialog = useShowDialog();
  const match = useRouteMatch();
  const history = useHistory();
  const { query } = history.location as QueryInjectedLocation;

  const showNotEnoughTimeForEditDialog = useNotEnoughTimeForEditDialog();

  const isUpdating = updateStatus === 'pending';

  const actions = useMemo(() => {
    if (announcement == null) {
      return [];
    }

    const cancelAction = (
      <ActionButton
        buttonType="tertiary"
        icon="delete"
        key="cancel"
        disabled={isUpdating}
        isLoading={isUpdating}
        onClick={() => {
          showDialog({
            dialogTypes: DialogType.Delete,
            dialogProps: {
              title: intl.formatMessage({ id: 'chat.announcements.detail.dialogs.cancelDialog.title' }),
              description: intl.formatMessage({ id: 'chat.announcements.detail.dialogs.cancelDialog.description' }),
              confirmText: intl.formatMessage({ id: 'chat.announcements.detail.dialogs.cancelDialog.btn.confirm' }),
              cancelText: intl.formatMessage({ id: 'chat.announcements.detail.dialogs.cancelDialog.btn.cancel' }),
              onDelete: async (setIsDeleting, setIsFatalError) => {
                setIsDeleting(true);
                try {
                  await cancel();
                } catch (error) {
                  if (error instanceof UnexpectedAnnouncementStatusError) {
                    setIsFatalError(true);
                    reload(); // reload the announcement to reload the unexpected status
                  }
                  throw error;
                }
              },
            },
          });
        }}
      >
        {intl.formatMessage({ id: 'chat.announcements.detail.action.cancel' })}
      </ActionButton>
    );

    const editAction = (
      <Link
        to={`${match?.url}/edit`}
        onClick={(event) => {
          const minutesLeftBeforeRunning = moment(announcement.scheduled_at).diff(moment(), 'minute', true);

          if (minutesLeftBeforeRunning <= 10) {
            event.preventDefault();
            showNotEnoughTimeForEditDialog(Math.max(1, Math.ceil(minutesLeftBeforeRunning)), () =>
              history.push(`${match?.url}/edit`),
            );
          }
        }}
      >
        <ActionButton buttonType="secondary" icon="edit" key="edit">
          {intl.formatMessage({ id: 'chat.announcements.detail.action.edit' })}
        </ActionButton>
      </Link>
    );

    const stopAction = (
      <ActionButton
        buttonType="tertiary"
        icon="remove"
        key="stop"
        disabled={isUpdating}
        isLoading={isUpdating}
        onClick={() => {
          showDialog({
            dialogTypes: DialogType.Delete,
            dialogProps: {
              title: intl.formatMessage({ id: 'chat.announcements.detail.dialogs.stopDialog.title' }),
              description: intl.formatMessage({ id: 'chat.announcements.detail.dialogs.stopDialog.description' }),
              confirmText: intl.formatMessage({ id: 'chat.announcements.detail.dialogs.stopDialog.btn.confirm' }),
              cancelText: intl.formatMessage({ id: 'chat.announcements.detail.dialogs.stopDialog.btn.cancel' }),
              onDelete: async (setIsDeleting, setIsFatalError) => {
                setIsDeleting(true);
                try {
                  await stop();
                } catch (error) {
                  if (error instanceof UnexpectedAnnouncementStatusError) {
                    setIsFatalError(true);
                    reload(); // reload the announcement to reload the unexpected status
                  }
                  throw error;
                }
              },
            },
          });
        }}
      >
        {intl.formatMessage({ id: 'chat.announcements.detail.action.stop' })}
      </ActionButton>
    );

    const pauseAction = (
      <ActionButton
        buttonType="tertiary"
        icon="pause"
        key="pause"
        disabled={isUpdating}
        isLoading={isUpdating}
        onClick={() => {
          showDialog({
            dialogTypes: DialogType.Confirm,
            dialogProps: {
              title: intl.formatMessage({ id: 'chat.announcements.detail.dialogs.pauseDialog.title' }),
              description: intl.formatMessage({ id: 'chat.announcements.detail.dialogs.pauseDialog.description' }),
              confirmText: intl.formatMessage({ id: 'chat.announcements.detail.dialogs.pauseDialog.btn.confirm' }),
              onConfirm: async (setIsPending, setIsFatalError) => {
                setIsPending(true);
                try {
                  await pause();
                } catch (error) {
                  if (error instanceof UnexpectedAnnouncementStatusError) {
                    setIsFatalError(true);
                    reload(); // reload the announcement to reload the unexpected status
                  }
                  throw error;
                }
              },
            },
          });
        }}
      >
        {intl.formatMessage({ id: 'chat.announcements.detail.action.pause' })}
      </ActionButton>
    );

    const resumeAction = (
      <ActionButton
        buttonType="tertiary"
        icon="resume"
        key="resume"
        disabled={isUpdating}
        isLoading={isUpdating}
        onClick={() => {
          showDialog({
            dialogTypes: DialogType.Confirm,
            dialogProps: {
              title: intl.formatMessage({ id: 'chat.announcements.detail.dialogs.resumeDialog.title' }),
              description: intl.formatMessage({ id: 'chat.announcements.detail.dialogs.resumeDialog.description' }),
              confirmText: intl.formatMessage({ id: 'chat.announcements.detail.dialogs.resumeDialog.btn.confirm' }),
              onConfirm: async (setIsPending, setIsFatalError) => {
                try {
                  setIsPending(true);
                  await resume();
                } catch (error) {
                  if (error instanceof UnexpectedAnnouncementStatusError) {
                    setIsFatalError(true);
                    reload(); // reload the announcement to reload the unexpected status
                  }
                  throw error;
                }
              },
            },
          });
        }}
      >
        {intl.formatMessage({ id: 'chat.announcements.detail.action.resume' })}
      </ActionButton>
    );

    if (announcement.status === 'scheduled') {
      return [cancelAction, editAction];
    }

    if (announcement.status === 'running') {
      return announcementVersion === 'v1.0' ? [stopAction] : [pauseAction, stopAction];
    }

    if (announcement.status === 'paused') {
      return [resumeAction];
    }

    return [];
  }, [
    announcement,
    announcementVersion,
    cancel,
    history,
    intl,
    isUpdating,
    match,
    pause,
    reload,
    resume,
    showDialog,
    showNotEnoughTimeForEditDialog,
    stop,
  ]);

  const running = announcement?.status === 'running';

  const statsSection = useMemo(() => {
    if (announcement == null) {
      return null;
    }

    if (
      announcement.status === 'scheduled' ||
      (announcementVersion === 'v1.5' && announcement.status === 'removed') ||
      (announcementVersion !== 'v1.5' && announcement.status === 'canceled')
    ) {
      return (
        <EmptyStatsView>{intl.formatMessage({ id: 'chat.announcements.detail.statistics.noData' })}</EmptyStatsView>
      );
    }

    return <AnnouncementStatistics announcement={announcement} stats={stats} />;
  }, [announcement, announcementVersion, intl, stats]);

  return (
    <GridLayout>
      <ContentContainer
        css={`
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;

          ${PageHeader} {
            width: 100%;
          }
        `}
      >
        <PageHeader>
          <PageHeader.BackButton href={`../announcements?status=${query?.status ?? ''}`} />
          <PageHeader.Title>
            <TitleText>{intl.formatMessage({ id: 'chat.announcements.detail.title' }, { uniqueId: id })}</TitleText>
            <CopyButton
              copyableText={id}
              tooltipPlacement="bottom"
              css={`
                margin-right: 8px;
              `}
            />
            <AnimationFadeInOut running={running}>
              {announcement?.status && (
                <AnnouncementStatusLozenge status={announcement.status} tooltipPlacement="bottom" />
              )}
            </AnimationFadeInOut>
          </PageHeader.Title>
          <PageHeader.Actions>
            {useMemo(() => {
              if (isWaitingToResume) {
                return (
                  <StatusText>{intl.formatMessage({ id: 'chat.announcements.detail.waitingToResume' })}</StatusText>
                );
              }
              if (announcement?.status === 'on-hold') {
                return (
                  <StatusText>
                    {intl.formatMessage(
                      { id: 'chat.announcements.detail.doNotDisturbFromTo' },
                      {
                        from: formatCeaseAtResumeAt(announcement?.cease_at, timezone),
                        to: formatCeaseAtResumeAt(announcement?.resume_at, timezone),
                      },
                    )}
                  </StatusText>
                );
              }

              return (
                isPermitted(['application.announcements.all']) && <Actions data-test-id="Actions">{actions}</Actions>
              );
            }, [actions, announcement, intl, isPermitted, isWaitingToResume, timezone])}
          </PageHeader.Actions>
        </PageHeader>
      </ContentContainer>

      <ScrollBar>
        <ContentContainer
          css={`
            padding-top: 32px;
          `}
        >
          <Main>
            <SectionTitle
              css={`
                display: flex;
                flex-direction: row;
                justify-content: space-between;
              `}
            >
              {intl.formatMessage({ id: 'chat.announcements.detail.statistics.title' })}
              <LastUpdatedAt timestamp={statsLoadTimestamp} isTimeAgoHidden={true} />
            </SectionTitle>
            {statsSection}

            <SectionTitle>{intl.formatMessage({ id: 'chat.announcements.detail.info.title' })}</SectionTitle>
            {announcement && <AnnouncementDetailInfo announcement={announcement} />}
          </Main>
        </ContentContainer>
      </ScrollBar>
    </GridLayout>
  );
};

export const AnnouncementDetail: FC<Props> = ({ onAnnouncementUpdated }) => {
  const match = useRouteMatch();
  const { eventId } = useParams<{ eventId: string }>();

  if (!match?.url) {
    return <Redirect to="/" />;
  }
  return (
    <AnnouncementDetailContextProvider id={eventId} onAnnouncementUpdated={onAnnouncementUpdated}>
      <Switch>
        <Route path={`${match.url}/edit`} component={EditAnnouncement} />
        <Route path={match.url} component={AnnouncementDetailIndex} />
        <Redirect to={match.url} />
      </Switch>
    </AnnouncementDetailContextProvider>
  );
};
