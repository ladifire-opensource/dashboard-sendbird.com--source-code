import { useRef, useState, useEffect, FC } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import styled, { css } from 'styled-components';

import { cssVariables, Button, Dropdown, DateRangePicker, toast, DateRangePickerValue } from 'feather';
import upperFirst from 'lodash/upperFirst';
import { Moment } from 'moment-timezone';

import { chatActions } from '@actions';
import { StatisticsMetrics, StatisticsTimeDimension, StatisticsSegments } from '@constants';
import {
  DialogFormBody,
  DialogFormAction,
  CancelButton,
  ConfirmButton,
  Dialog,
  ListRemoveButton,
  MonthRangePicker,
} from '@ui/components';

import { useAnalyticsIntl } from './useAnalyticsIntl';

const ExportTargetDate = styled.div`
  margin-top: 8px;
  display: flex;
  div[role='combobox'] {
    margin-right: 8px;
  }
`;

const ExportTarget = styled.div`
  position: relative;
  padding: 0 35px 0 0;
  margin-bottom: 30px;

  .aaSegmentDropdown {
    margin-top: 8px;
  }
`;

const ExportTargetRemove = styled.div`
  position: absolute;
  top: 10px;
  right: 0;
`;

const ExportAddAction = styled.div`
  border-top: 1px solid ${cssVariables('neutral-3')};
  margin-top: 20px;
  padding: 20px 0;
`;

const metrics = Object.keys(StatisticsMetrics).concat('channel_member');
const timeDimensions = Object.keys(StatisticsTimeDimension);
const defaultSegment = {
  label: 'None',
  value: '',
};
const segmentItems = {
  [StatisticsMetrics.created_channels]: [
    defaultSegment,
    {
      value: StatisticsSegments.custom_channel_type,
      label: 'Custom channel types',
    },
  ],
  [StatisticsMetrics.messages]: [
    defaultSegment,
    {
      value: StatisticsSegments.custom_message_type,
      label: 'Custom message types',
    },
    {
      value: StatisticsSegments.custom_channel_type,
      label: 'Custom channel types',
    },
    {
      value: `${StatisticsSegments.custom_channel_type},${StatisticsSegments.custom_message_type}`,
      label: 'Both custom message & channel types',
    },
  ],
};

export const getDateValue = (start, end) => {
  const diff = end.diff(start, 'days');
  switch (diff) {
    case 6:
      return DateRangePickerValue.Last7Days;
    case 13:
      return DateRangePickerValue.Last14Days;
    case 29:
      return DateRangePickerValue.Last30Days;
    case 89:
      return DateRangePickerValue.Last90Days;
    default:
      return DateRangePickerValue.Custom;
  }
};

type SelectedTarget = {
  metricType: string;
  date: DateRangePickerValue;
  startDate: Moment;
  endDate: Moment;
  timeDimension?: string;
  segments: {
    label: string;
    value: string;
  };
};

type Props = DefaultDialogProps<AnalyticsExportDialogProps>;

const AnalyticsExportDialog: FC<Props> = ({ isFetching, dialogProps, onClose }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { getMetricMessages } = useAnalyticsIntl();

  const exportAnalyticsRequest = (payload) => dispatch(chatActions.exportAnalyticsRequest(payload));
  const defaultTarget = useRef<SelectedTarget | undefined>(undefined);

  const [selectedTargets, setSelectedTargets] = useState<SelectedTarget[]>([]);

  const { startDate, endDate, metricType } = dialogProps;

  useEffect(() => {
    defaultTarget.current = {
      metricType: '',
      date: getDateValue(startDate, endDate),
      startDate,
      endDate,
      timeDimension: StatisticsTimeDimension.daily,
      segments: defaultSegment,
    };
    setSelectedTargets([
      {
        ...defaultTarget.current,
        metricType: metricType || '',
      },
    ]);
  }, [metricType, startDate, endDate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    let availableToSubmit = true;
    selectedTargets.forEach((target) => {
      if (target.metricType === '') {
        toast.warning({
          message: 'Please select metric.',
        });
        availableToSubmit = false;
        return false;
      }
    });

    availableToSubmit &&
      exportAnalyticsRequest(
        selectedTargets.map((target) => ({
          ...target,
          segments: target.segments.value,
        })),
      );
  };

  const handleTimeDimensionSelected = (index) => (timeDimension) => {
    const newState = [...selectedTargets];
    newState[index] = {
      ...selectedTargets[index],
      timeDimension,
    };
    setSelectedTargets(newState);
  };

  const handleSegmentSelected = (index) => (segments) => {
    const newState = [...selectedTargets];
    newState[index] = {
      ...selectedTargets[index],
      segments,
    };
    setSelectedTargets(newState);
  };

  const handleMetricChange = (index) => (metricType) => {
    const newState = [...selectedTargets];
    newState[index] = {
      ...selectedTargets[index],
      metricType,
    };

    setSelectedTargets(newState);
  };

  const handleDatePickerChange = (index) => (date, dateRange) => {
    const newState = [...selectedTargets];
    newState[index] = {
      ...selectedTargets[index],
      ...dateRange,
      date,
    };
    setSelectedTargets(newState);
  };

  const handleMonthPickerChange = (index) => ({ start, end }) => {
    const newState = [...selectedTargets];
    newState[index] = {
      ...selectedTargets[index],
      startDate: start,
      endDate: end,
    };
    setSelectedTargets(newState);
  };

  const handleAddData = () => {
    if (selectedTargets.length < metrics.length) {
      setSelectedTargets([...selectedTargets, defaultTarget.current!]);
    } else {
      toast.warning({
        message: 'No additional data available.',
      });
    }
  };

  const handleTargetRemove = (index) => () => {
    const newState = [...selectedTargets];
    newState.splice(index, 1);
    setSelectedTargets(newState);
  };

  const renderTargetDate = (target, index) => {
    const dateRangePicker = (
      <DateRangePicker
        value={target.date}
        dateRange={{
          startDate: target.startDate,
          endDate: target.endDate,
        }}
        onChange={handleDatePickerChange(index)}
        minimumNights={7}
        maximumNights={186}
        fullWidth={true}
      />
    );
    if (
      target.metricType === StatisticsMetrics.active_channels ||
      target.metricType === StatisticsMetrics.message_senders
    ) {
      return (
        <ExportTargetDate>
          <Dropdown
            items={timeDimensions}
            selectedItem={target.timeDimension}
            onItemSelected={handleTimeDimensionSelected(index)}
            itemToString={(item) => upperFirst(item)}
            width="120px"
          />
          {target.timeDimension === StatisticsTimeDimension.daily ? (
            dateRangePicker
          ) : (
            <MonthRangePicker
              wrapperStyles={css`
                flex: 1;
                margin-left: 10px;
              `}
              targetStyles={css`
                box-shadow: none;
              `}
              placement="bottom-start"
              start={target.startDate}
              end={target.endDate}
              onChange={handleMonthPickerChange(index)}
              usePortal={false}
            />
          )}
        </ExportTargetDate>
      );
    }
    return <ExportTargetDate>{dateRangePicker}</ExportTargetDate>;
  };

  return (
    <Dialog
      size="small"
      onClose={onClose}
      title={intl.formatMessage({ id: 'chat.analyticsExportDialog.title' })}
      description={
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {intl.formatMessage({ id: 'chat.analyticsExportDialog.description' })}
        </div>
      }
      body={
        <form onSubmit={handleSubmit}>
          <DialogFormBody>
            {selectedTargets.length > 0 &&
              selectedTargets.map((selectedTarget, index) => {
                return (
                  <ExportTarget
                    key={`selectedTarget_${selectedTarget.metricType}_${index}`}
                    data-test-id="ExportTarget"
                  >
                    <Dropdown
                      items={metrics}
                      selectedItem={selectedTarget.metricType}
                      itemToString={(item) => getMetricMessages(item)?.header ?? ''}
                      onItemSelected={handleMetricChange(index)}
                      placeholder={getMetricMessages(selectedTarget.metricType)?.header ?? 'Select data'}
                      width="100%"
                    />
                    {selectedTarget.metricType === StatisticsMetrics.created_channels ||
                      (selectedTarget.metricType === StatisticsMetrics.messages && (
                        <Dropdown
                          items={segmentItems[selectedTarget.metricType]}
                          selectedItem={selectedTarget.segments}
                          onItemSelected={handleSegmentSelected(index)}
                          className="aaSegmentDropdown"
                          itemToString={(item) => item.label}
                          width="100%"
                        />
                      ))}
                    {selectedTarget.metricType && renderTargetDate(selectedTarget, index)}
                    {index > 0 && (
                      <ExportTargetRemove>
                        <ListRemoveButton onClick={handleTargetRemove(index)} />
                      </ExportTargetRemove>
                    )}
                  </ExportTarget>
                );
              })}
            <ExportAddAction>
              <Button type="button" buttonType="tertiary" icon="plus" onClick={handleAddData}>
                Add metric
              </Button>
            </ExportAddAction>
          </DialogFormBody>
          <DialogFormAction>
            <CancelButton type="button" onClick={onClose}>
              Cancel
            </CancelButton>
            <ConfirmButton
              type="submit"
              disabled={isFetching}
              isFetching={isFetching}
              data-test-id="DialogConfirmButton"
            >
              Export
            </ConfirmButton>
          </DialogFormAction>
        </form>
      }
    />
  );
};

export default AnalyticsExportDialog;
