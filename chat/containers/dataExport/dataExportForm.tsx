import { FC, useMemo, useCallback, useState, ComponentProps } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import styled from 'styled-components';

import {
  useForm,
  useField,
  toast,
  cssVariables,
  Button,
  Dropdown,
  Radio,
  Checkbox,
  DateRangePicker,
  DateRangePickerValue,
} from 'feather';
import moment, { Moment } from 'moment-timezone';

import { SettingsGridGroup, SettingsCardFooter, SettingsGridCard } from '@common/containers/layout';
import { PageContainer, ChipInput, PageHeader } from '@ui/components';

import { useDataExport } from './useDataExport';

const ALERT_MESSAGES_DATE_RANGE_31 = 'Date selection can not exceed 31 days.';
const ALERT_MESSAGES_DATE_RANGE_186 = 'Date selection can not exceed 186 days.';

const DataExportFormContainer = styled(PageContainer)`
  max-width: 1088px;
  padding-bottom: 64px; /* FIXME: We have to fix with same space to the all page */
`;

const DateWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 280px;
  grid-column-gap: 8px;
  ul {
    width: 100%;
  }
  .timezoneDropdown {
    width: 100%;
  }
`;

const RadioItems = styled.ul`
  list-style: none;
`;

const RadioItem = styled.li`
  padding: 4px 0;

  &:first-child {
    padding-top: 0;
  }

  > div {
    justify-content: start;
  }

  label {
    font-weight: 500 !important;
    color: ${cssVariables('neutral-10')};
  }
`;

const OptionsGroup = styled.div`
  & + & {
    border-top: 1px solid ${cssVariables('neutral-3')};
    padding-top: 24px;
    margin-top: 24px;
  }
`;

const OptionalLabel = styled.label`
  font-size: 12px;
  font-weight: 500;
  color: ${cssVariables('neutral-6')};
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const ExportTextarea = styled(ChipInput)`
  min-height: 120px;
  margin-top: 8px;
  color: ${cssVariables('neutral-6')};
  &:focus {
    color: ${cssVariables('neutral-10')};
  }
  &::placeholder,
  &::-webkit-input-placeholder {
    color: ${cssVariables('neutral-6')};
  }
`;

const LabelText = styled.label`
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.43;
  letter-spacing: -0.1px;
  color: ${cssVariables('neutral-10')};
`;

const Neighboring = styled.div`
  display: flex;
  align-items: center;
  margin-top: 24px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.43;
  letter-spacing: -0.1px;
  > div {
    margin: 0 0 0 auto;
  }
  .neighboringDropdown {
    width: 160px;
  }
`;

const NeighboringToggle = styled.div`
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  margin-left: 16px;
  letter-spacing: 0px;
  text-align: left;
  white-space: nowrap;
  text-overflow: ellipsis;
  flex: 1 1 0%;
  overflow: hidden;
`;

type DataType = 'messages' | 'channels' | 'users';
type IncludeType = 'include' | 'exclude';

const formatItems = [
  {
    label: 'JSON',
    value: 'json',
  },
  {
    label: 'CSV',
    value: 'csv',
  },
];

const timezones = moment.tz.names();
const initialTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

type NeighboringItem = {
  label: string;
  value: number;
};

const neighboringItems: NeighboringItem[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => ({
  label: `${number}`,
  value: number,
}));

type FormState = {
  channelURLType: IncludeType;
  senderIDType: IncludeType;
  timezone: string;
  date: DateRangePickerValue;
  dateRange: {
    startDate: Moment;
    endDate: Moment;
  };
  neighboringMessageLimit?: NeighboringItem;
};

export const DataExportForm: FC = () => {
  const intl = useIntl();
  const history = useHistory();

  const {
    isFetching,
    duplicatedFilters,
    actions: { create, setDataType },
  } = useDataExport();

  const [timezoneSearchQuery, setTimezoneSearchQuery] = useState('');
  const handleTimezoneSearchChange = (value: string) => {
    setTimezoneSearchQuery(value);
  };

  // FIXME: duplicatedFilters will work after API Change on chat side
  const [state, setState] = useState<FormState>(
    duplicatedFilters
      ? {
          channelURLType: (duplicatedFilters.exclude_channel_urls?.length ?? 0) > 0 ? 'exclude' : 'include',
          senderIDType: (duplicatedFilters.exclude_sender_ids?.length ?? 0) > 0 ? 'exclude' : 'include',
          timezone: duplicatedFilters.timezone || initialTimezone,
          date: DateRangePickerValue.Custom,
          dateRange: {
            startDate: moment(duplicatedFilters.start_ts),
            endDate: moment(duplicatedFilters.end_ts),
          },
          neighboringMessageLimit: neighboringItems.find(
            (item) => item.value === duplicatedFilters.neighboring_message_limit,
          ),
        }
      : {
          channelURLType: 'include',
          senderIDType: 'include',
          timezone: initialTimezone,
          date: DateRangePickerValue.Last7Days,
          dateRange: {
            startDate: moment().subtract(1, 'weeks').startOf('day'),
            endDate: moment().endOf('day'),
          },
          neighboringMessageLimit: neighboringItems[0],
        },
  );

  const { channelURLType, senderIDType, timezone, date, dateRange, neighboringMessageLimit } = state;

  const setTimezone = (timezone) => {
    setState((prevState) => ({
      ...prevState,
      timezone,
    }));
  };

  const setDate = (date) => {
    setState((prevState) => ({
      ...prevState,
      date,
    }));
  };

  const setDateRange = (dateRange) => {
    setState((prevState) => ({
      ...prevState,
      dateRange,
    }));
  };

  const setChannelURLType = (channelURLType) => {
    setState((prevState) => ({
      ...prevState,
      channelURLType,
    }));
  };

  const setSenderIDType = (senderIDType) => {
    setState((prevState) => ({
      ...prevState,
      senderIDType,
    }));
  };

  const setNeighboringMessageLimit = (neighboringMessageLimit) => {
    setState((prevState) => ({
      ...prevState,
      neighboringMessageLimit,
    }));
  };

  const handleCancelClick = useCallback(() => {
    history.goBack();
  }, [history]);

  const dataExportForm = useForm({
    onSubmit: async (data) => {
      const convertTimezone = (momentObj: Moment) => moment.tz(momentObj.format('YYYY-MM-DD'), 'YYYY-MM-DD', timezone);
      const payload: DataExportPayload = {
        format: data.format,
        timezone,
        start_ts: convertTimezone(dateRange.startDate).startOf('day').valueOf(),
        end_ts: convertTimezone(dateRange.endDate).endOf('day').valueOf(),
      };
      if (data.data_type === 'messages') {
        payload[channelURLType === 'include' ? 'channel_urls' : 'exclude_channel_urls'] = data.channel_urls || [];
        payload[senderIDType === 'include' ? 'sender_ids' : 'exclude_sender_ids'] = data.sender_ids || [];
        payload['channel_custom_types'] = data.channel_custom_types || [];
        if (data.neighboring_message_limit > 0) {
          payload['neighboring_message_limit'] = data.neighboring_message_limit;
        }
        if (data.format === 'json') {
          payload['show_read_receipt'] = data.show_read_receipt;
        }
      }
      if (data.data_type === 'channels') {
        payload[channelURLType === 'include' ? 'channel_urls' : 'exclude_channel_urls'] = data.channel_urls || [];
        payload['channel_custom_types'] = data.channel_custom_types || [];
      }
      if (data.data_type === 'users') {
        payload['user_ids'] = data.user_ids || [];
      }
      await create({
        dataType: data.data_type,
        payload,
        onSuccess: (newItem) => {
          // switch to the tab of the data type of the new item to make it visible on the list
          setDataType(newItem.data_type);
          history.push('../data_exports');
        },
      });
    },
  });

  const formatField = useField<string>('format', dataExportForm, {
    defaultValue: 'json',
    isControlled: true,
  });

  const handleFormatChange = useCallback(
    (format) => () => {
      formatField.updateValue(format);
    },
    [formatField],
  );

  const renderFormatField = useMemo(() => {
    return (
      <SettingsGridCard title={intl.formatMessage({ id: 'chat.dataExport.gridtitle.format' })} titleColumns={4}>
        <RadioItems>
          {formatItems.map(({ label, value }, index) => (
            <RadioItem key={`${value}_${index}`}>
              <Radio
                name={formatField.name}
                checked={formatField.value === value}
                label={label}
                disabled={isFetching}
                onChange={handleFormatChange(value)}
              />
            </RadioItem>
          ))}
        </RadioItems>
      </SettingsGridCard>
    );
  }, [intl, formatField.name, formatField.value, isFetching, handleFormatChange]);

  const dataTypeField = useField<DataType>('data_type', dataExportForm, {
    defaultValue: 'messages',
    isControlled: true,
  });

  const channelURLsField = useField<string>('channel_urls', dataExportForm, { defaultValue: '', isControlled: true });

  const handleChannelURLsChange = useCallback(
    (values) => {
      channelURLsField.updateValue(values);
    },
    [channelURLsField],
  );

  const channelCustomTypeField = useField<string>('channel_custom_types', dataExportForm, {
    defaultValue: '',
    isControlled: true,
  });

  const handleChannelCustomTypeChange = useCallback(
    (values) => {
      channelCustomTypeField.updateValue(values);
    },
    [channelCustomTypeField],
  );

  const senderIDsField = useField<string>('sender_ids', dataExportForm, { defaultValue: '', isControlled: true });

  const handleSenderIDsChange = useCallback(
    (values) => {
      senderIDsField.updateValue(values);
    },
    [senderIDsField],
  );

  const userIDsField = useField<string>('user_ids', dataExportForm, { defaultValue: '', isControlled: true });

  const handleUserIDsChange = useCallback(
    (values) => {
      userIDsField.updateValue(values);
    },
    [userIDsField],
  );

  const dateRangePicker = useMemo(() => {
    const handleDatePickerChange: ComponentProps<typeof DateRangePicker>['onChange'] = (value, newDateRange) => {
      if (newDateRange) {
        if (dataTypeField.value === 'messages') {
          const dateLimit = senderIDsField.value === '' ? 31 : 186;
          if (Math.abs(newDateRange.startDate.diff(newDateRange.endDate, 'days')) > dateLimit) {
            toast.warning({
              message: `In case of the Messages data type, ${
                dateLimit === 186 ? ALERT_MESSAGES_DATE_RANGE_186 : ALERT_MESSAGES_DATE_RANGE_31
              }`,
            });
            return;
          }
        }
        setDate(value);
        setDateRange({ startDate: newDateRange.startDate, endDate: newDateRange.endDate });
      }
    };
    return (
      <SettingsGridCard
        title={intl.formatMessage({ id: 'chat.dataExport.gridtitle.date' })}
        titleColumns={4}
        data-test-id="DateRangeRow"
      >
        <DateWrapper>
          <DateRangePicker
            value={date}
            dateRange={dateRange}
            onChange={handleDatePickerChange}
            maximumNights={186}
            fullWidth={true}
          />
          <Dropdown
            className="timezoneDropdown"
            initialSelectedItem={initialTimezone}
            selectedItem={timezone}
            items={timezones.filter(
              (timezone) => !timezoneSearchQuery || timezone.match(new RegExp(timezoneSearchQuery, 'ig')),
            )}
            size="medium"
            useSearch={true}
            onItemSelected={setTimezone}
            onSearchChange={handleTimezoneSearchChange}
          />
        </DateWrapper>
      </SettingsGridCard>
    );
  }, [intl, date, dateRange, timezone, dataTypeField.value, senderIDsField.value, timezoneSearchQuery]);

  const readReceiptField = useField<boolean>('show_read_receipt', dataExportForm, {
    defaultValue: false,
    isControlled: true,
  });

  const dataTypes: { label: string; value: DataType }[] = [
    {
      label: intl.formatMessage({ id: 'chat.dataExport.dataType.messages' }),
      value: 'messages',
    },
    {
      label: intl.formatMessage({ id: 'chat.dataExport.dataType.channels' }),
      value: 'channels',
    },
    {
      label: intl.formatMessage({ id: 'chat.dataExport.dataType.users' }),
      value: 'users',
    },
  ];

  const urlItems: { label: string; value: IncludeType }[] = [
    {
      label: intl.formatMessage({ id: 'chat.dataExport.form.label.includeChannelURLs' }),
      value: 'include',
    },
    {
      label: intl.formatMessage({ id: 'chat.dataExport.form.label.excludeChannelURLs' }),
      value: 'exclude',
    },
  ];

  const senderItems: { label: string; value: IncludeType }[] = [
    {
      label: intl.formatMessage({ id: 'chat.dataExport.form.label.includeSenderIDs' }),
      value: 'include',
    },
    {
      label: intl.formatMessage({ id: 'chat.dataExport.form.label.excludeSenderIDs' }),
      value: 'exclude',
    },
  ];

  const optionalLabel = useMemo(
    () => <OptionalLabel>{intl.formatMessage({ id: 'chat.dataExport.form.label.optional' })}</OptionalLabel>,
    [intl],
  );

  return (
    <DataExportFormContainer>
      <PageHeader
        css={`
          ${PageHeader.Description} {
            margin-top: 12px;
            line-height: 20px;
            letter-spacing: 0;
            color: inherit;
            font-size: 14px;
            font-weight: 500;
          }

          & + * {
            margin-top: 24px;
          }
        `}
      >
        <PageHeader.BackButton href="../data_exports" />
        <PageHeader.Title>{intl.formatMessage({ id: 'chat.dataExport.form.title' })}</PageHeader.Title>
        <PageHeader.Description>
          {intl.formatMessage({ id: 'chat.dataExport.form.description' })}
        </PageHeader.Description>
      </PageHeader>
      <form onSubmit={dataExportForm.onSubmit}>
        <SettingsGridGroup>
          {dateRangePicker}
          {renderFormatField}
          <SettingsGridCard
            title={intl.formatMessage({ id: 'chat.dataExport.gridtitle.type' })}
            titleColumns={4}
            gridItemConfig={{ subject: { alignSelf: 'start' } }}
          >
            <OptionsGroup>
              <RadioItems>
                {dataTypes.map(({ label, value }) => (
                  <RadioItem key={`dataType_${value}`}>
                    <Radio
                      name={dataTypeField.name}
                      value={value}
                      checked={dataTypeField.value === value}
                      label={label}
                      disabled={isFetching}
                      onChange={dataTypeField.onChange}
                    />
                  </RadioItem>
                ))}
              </RadioItems>
            </OptionsGroup>
            {(dataTypeField.value === 'messages' || dataTypeField.value === 'channels') && (
              <>
                <OptionsGroup>
                  {optionalLabel}
                  <RadioItems>
                    {urlItems.map(({ label, value }) => (
                      <RadioItem key={`channelURLType_${value}`}>
                        <Radio
                          name="channelURLType"
                          checked={channelURLType === value}
                          label={label}
                          disabled={isFetching}
                          onChange={() => setChannelURLType(value)}
                        />
                      </RadioItem>
                    ))}
                    <ExportTextarea
                      placeholder={intl.formatMessage({ id: 'chat.dataExport.form.placeholder.channelURLs' })}
                      onChange={handleChannelURLsChange}
                      disabled={isFetching}
                    />
                  </RadioItems>
                </OptionsGroup>
                <OptionsGroup>
                  <LabelText>{intl.formatMessage({ id: 'chat.dataExport.form.label.channelCustomTypes' })}</LabelText>
                  <ExportTextarea
                    placeholder={intl.formatMessage({ id: 'chat.dataExport.form.placeholder.channelCustomTypes' })}
                    onChange={handleChannelCustomTypeChange}
                    disabled={isFetching}
                  />
                </OptionsGroup>
              </>
            )}
            {dataTypeField.value === 'messages' && (
              <OptionsGroup>
                <RadioItems>
                  {senderItems.map(({ label, value }) => (
                    <RadioItem key={`senderIDType_${value}`}>
                      <Radio
                        name="senderIDType"
                        checked={senderIDType === value}
                        label={label}
                        disabled={isFetching}
                        onChange={() => setSenderIDType(value)}
                      />
                    </RadioItem>
                  ))}
                  <ExportTextarea
                    placeholder={intl.formatMessage({ id: 'chat.dataExport.form.placeholder.senders' })}
                    onChange={handleSenderIDsChange}
                    disabled={isFetching}
                  />
                </RadioItems>
                <Neighboring>
                  {intl.formatMessage({ id: 'chat.dataExport.form.label.neighboring' })}
                  <Dropdown<NeighboringItem>
                    className="neighboringDropdown"
                    selectedItem={neighboringMessageLimit}
                    items={neighboringItems}
                    size="medium"
                    itemToString={(item) => item.label}
                    toggleRenderer={({ selectedItem }) =>
                      selectedItem && (
                        <NeighboringToggle>
                          {`${selectedItem.value} message${selectedItem.value > 1 ? `s` : ''}`}
                        </NeighboringToggle>
                      )
                    }
                    onItemSelected={setNeighboringMessageLimit as (item: NeighboringItem) => void}
                  />
                </Neighboring>
              </OptionsGroup>
            )}
            {dataTypeField.value === 'messages' && formatField.value === 'json' && (
              <OptionsGroup>
                <Checkbox
                  name={readReceiptField.name}
                  checked={readReceiptField.value}
                  onChange={readReceiptField.onChange}
                  label={intl.formatMessage({ id: 'chat.dataExport.form.label.showReadReceipt' })}
                />
              </OptionsGroup>
            )}
            {dataTypeField.value === 'users' && (
              <OptionsGroup>
                {optionalLabel}
                <LabelText>{intl.formatMessage({ id: 'chat.dataExport.form.label.userIDs' })}</LabelText>
                <ExportTextarea
                  placeholder={intl.formatMessage({ id: 'chat.dataExport.form.placeholder.users' })}
                  onChange={handleUserIDsChange}
                  disabled={isFetching}
                />
              </OptionsGroup>
            )}
          </SettingsGridCard>
        </SettingsGridGroup>
        <SettingsCardFooter isVisible={true} theme="transparent">
          <Button type="button" key="cancel" buttonType="tertiary" onClick={handleCancelClick}>
            {intl.formatMessage({ id: 'chat.dataExport.form.button.cancel' })}
          </Button>
          <Button type="submit" key="save" buttonType="primary" isLoading={isFetching} disabled={isFetching}>
            {intl.formatMessage({ id: 'chat.dataExport.form.button.request' })}
          </Button>
        </SettingsCardFooter>
      </form>
    </DataExportFormContainer>
  );
};
