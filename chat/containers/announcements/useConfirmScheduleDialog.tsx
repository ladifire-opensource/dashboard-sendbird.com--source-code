import { useCallback } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Body } from 'feather';
import { Moment } from 'moment-timezone';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { DATE_WITH_SECONDS_FORMAT, TIMEZONE_OPTIONS } from '@constants';
import { useShowDialog } from '@hooks';

type Options = {
  timezone: string;
  scheduledAt: Moment;
  ceaseAt: Moment | null;
  resumeAt: Moment | null;
  endAt: Moment | null;
  onConfirm: () => void;
};

const ConfirmDialogInfoList = styled.dl`
  display: grid;
  grid-template-columns: 92px 1fr;
  grid-gap: 8px 16px;
  border-radius: 4px;
  background-color: ${cssVariables('neutral-1')};
  margin-top: 16px;
  padding: 16px;

  ${Body['body-short-01']};
  color: ${cssVariables('neutral-10')};
`;

const ConfirmDialogInfoTitle = styled.dt`
  font-weight: 500;
`;

const ConfirmDialogInfoContent = styled.dd``;

const getTimezoneLabel = (timezone: string) => TIMEZONE_OPTIONS.find((item) => item.value === timezone)?.label;

export const useConfirmScheduleDialog = () => {
  const intl = useIntl();
  const showDialog = useShowDialog();

  return useCallback(
    ({ timezone, scheduledAt, ceaseAt, resumeAt, endAt, onConfirm }: Options) =>
      showDialog({
        dialogTypes: DialogType.Custom,
        dialogProps: {
          size: 'small',
          title: intl.formatMessage({ id: 'chat.announcements.createAnnouncement.confirmDialog.title' }),
          description: intl.formatMessage({
            id: 'chat.announcements.createAnnouncement.confirmDialog.description',
          }),
          body: (
            <ConfirmDialogInfoList>
              <ConfirmDialogInfoTitle>
                {intl.formatMessage({
                  id: 'chat.announcements.createAnnouncement.confirmDialog.infoTitle.timezone',
                })}
              </ConfirmDialogInfoTitle>
              <ConfirmDialogInfoContent>{getTimezoneLabel(timezone)}</ConfirmDialogInfoContent>
              <ConfirmDialogInfoTitle>
                {intl.formatMessage({
                  id: 'chat.announcements.createAnnouncement.confirmDialog.infoTitle.scheduledAt',
                })}
              </ConfirmDialogInfoTitle>
              <ConfirmDialogInfoContent>
                {scheduledAt.tz(timezone).format(DATE_WITH_SECONDS_FORMAT)}
              </ConfirmDialogInfoContent>
              {ceaseAt && resumeAt && (
                <>
                  <ConfirmDialogInfoTitle>
                    {intl.formatMessage({
                      id: 'chat.announcements.createAnnouncement.confirmDialog.infoTitle.ceaseAtResumeAt',
                    })}
                  </ConfirmDialogInfoTitle>
                  <ConfirmDialogInfoContent>
                    {ceaseAt.tz(timezone).format('HH:mm')} - {resumeAt.tz(timezone).format('HH:mm')}
                  </ConfirmDialogInfoContent>
                </>
              )}
              {endAt && (
                <>
                  <ConfirmDialogInfoTitle>
                    {intl.formatMessage({
                      id: 'chat.announcements.createAnnouncement.confirmDialog.infoTitle.endAt',
                    })}
                  </ConfirmDialogInfoTitle>
                  <ConfirmDialogInfoContent>
                    {endAt.tz(timezone).format(DATE_WITH_SECONDS_FORMAT)}
                  </ConfirmDialogInfoContent>
                </>
              )}
            </ConfirmDialogInfoList>
          ),
          positiveButtonProps: {
            text: intl.formatMessage({ id: 'chat.announcements.createAnnouncement.confirmDialog.btn.create' }),
            onClick: onConfirm,
          },
          negativeButtonProps: {
            text: intl.formatMessage({ id: 'chat.announcements.createAnnouncement.confirmDialog.btn.cancel' }),
          },
        },
      }),
    [intl, showDialog],
  );
};
