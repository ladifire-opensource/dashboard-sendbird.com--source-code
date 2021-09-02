import { FC, useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import styled from 'styled-components';

import { toast } from 'feather';
import pickBy from 'lodash/pickBy';

import { createAnnouncement } from '@chat/api';
import { ConvertersToLegacyProperties } from '@chat/utils';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { getErrorMessage } from '@epics';
import { useAppId, useShowDialog } from '@hooks';
import { PageContainer, PageHeader } from '@ui/components';
import { PropOf } from '@utils';

import { AnnouncementForm } from './AnnouncementForm';
import { getAnnouncementErrorMessage } from './getAnnouncementErrorMessage';
import { useAnnouncementVersion } from './useAnnouncementVersion';
import { useConfirmScheduleDialog } from './useConfirmScheduleDialog';

type FormValues = Parameters<PropOf<typeof AnnouncementForm, 'onSubmit'>>[0];

/**
 * Clear falsy properties (empty strings, null, undefined, ...).
 * Note that boolean value "false" must persist to prevent it from being overwritten by default value by server.
 */
const pruneProperties = (value: Object) => pickBy(value, (value: any) => typeof value === 'boolean' || !!value);

const Container = styled(PageContainer)`
  max-width: 1024px;
  margin-bottom: 56px;

  ${PageHeader} + * {
    margin-top: 24px;
  }
`;

const useShowErrorDialog = () => {
  const intl = useIntl();
  const showDialog = useShowDialog();
  return useCallback(
    (message: string) =>
      showDialog({
        dialogTypes: DialogType.Custom,
        dialogProps: {
          title: intl.formatMessage({ id: 'chat.announcements.createAnnouncement.errorDialog.title' }),
          description: message,
          size: 'small',
          isNegativeButtonHidden: true,
          positiveButtonProps: {
            text: intl.formatMessage({ id: 'chat.announcements.createAnnouncement.errorDialog.btn.ok' }),
          },
        },
      }),
    [intl, showDialog],
  );
};

export const CreateAnnouncement: FC<{ reloadList: () => void }> = ({ reloadList }) => {
  const intl = useIntl();
  const appId = useAppId();
  const dispatch = useDispatch();
  const history = useHistory();
  const announcementVersion = useAnnouncementVersion();
  const confirmSchedule = useConfirmScheduleDialog();
  const showErrorDialog = useShowErrorDialog();

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'pending' | 'done'>('idle');

  const navigateBackToList = useCallback(() => {
    history.push(`/${appId}/announcements`);
  }, [appId, history]);

  useEffect(() => {
    if (submitStatus === 'done') {
      navigateBackToList();
    }
  }, [dispatch, navigateBackToList, submitStatus]);

  const getRequestPayload = useCallback(
    (data: FormValues) => {
      const { ceaseAt, resumeAt } = data.cease_resume_at ?? { ceaseAt: null, resumeAt: null };
      const targets = data.target_list?.split(',').map((v) => v.trim());
      const prunedCreateChannelOptions = data.create_channel_options && pruneProperties(data.create_channel_options);

      const commonProps = {
        enable_push: data.enable_push,
        create_channel: data.create_channel,
        scheduled_at: data.scheduled_at.valueOf(),
      };

      if (announcementVersion === 'v1.0') {
        return {
          ...commonProps,
          ...pruneProperties({
            announcement: pruneProperties({
              message_type: 'MESG',
              user_id: data.message.user_id,
              message: data.message.content,
              data: data.message.data,
              custom_type: data.message.custom_type,
            }),
            group: data.announcement_group,
            mode: ConvertersToLegacyProperties.targetAt(data.target_at),
            targets,
            target_distinct: ConvertersToLegacyProperties.targetChannelType(data.target_channel_type),
            channel_creation_options: prunedCreateChannelOptions,
          }),
        } as CreateAnnouncementAPIPayloadV10;
      }

      const propsFromV15 = {
        message: pruneProperties(data.message),
        target_at: data.target_at,
        target_list: targets,
        target_channel_type: data.target_channel_type,
        create_channel_options: prunedCreateChannelOptions,
        cease_at: ceaseAt?.tz('UTC').format('HHmm'),
        resume_at: resumeAt?.tz('UTC').format('HHmm'),
        end_at: data.end_at?.valueOf(),
      };

      if (announcementVersion === 'v1.5') {
        return {
          ...commonProps,
          ...pruneProperties({
            ...propsFromV15,
            custom_type: data.announcement_group,
          }),
        } as CreateAnnouncementAPIPayloadV15;
      }

      return {
        ...commonProps,
        ...pruneProperties({
          ...propsFromV15,
          announcement_group: data.announcement_group,
        }),
      } as CreateAnnouncementAPIPayloadV16;
    },
    [announcementVersion],
  );

  const requestCreateAnnouncement = useCallback(
    async (data: FormValues) => {
      if (submitStatus === 'pending') {
        return;
      }

      const payload = getRequestPayload(data);
      setSubmitStatus('pending');
      try {
        await createAnnouncement({ appId, payload });
        setSubmitStatus('done');
        toast.success({ message: intl.formatMessage({ id: 'chat.announcements.createAnnouncement.noti.success' }) });
        reloadList();
      } catch (error) {
        setSubmitStatus('idle');
        const dialogErrorMessage = getAnnouncementErrorMessage(error, intl);
        if (dialogErrorMessage) {
          showErrorDialog(dialogErrorMessage);
          return;
        }
        toast.error({ message: getErrorMessage(error) });
      }
    },
    [appId, getRequestPayload, intl, reloadList, showErrorDialog, submitStatus],
  );

  const handleSubmit: PropOf<typeof AnnouncementForm, 'onSubmit'> = useCallback(
    (data) => {
      const { timezone, cease_resume_at, scheduled_at: scheduledAt, end_at: endAt } = data;
      const { ceaseAt, resumeAt } = cease_resume_at || { ceaseAt: null, resumeAt: null };

      confirmSchedule({
        timezone,
        scheduledAt,
        ceaseAt,
        resumeAt,
        endAt,
        onConfirm: () => {
          if (scheduledAt.isBefore()) {
            setTimeout(() => {
              // run after the confirm dialog is closed.
              showErrorDialog(intl.formatMessage({ id: 'chat.announcements.scheduleErrors.pastScheduledAt' }));
            }, 0);
            return;
          }

          requestCreateAnnouncement(data);
        },
      });
    },
    [confirmSchedule, intl, requestCreateAnnouncement, showErrorDialog],
  );

  return (
    <Container>
      <PageHeader>
        <PageHeader.BackButton href="../announcements" />
        <PageHeader.Title>{intl.formatMessage({ id: 'chat.announcements.createAnnouncement_title' })}</PageHeader.Title>
      </PageHeader>
      <AnnouncementForm onCancelButtonClick={navigateBackToList} submitStatus={submitStatus} onSubmit={handleSubmit} />
    </Container>
  );
};
