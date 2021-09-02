import { memo, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';

import styled, { css } from 'styled-components';

import { Table, Button, IconButton } from 'feather';

import { deskActions, commonActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout/appSettingsLayout';
import { Card } from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';

const mapStateToProps = (state: RootState) => ({
  webhooks: state.webhooks,
});

const mapDispatchToProps = {
  fetchWebhooksRequest: deskActions.fetchWebhooksRequest,
  showDialogsRequest: commonActions.showDialogsRequest,
};

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const AddWebhookButton = styled(Button)`
  margin-left: auto;
`;

const TableCard = styled(Card)`
  width: 100%;
  flex: 1;
  min-height: 0;
  padding: 24px;
`;

const IconTableButton = styled(IconButton)`
  position: relative;
  z-index: 10;
  margin: -6px 0;
`;
const WebhooksTable = styled(Table)`
  border-right: 0;
  border-left: 0;
  height: 100%;

  td {
    position: relative;
    overflow: visible;
  }
`;

type StoreProps = ReturnType<typeof mapStateToProps>;

type ActionsProps = typeof mapDispatchToProps;

type Props = StoreProps & ActionsProps;

const WebhooksConnectable = memo<Props>(({ webhooks, showDialogsRequest, fetchWebhooksRequest }) => {
  const intl = useIntl();

  const handleAddWebhookClick = () => {
    showDialogsRequest({
      dialogTypes: DialogType.AddWebhook,
    });
  };

  const handleEditClick = (id: number, endpointUrl: string) => () => {
    showDialogsRequest({
      dialogTypes: DialogType.EditWebhook,
      dialogProps: {
        id,
        endpointUrl,
      },
    });
  };

  const handleDeleteClick = (id: number, endpointUrl: string) => () => {
    showDialogsRequest({
      dialogTypes: DialogType.DeleteWebhook,
      dialogProps: {
        id,
        endpointUrl,
      },
    });
  };

  useEffect(() => {
    fetchWebhooksRequest();
  }, [fetchWebhooksRequest]);

  return (
    <AppSettingsContainer isTableView={true} css="padding-bottom: 32px;">
      <AppSettingPageHeader>
        <AppSettingPageHeader.Title>
          {intl.formatMessage({ id: 'desk.settings.webhooks.title' })}
        </AppSettingPageHeader.Title>
        <AppSettingPageHeader.Actions>
          <AddWebhookButton buttonType="primary" size="small" icon="plus" onClick={handleAddWebhookClick}>
            {intl.formatMessage({ id: 'desk.settings.webhooks.button.add' })}
          </AddWebhookButton>
        </AppSettingPageHeader.Actions>
        <AppSettingPageHeader.Description $textOnly={true}>
          {intl.formatMessage(
            { id: 'desk.settings.webhooks.desc' },
            {
              a: (text) => (
                <a href="https://sendbird.com/docs/desk/v1/platform-api/guides/webhooks" target="_blank">
                  {text}
                </a>
              ),
            },
          )}
        </AppSettingPageHeader.Description>
      </AppSettingPageHeader>
      <Container>
        <TableCard>
          <WebhooksTable
            className="webhooks-table"
            rowKey="webhooks-key"
            showScrollbars={true}
            loading={webhooks.isFetching}
            dataSource={webhooks.webhooks}
            columns={[
              {
                title: intl.formatMessage({ id: 'desk.settings.webhooks.table.th.url' }),
                dataIndex: 'endpointUrl',
                flex: 8,
                sorter: true,
              },
              {
                dataIndex: 'id',
                sorter: true,
                render: ({ id, endpointUrl }: Webhook) => (
                  <>
                    <IconTableButton
                      size="small"
                      buttonType="tertiary"
                      icon="edit"
                      onClick={handleEditClick(id, endpointUrl)}
                    />
                    <IconTableButton
                      size="small"
                      buttonType="tertiary"
                      icon="delete"
                      onClick={handleDeleteClick(id, endpointUrl)}
                    />
                  </>
                ),
                styles: css`
                  justify-content: flex-end;
                `,
              },
            ]}
            emptyView={
              <CenteredEmptyState
                icon="no-data"
                title={intl.formatMessage({ id: 'desk.settings.webhooks.table.empty.title' })}
                description={
                  <FormattedMessage id="desk.settings.webhooks.table.empty.desc" values={{ break: <br /> }} />
                }
              />
            }
          />
        </TableCard>
      </Container>
    </AppSettingsContainer>
  );
});

export const Webhooks = connect(mapStateToProps, mapDispatchToProps)(WebhooksConnectable);
