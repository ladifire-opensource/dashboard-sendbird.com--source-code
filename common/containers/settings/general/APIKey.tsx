import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import copy from 'copy-to-clipboard';
import {
  Button,
  cssVariables,
  toast,
  Link,
  InputText,
  ContextualHelp,
  Body,
  TooltipTargetIcon,
  TableProps,
  Table,
  LozengeVariant,
  Lozenge,
  IconButton,
} from 'feather';
import moment from 'moment-timezone';

import { commonActions } from '@actions';
import { getOrganizationAPIKey, renewOrganizationAPIKey } from '@common/api';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { SettingsGridCard } from '@common/containers/layout';
import { FULL_MONTH_DATE_TIME_FORMAT } from '@constants';
import { getErrorMessage } from '@epics';
import { useAuthorization } from '@hooks';

// FIXME: org settings might need content area system like border-bottom
const SectionKey = styled.div`
  border-bottom: 1px solid ${cssVariables('neutral-3')};
  margin-bottom: 24px;
  padding-bottom: 24px;
  display: grid;
  grid-template-columns: 1fr 110px;
  grid-column-gap: 4px;
  align-items: center;
`;

const ServerTable = styled((props: TableProps<Region>) => Table<Region>(props))`
  thead {
    z-index: 0;
  }
`;

const ServerTitle = styled.div`
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  color: ${cssVariables('neutral-10')};
  display: flex;
  align-items: center;
  > div {
    margin-left: 2px;
  }
`;

const SectionServer = styled.div``;

interface Key {
  api_key: string;
  last_updated_dt: string;
}

type Props = {
  organization: Organization;
  showDialogsRequest: typeof commonActions.showDialogsRequest;
};

export const APIKey: React.FC<Props> = ({ organization, showDialogsRequest }) => {
  const intl = useIntl();
  const { isPermitted } = useAuthorization();

  const [key, setKey] = useState<Key>({
    api_key: '',
    last_updated_dt: '',
  });

  useEffect(() => {
    getOrganizationAPIKey({ organization_uid: organization.uid })
      .then((response) => {
        setKey(response.data);
      })
      .catch((error) => {
        toast.error({ message: getErrorMessage(error) });
      });
  }, [organization.uid]);

  const handleClickRenew = () => {
    showDialogsRequest({
      dialogTypes: DialogType.Confirm,
      dialogProps: {
        title: intl.formatMessage({ id: 'common.settings.general.apiKey.dialog.title' }),
        description: intl.formatMessage({ id: 'common.settings.general.apiKey.dialog.desc' }),
        confirmText: intl.formatMessage({ id: 'common.settings.general.apiKey.dialog.ok' }),
        onConfirm: async (setIsPending) => {
          setIsPending(true);
          const response = await renewOrganizationAPIKey({ organization_uid: organization.uid });
          setKey(response.data);
        },
      },
    });
  };

  const handleClickCopy = () => {
    copy(key.api_key);
    toast.success({
      message: intl.formatMessage({ id: 'common.settings.general.apiKey.copied' }),
    });
  };

  return (
    <SettingsGridCard
      title={intl.formatMessage({ id: 'common.settings.general.apiKey.title' })}
      description={intl.formatMessage(
        { id: 'common.settings.general.apiKey.description' },
        {
          a: (text: string) => {
            return (
              <Link
                href="https://sendbird.com/docs/chat/v3/platform-api/guides/organization-api"
                target="_blank"
                iconProps={{
                  icon: 'open-in-new',
                  size: 16,
                }}
                style={{ marginTop: '4px' }}
              >
                {text}
              </Link>
            );
          },
        },
      )}
      titleColumns={4}
      gridItemConfig={{ subject: { alignSelf: 'start' } }}
    >
      <SectionKey>
        <InputText
          type="text"
          label={
            <>
              {intl.formatMessage({ id: 'common.settings.general.apiKey.input.label' })}
              <ContextualHelp
                content={intl.formatMessage({ id: 'common.settings.general.apiKey.input.tooltip' })}
                placement="bottom-start"
                tooltipContentStyle={css`
                  ${Body['body-short-01']};
                  width: 258px;
                `}
              >
                <TooltipTargetIcon icon="info" />
              </ContextualHelp>
            </>
          }
          value={key.api_key}
          helperText={intl.formatMessage(
            { id: 'common.settings.general.apiKey.input.helpText' },
            { time: moment(key.last_updated_dt).format(FULL_MONTH_DATE_TIME_FORMAT) },
          )}
          readOnly={true}
          icons={[
            {
              icon: 'copy',
              title: intl.formatMessage({ id: 'common.settings.general.apiKey.input.icon.copy.title' }),
              onClick: handleClickCopy,
            },
          ]}
        />
        {isPermitted(['organization.general.all']) && (
          <Button buttonType="tertiary" onClick={handleClickRenew} style={{ marginBottom: '2px' }}>
            {intl.formatMessage({ id: 'common.settings.general.apiKey.button.regenerate' })}
          </Button>
        )}
      </SectionKey>
      <SectionServer>
        <ServerTitle>
          {intl.formatMessage({ id: 'common.settings.general.apiKey.server.title' })}
          <ContextualHelp
            content={intl.formatMessage({ id: 'common.settings.general.apiKey.server.tooltip' })}
            placement="bottom-start"
            tooltipContentStyle={css`
              ${Body['body-short-01']};
              width: 258px;
            `}
          >
            <TooltipTargetIcon icon="info" />
          </ContextualHelp>
        </ServerTitle>
        <ServerTable
          dataSource={Object.values(organization.regions)}
          rowStyles={() =>
            css`
              &:hover {
                background: transparent;
              }
            `
          }
          columns={[
            {
              dataIndex: 'name',
              title: intl.formatMessage({ id: 'common.settings.general.apiKey.table.name' }),
              render: ({ name, type }) => {
                return (
                  <>
                    {name}
                    {type === 'DEDICATED' && (
                      <Lozenge variant={LozengeVariant.Light} color="purple" style={{ marginLeft: '8px' }}>
                        {intl.formatMessage({ id: 'common.settings.general.apiKey.table.dedicated' })}
                      </Lozenge>
                    )}
                  </>
                );
              },
            },
            {
              dataIndex: 'oapi_key',
              title: intl.formatMessage({ id: 'common.settings.general.apiKey.table.oapiKey' }),
              render: ({ oapi_key }) => {
                const handleCopyClick = () => {
                  copy(oapi_key);
                  toast.success({
                    message: intl.formatMessage({ id: 'common.settings.general.apiKey.copied' }),
                  });
                };
                return (
                  <>
                    {oapi_key}
                    <IconButton
                      buttonType="tertiary"
                      icon="copy"
                      size="xsmall"
                      onClick={handleCopyClick}
                      style={{ marginLeft: '4px' }}
                    />
                  </>
                );
              },
            },
          ]}
        />
      </SectionServer>
    </SettingsGridCard>
  );
};
