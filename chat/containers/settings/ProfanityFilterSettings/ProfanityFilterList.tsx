import { FC, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useRouteMatch, Link } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { Button, Tag, TagVariant, OverflowMenu, cssVariables, Link as FeatherLink } from 'feather';
import numbro from 'numbro';

import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout';
import { EMPTY_TEXT } from '@constants';
import { useSettingsGlobal } from '@core/containers/useSettingsGlobal';
import { ProfanityFilterTypeEnum } from '@interfaces/core/ChannelSettingsEnums';
import { LoadMoreTable } from '@ui/components';
import { fixedEncodeURIComponent } from '@utils';

import {
  useSettingsForCustomChannelTypes,
  useSettingsForCustomChannelTypeActions,
} from './SettingsForCustomChannelTypesContextProvider';

type TableRecord = {
  custom_type?: string;
  profanity_filter: ChannelSettings['profanity_filter'] & { keyword_count: number };
};

const CustomTypeTag = styled(Tag).attrs({ isInteractive: true })`
  cursor: pointer;
`;

const formatCount = (value: number) => numbro(value).format({ thousandSeparated: true });

export const ProfanityFilterList: FC = () => {
  const intl = useIntl();
  const match = useRouteMatch();
  const {
    settings: customChannelTypeSettings,
    hasNext,
    status: fetchSettingsForCustomChannelTypesStatus,
  } = useSettingsForCustomChannelTypes();

  const { loadMore } = useSettingsForCustomChannelTypeActions();

  const {
    state: { settingsGlobal, status: fetchSettingsGlobalStatus },
  } = useSettingsGlobal();

  const dataSource = useMemo(() => {
    return [settingsGlobal].concat(customChannelTypeSettings).map(({ profanity_filter, ...rest }) => ({
      ...rest,
      profanity_filter: {
        ...profanity_filter,
        keyword_count: profanity_filter.keywords.split(/[\n,]/).filter((v) => v).length,
      },
    }));
  }, [customChannelTypeSettings, settingsGlobal]);

  const isLoading =
    fetchSettingsGlobalStatus === 'loading' || (fetchSettingsForCustomChannelTypesStatus === 'loading' && !hasNext);

  const filterMethodLabels: Record<ProfanityFilterTypeEnum, string> = {
    [ProfanityFilterTypeEnum.asterisks]: intl.formatMessage({ id: 'chat.settings.profanityFilter.option.asterisks' }),
    [ProfanityFilterTypeEnum.block]: intl.formatMessage({ id: 'chat.settings.profanityFilter.option.block' }),
    [ProfanityFilterTypeEnum.none]: EMPTY_TEXT,
  };

  const getEditPageURL = ({ custom_type }: TableRecord) => {
    if (custom_type) {
      return `${match?.url}/custom-type/${fixedEncodeURIComponent(custom_type)}`;
    }
    return `${match?.url}/global`;
  };

  return (
    <AppSettingsContainer
      isTableView={true}
      css={css`
        ${AppSettingPageHeader} + * {
          margin-top: 32px;
        }
      `}
    >
      <AppSettingPageHeader>
        <AppSettingPageHeader.Title>
          {intl.formatMessage({ id: 'chat.settings.profanityFilter.title' })}
        </AppSettingPageHeader.Title>
        <AppSettingPageHeader.Actions>
          <Link to={`${match?.url}/create`}>
            <Button buttonType="primary" size="small" icon="plus">
              {intl.formatMessage({ id: 'chat.settings.profanityFilter.btn.add' })}
            </Button>
          </Link>
        </AppSettingPageHeader.Actions>
        <AppSettingPageHeader.Description>
          {intl.formatMessage({ id: 'chat.settings.profanityFilter.desc' })}
        </AppSettingPageHeader.Description>
      </AppSettingPageHeader>
      <LoadMoreTable<TableRecord>
        css={`
          height: calc(100% + 32px);
        `}
        dataSource={dataSource}
        loading={isLoading}
        hasNext={hasNext}
        loadMoreButtonProps={{
          onClick: () => loadMore(),
          isLoading: hasNext && fetchSettingsForCustomChannelTypesStatus === 'loading',
        }}
        rowStyles={() => css`
          a {
            font-weight: inherit;
          }

          a:not(:hover):not(:active) {
            color: inherit;
          }

          &:hover a:not(:hover):not(:active) {
            color: ${cssVariables('purple-7')};
          }
        `}
        rowActions={(record) => [
          <OverflowMenu
            key="menu"
            items={[
              {
                label: intl.formatMessage({ id: 'chat.settings.profanityFilter.form.field.regex.btn.edit' }),
                href: getEditPageURL(record),
                useReactRouterLink: true,
              },
            ]}
            popperProps={{
              positionFixed: true,
              modifiers: {
                preventOverflow: { boundariesElement: 'viewport' },
                flip: { boundariesElement: 'viewport' },
              },
            }}
          />,
        ]}
        columns={[
          {
            key: 'isGlobal',
            title: intl.formatMessage({ id: 'chat.settings.profanityFilter.table.column.isGlobal' }),
            render: (item) => {
              const isGlobal = item['custom_type'] == null;
              return (
                <>
                  <Link
                    tabIndex={-1}
                    to={getEditPageURL(item)}
                    css={`
                      // link that spans over a row
                      position: absolute;
                      left: 0;
                      right: 0;
                      top: 0;
                      bottom: 0;
                      outline: 0;
                    `}
                  />
                  <FeatherLink href={getEditPageURL(item)} useReactRouter={true} css="outline: 0;">
                    {intl.formatMessage({
                      id: isGlobal
                        ? 'chat.settings.profanityFilter.table.column.isGlobal.global'
                        : 'chat.settings.profanityFilter.table.column.isGlobal.customChannelType',
                    })}
                  </FeatherLink>
                  {isGlobal && (
                    <Tag
                      variant={TagVariant.Dark}
                      css={`
                        margin-left: 8px;
                      `}
                    >
                      {intl.formatMessage({
                        id: 'chat.settings.profanityFilter.table.column.isGlobal.global.tag.default',
                      })}
                    </Tag>
                  )}
                </>
              );
            },
            width: 117,
          },
          {
            dataIndex: 'custom_type',
            title: intl.formatMessage({ id: 'chat.settings.profanityFilter.table.column.customChannelType' }),
            render: (record) =>
              record.custom_type ? (
                <CustomTypeTag maxWidth={220} tabIndex={-1}>
                  {record.custom_type}
                </CustomTypeTag>
              ) : (
                EMPTY_TEXT
              ),
          },
          {
            key: 'isFilterOn',
            title: intl.formatMessage({ id: 'chat.settings.profanityFilter.table.column.isFilterOn' }),
            render: ({ profanity_filter: { type } }) =>
              intl.formatMessage({
                id:
                  type === ProfanityFilterTypeEnum.none
                    ? 'chat.settings.profanityFilter.table.column.isFilterOn.off'
                    : 'chat.settings.profanityFilter.table.column.isFilterOn.on',
              }),
            width: 88,
          },
          {
            key: 'filterMethod',
            title: intl.formatMessage({ id: 'chat.settings.profanityFilter.table.column.filterMethod' }),
            render: (item) => filterMethodLabels[item.profanity_filter.type],
            width: 192,
          },
          {
            key: 'explicitWordCount',
            title: intl.formatMessage({ id: 'chat.settings.profanityFilter.table.column.explicitWordCount' }),
            render: (item) => formatCount(item.profanity_filter.keyword_count),
            width: 132,
          },
          {
            key: 'regexCount',
            title: intl.formatMessage({ id: 'chat.settings.profanityFilter.table.column.regexCount' }),
            render: (item) => formatCount(item.profanity_filter.regex_filters.length),
            width: 177,
          },
        ]}
      />
    </AppSettingsContainer>
  );
};
