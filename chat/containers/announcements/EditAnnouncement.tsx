import { FC, useMemo, useEffect, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import styled from 'styled-components';

import moment from 'moment-timezone';

import { useAppId } from '@hooks';
import { PageContainer, PageHeader } from '@ui/components';
import { PropOf } from '@utils';

import { useAnnouncementDetailContext, useAnnouncementDetailActionsContext } from './AnnouncementDetailContext';
import { AnnouncementForm } from './AnnouncementForm';
import { getAnnouncementProp } from './aliasMappers';
import { useAnnouncementVersion } from './useAnnouncementVersion';

type FormValues = Parameters<PropOf<typeof AnnouncementForm, 'onSubmit'>>[0];

const Container = styled(PageContainer)`
  max-width: 1024px;
  margin-bottom: 56px;
`;

const convertResumeCeaseAtToMoment = (value: string) => {
  return moment.tz(value, 'HHmm', 'UTC');
};

export const EditAnnouncement: FC = () => {
  const intl = useIntl();
  const appId = useAppId();
  const history = useHistory();
  const announcementVersion = useAnnouncementVersion();
  const { id, item, updateStatus } = useAnnouncementDetailContext();
  const { edit, resetUpdateStatus } = useAnnouncementDetailActionsContext();

  useEffect(() => {
    resetUpdateStatus();
  }, [resetUpdateStatus]);

  const getRequestPayload = useCallback(
    (data: FormValues) => {
      const { cease_resume_at } = data;
      const { ceaseAt, resumeAt } = cease_resume_at || { ceaseAt: null, resumeAt: null };
      const scheduledAtTimestamp = data.scheduled_at.valueOf();

      const commonProps = {
        scheduled_at: scheduledAtTimestamp,
        create_channel: data.create_channel,
        enable_push: data.enable_push,
      };

      if (announcementVersion === 'v1.0') {
        return {
          ...commonProps,
          announcement: {
            message_type: 'MESG',
            user_id: data.message.user_id,
            message: data.message.content,
            data: data.message.data,
            custom_type: data.message.custom_type,
          },
          channel_creation_options: data.create_channel_options,
          group: data.announcement_group,
        } as EditableAnnouncementPropsV10;
      }

      const propsFromV15 = {
        create_channel_options: data.create_channel_options,
        message: data.message,
        cease_at: ceaseAt?.tz('UTC').format('HHmm'),
        resume_at: resumeAt?.tz('UTC').format('HHmm'),
        end_at: data.end_at?.valueOf(),
      };

      if (announcementVersion === 'v1.5') {
        return {
          ...commonProps,
          ...propsFromV15,
          custom_type: data.announcement_group,
        } as EditableAnnouncementPropsV15;
      }

      return {
        ...commonProps,
        ...propsFromV15,
        announcement_group: data.announcement_group,
      } as EditableAnnouncementPropsV16;
    },
    [announcementVersion],
  );

  const form = useMemo(() => {
    if (item == null) {
      return null;
    }

    const navigateBack = () => {
      appId && history.push(`/${appId}/announcements/${id}`);
    };

    const requestUpdateAnnouncement = async (payload: Parameters<typeof edit>[0]) => {
      if (updateStatus === 'pending') {
        return;
      }

      const didSuccessToEdit = await edit(payload);
      if (didSuccessToEdit) {
        navigateBack();
      }
    };

    const [ceaseAt, resumeAt, endAt] = (['cease_at', 'resume_at', 'end_at'] as const).map((key) =>
      getAnnouncementProp(item, key, announcementVersion),
    );

    const handleSubmit: PropOf<typeof AnnouncementForm, 'onSubmit'> = (data) => {
      const requestPayload = getRequestPayload(data);
      requestUpdateAnnouncement(requestPayload);
    };

    return (
      <AnnouncementForm
        isEditing={true}
        submitStatus={updateStatus}
        onCancelButtonClick={navigateBack}
        defaultValues={{
          message: getAnnouncementProp(item, 'message', announcementVersion),
          announcement_group: getAnnouncementProp(item, 'announcement_group', announcementVersion),
          create_channel: item.create_channel,
          create_channel_options: getAnnouncementProp(item, 'create_channel_options', announcementVersion),
          enable_push: item.enable_push,
          scheduled_at: moment(item.scheduled_at),
          target_at: getAnnouncementProp(item, 'target_at', announcementVersion),
          target_channel_type: getAnnouncementProp(item, 'target_channel_type', announcementVersion),
          cease_resume_at: {
            ceaseAt: ceaseAt ? convertResumeCeaseAtToMoment(ceaseAt) : null,
            resumeAt: resumeAt ? convertResumeCeaseAtToMoment(resumeAt) : null,
          },
          end_at: endAt ? moment(endAt) : null,
        }}
        onSubmit={handleSubmit}
      />
    );
  }, [announcementVersion, appId, edit, getRequestPayload, history, id, item, updateStatus]);

  return (
    <Container>
      <PageHeader
        css={`
          & + * {
            margin-top: 24px;
          }
        `}
      >
        <PageHeader.BackButton href={`/${appId}/announcements/${id}`} />
        <PageHeader.Title>{intl.formatMessage({ id: 'chat.announcements.editAnnouncement.title' })}</PageHeader.Title>
      </PageHeader>

      {form}
    </Container>
  );
};
