import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import styled from 'styled-components';

import { Link, Body, LinkVariant } from 'feather';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { useShowDialog, useAppId } from '@hooks';
import { LinkWithPermissionCheck } from '@ui/components';

const Spacer = styled.div.attrs({ role: 'presentation' })`
  flex: 1;
`;

export const useSuccessDialog = () => {
  const intl = useIntl();
  const appId = useAppId();
  const history = useHistory();

  return useShowDialog({
    dialogTypes: DialogType.Custom,
    dialogProps: {
      title: intl.formatMessage({
        id: 'chat.settings.channels.openChannels.dynamicPartitioningOptions.dialog.success.title',
      }),
      body: ({ close }) => (
        <p css={Body['body-short-01']}>
          {intl.formatMessage(
            { id: 'chat.settings.channels.openChannels.dynamicPartitioningOptions.dialog.success.description' },
            {
              b: (text) => <b css="font-weight: 600;">{text}</b>,
              a: (text) => (
                <LinkWithPermissionCheck
                  variant={LinkVariant.Inline}
                  useReactRouter={true}
                  href={`/${appId}/settings/channels`}
                  permissions={['application.settings.view', 'application.settings.all']}
                  onClick={() => {
                    close();
                  }}
                >
                  {text}
                </LinkWithPermissionCheck>
              ),
            },
          )}
        </p>
      ),
      positiveButtonProps: {
        text: intl.formatMessage({
          id: 'chat.settings.channels.openChannels.dynamicPartitioningOptions.dialog.success.btn.ok',
        }),
      },
      isNegativeButtonHidden: true,
      renderButtonPrefix: history.location.pathname.includes('/open_channels')
        ? undefined
        : ({ close }) => (
            // provide a link to Open channels if the user is not there.
            <>
              <Link
                css={`
                  font-size: 14px;
                  line-height: 20px;
                `}
                onClick={() => {
                  close();
                }}
                useReactRouter={true}
                href={`/${appId}/open_channels`}
              >
                {intl.formatMessage({
                  id:
                    'chat.settings.channels.openChannels.dynamicPartitioningOptions.dialog.success.btn.goToOpenChannels',
                })}
              </Link>
              <Spacer />
            </>
          ),
    },
  });
};
