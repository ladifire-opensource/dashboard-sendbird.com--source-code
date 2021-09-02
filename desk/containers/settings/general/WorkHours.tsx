import React, { useEffect, useCallback, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import styled from 'styled-components';

import {
  Dropdown,
  Grid,
  GridItem,
  Toggle,
  Checkbox,
  cssVariables,
  InputTextarea,
  DropdownProps,
  IconButton,
  toast,
} from 'feather';

import { deskActions } from '@actions';
import { SettingsGridCard, SettingsTitle, SettingsDescription } from '@common/containers/layout';
import { Unsaved } from '@hooks';

interface WorkHourOption {
  label: string;
  value: HourValues;
}

interface WorkHourData {
  operationHourEnabled: boolean;
  operationHourType: 'WEEK' | 'DAY';
  operationHourWeek: {
    weekdays: WorkHour;
    weekends: WorkHour;
  };
  operationHourDay: OperationHourDay;
  leaveMessage: string;
}

type Props = {
  project: Project;
  isUpdating: DeskStoreState['isUpdating'];
  setUnsaved: Unsaved['setUnsaved'];
};

const WorkHoursGrid = styled(Grid)<{ isEnabled?: boolean }>`
  margin-top: 12px;
  position: relative;
  display: ${({ isEnabled }) => (isEnabled ? 'grid' : 'none')};
`;

const GridTopRow = styled(GridItem)`
  position: relative;
  margin-bottom: 2px;
  height: 56px;

  &:before {
    content: '';
    display: block;
    position: absolute;
    bottom: 0;
    height: 1px;
    background: ${cssVariables('neutral-3')};
  }
`;

const GridMultipleHourItem = styled(GridItem)<{ isMultipleHours: boolean }>`
  ${({ isMultipleHours }) => isMultipleHours && `margin-top: -8px;`};
`;

const GridToggleItem = styled(GridTopRow)`
  &:before {
    width: calc(100% + 16px);
  }
`;

const GridDropdownItem = styled(GridTopRow)`
  &:before {
    width: 100%;
  }
`;

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
`;

const LeaveMessage = styled.div`
  padding-top: 24px;
  border-top: 1px solid ${cssVariables('neutral-3')};
`;

const getWorkHourData: { (project: Project): WorkHourData } = (project) => ({
  operationHourEnabled: project.operationHourEnabled || false,
  operationHourType: project.operationHourType || 'WEEK',
  operationHourWeek: JSON.parse(project.operationHourWeek),
  operationHourDay: JSON.parse(project.operationHourDay),
  leaveMessage: project.leaveMessage || '',
});

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const weekNames = ['Weekdays', 'Weekends'];

// hours
const getHoursOption: { (): WorkHourOption[] } = () => {
  const hours: WorkHourOption[] = [];
  for (let i = 0; i <= 24; i++) {
    const hour = `${i < 10 ? `0${i}` : i}`;
    const hourByAMPM = String(i < 13 ? i : i - 12).padStart(2, '0');
    const hourValue = `${hour}:00` as HourValues;
    const halfHourValue = `${hour}:30` as HourValues;
    const hourLabel = `${hourByAMPM}:00 ${i < 12 || i > 23 ? 'AM' : 'PM'}`;
    const halfHourLabel = `${hourByAMPM}:30 ${i < 12 || i > 23 ? 'AM' : 'PM'}`;

    hours.push({ value: hourValue, label: hourLabel });
    if (i !== 24) {
      hours.push({ value: halfHourValue, label: halfHourLabel });
    }
  }
  return hours;
};

const defaultHourValue = { from: '09:00', to: '17:00' };
const hours = getHoursOption();
const hourValues = hours.map((hour) => hour.value);
const itemToHour = (item: HourValues) => (hours.find((hour) => hour.value === item) as WorkHourOption).label;

const WorkHourTypeDropdown = (props: DropdownProps<WorkHourData['operationHourType']>) => (
  <Dropdown<WorkHourData['operationHourType']> {...props} />
);

export const WorkHours = React.memo<Props>(({ project, isUpdating, setUnsaved }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const workHoursData = getWorkHourData(project);

  const workHourTypeText = useMemo(
    () => ({
      WEEK: intl.formatMessage({ id: 'desk.settings.general.workHour.dropdown.weekDays' }),
      DAY: intl.formatMessage({ id: 'desk.settings.general.workHour.dropdown.workDays' }),
    }),
    [intl],
  );

  const { register, errors, control, formState, watch, setValue, reset, handleSubmit } = useForm<WorkHourData>({
    mode: 'onChange',
    defaultValues: workHoursData,
  });

  const getDayFieldName = (dayKey: string) => `operationHourDay.${dayKey}.operationTimes`;
  const getWeekFieldName = (weekKey: string) => `operationHourWeek.${weekKey}.operationTimes`;

  const mondayFields = useFieldArray<WorkHourOperationTime>({ control, name: getDayFieldName('monday') });
  const tuesdayFields = useFieldArray<WorkHourOperationTime>({ control, name: getDayFieldName('tuesday') });
  const wednesdayFields = useFieldArray<WorkHourOperationTime>({ control, name: getDayFieldName('wednesday') });
  const thursdayFields = useFieldArray<WorkHourOperationTime>({ control, name: getDayFieldName('thursday') });
  const fridayFields = useFieldArray<WorkHourOperationTime>({ control, name: getDayFieldName('friday') });
  const saturdayFields = useFieldArray<WorkHourOperationTime>({ control, name: getDayFieldName('saturday') });
  const sundayFields = useFieldArray<WorkHourOperationTime>({ control, name: getDayFieldName('sunday') });
  const dayFields = [
    mondayFields,
    tuesdayFields,
    wednesdayFields,
    thursdayFields,
    fridayFields,
    saturdayFields,
    sundayFields,
  ];

  const weekdaysFields = useFieldArray<WorkHourOperationTime>({ control, name: getWeekFieldName('weekdays') });
  const weekendsFields = useFieldArray<WorkHourOperationTime>({ control, name: getWeekFieldName('weekends') });
  const weekFields = [weekdaysFields, weekendsFields];

  const watchedWorkHourEnabled = watch('operationHourEnabled');
  const watchedWorkHourType = watch('operationHourType');
  const watchedWorkHourDay = watch('operationHourDay');
  const watchedWorkHourWeek = watch('operationHourWeek');
  const getCurrentWorkHourDayField = useCallback(
    (dayKey, fieldIndex) =>
      ((watchedWorkHourDay[dayKey] as WorkHour).operationTimes?.[fieldIndex] as WorkHourOperationTime) ||
      defaultHourValue,
    [watchedWorkHourDay],
  );

  const getCurrentWorkHourWeekField = useCallback(
    (weekKey, fieldIndex) =>
      ((watchedWorkHourWeek[weekKey] as WorkHour).operationTimes?.[fieldIndex] as WorkHourOperationTime) ||
      defaultHourValue,
    [watchedWorkHourWeek],
  );

  const errorProcessor = useCallback(
    (key) => {
      return errors[key]
        ? {
            hasError: true,
            message: errors[key].message || '',
          }
        : undefined;
    },
    [errors],
  );

  const isInValidOperationHour = (dayOrWeekData) => {
    return Object.keys(dayOrWeekData).some((key) =>
      dayOrWeekData[key].operationTimes.some(({ from, to }) => from == null || to == null),
    );
  };

  const onSubmit = useCallback(
    (data: WorkHourData) => {
      if (!formState.isDirty) {
        return;
      }

      if (isInValidOperationHour(data.operationHourDay) || isInValidOperationHour(data.operationHourWeek)) {
        toast.error({ message: intl.formatMessage({ id: 'desk.settings.general.workHour.save.error.invalid' }) });
        return;
      }

      dispatch(
        deskActions.updateOperationHoursRequest({
          ...data,
          onSuccess: (project: Project) => {
            const {
              operationHourEnabled,
              operationHourType,
              operationHourWeek,
              operationHourDay,
              leaveMessage,
            } = project;
            toast.success({ message: intl.formatMessage({ id: 'desk.settings.general.workHour.message.update' }) });
            reset({
              operationHourEnabled,
              operationHourType,
              operationHourWeek: JSON.parse(operationHourWeek),
              operationHourDay: JSON.parse(operationHourDay),
              leaveMessage,
            });
          },
        }),
      );
    },
    [dispatch, formState.isDirty, intl, reset],
  );

  const handleAppendDayClick = (name: string | undefined, append: ReturnType<typeof useFieldArray>['append']) => () => {
    if (!name) {
      return;
    }
    append({ name });
  };

  const handleRemoveDayClick = (index: number, remove: ReturnType<typeof useFieldArray>['remove']) => () => {
    remove(index);
  };

  const handleDayFromSelect = (dayKey, fieldIndex) => (from: HourValues) => {
    const { to } = (watchedWorkHourDay[dayKey] as WorkHour).operationTimes[fieldIndex] as WorkHourOperationTime;
    if (from.localeCompare(to) >= 0) {
      setValue(`operationHourDay.${dayKey}.operationTimes[${fieldIndex}].to`, null);
    }
  };

  const handleWeekFromSelect = (weekKey, fieldIndex) => (from: HourValues) => {
    const { to } = (watchedWorkHourWeek[weekKey] as WorkHour).operationTimes[fieldIndex] as WorkHourOperationTime;
    if (from.localeCompare(to) >= 0) {
      setValue(`operationHourWeek.${weekKey}.operationTimes[${fieldIndex}].to`, null);
    }
  };

  const handleFormReset: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e?.preventDefault();
      e?.stopPropagation();
      reset();
    },
    [reset],
  );

  useEffect(() => {
    setUnsaved(formState.isDirty);
  }, [formState.isDirty, setUnsaved]);

  const isHourSetupDisabled = isUpdating || !watchedWorkHourEnabled;

  return (
    <SettingsGridCard
      title={intl.formatMessage({ id: 'desk.settings.general.workHour.title' })}
      description={intl.formatMessage({ id: 'desk.settings.general.workHour.desc' })}
      gap={['0px', '32px']}
      gridItemConfig={{ subject: { alignSelf: 'start' } }}
      showActions={formState.isDirty}
      actions={[
        {
          key: 'work-hours-cancel',
          label: intl.formatMessage({ id: 'desk.settings.general.workHour.button.cancel' }),
          type: 'button',
          buttonType: 'tertiary',
          onClick: handleFormReset,
        },
        {
          key: 'work-hours-save',
          label: intl.formatMessage({ id: 'desk.settings.general.workHour.button.save' }),
          type: 'submit',
          buttonType: 'primary',
          isLoading: isUpdating,
          disabled: isUpdating,
          onClick: handleSubmit(onSubmit),
        },
      ]}
      extra={
        <LeaveMessage>
          <Grid>
            <GridItem colSpan={6}>
              <SettingsTitle>
                {intl.formatMessage({ id: 'desk.settings.general.workHour.autoReply.title' })}
              </SettingsTitle>
              <SettingsDescription>
                {intl.formatMessage({ id: 'desk.settings.general.workHour.autoReply.desc' })}
              </SettingsDescription>
            </GridItem>
            <GridItem colSpan={6}>
              <InputTextarea
                ref={register({
                  required: intl.formatMessage({ id: 'desk.settings.general.workHour.autoReply.error.required' }),
                })}
                name="leaveMessage"
                error={errorProcessor('leaveMessage')}
                disabled={isUpdating}
              />
            </GridItem>
          </Grid>
        </LeaveMessage>
      }
    >
      <WorkHoursGrid gap={['12px', '16px']} isEnabled={true}>
        <GridToggleItem colSpan={3} alignSelf="center">
          <ToggleWrapper>
            <Controller
              control={control}
              name="operationHourEnabled"
              render={({ onChange, onBlur, value, name, ref }) => {
                return (
                  <Toggle
                    ref={ref}
                    name={name}
                    checked={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={isUpdating}
                  />
                );
              }}
            />
          </ToggleWrapper>
        </GridToggleItem>
        <GridDropdownItem colSpan={9}>
          <Controller
            control={control}
            name="operationHourType"
            render={({ onChange, value }) => {
              return (
                <WorkHourTypeDropdown
                  selectedItem={value}
                  onChange={onChange}
                  items={['WEEK', 'DAY']}
                  itemToString={(item) => workHourTypeText[item]}
                  itemToElement={(item) => workHourTypeText[item]}
                  width="100%"
                  disabled={isHourSetupDisabled}
                />
              );
            }}
          />
        </GridDropdownItem>
      </WorkHoursGrid>
      <WorkHoursGrid gap={['12px', '8px']} isEnabled={watchedWorkHourType === 'DAY'}>
        {dayFields.map((dayField, dayIndex) => {
          const { fields, append, remove } = dayField;
          const dayName = dayNames[dayIndex];
          const dayKey = dayName.toLowerCase();
          const isDayEnabled = watchedWorkHourDay[dayKey].enabled;

          return fields.map((field, fieldIndex) => {
            const isMultipleHours = fieldIndex > 0;
            const { from: fieldFrom, to: fieldTo } = getCurrentWorkHourDayField(dayKey, fieldIndex);
            return (
              <>
                <GridItem key={`${field.id}.enabled`} colSpan={3} alignSelf="center">
                  {fieldIndex === 0 && (
                    <Controller
                      control={control}
                      name={`operationHourDay.${dayKey}.enabled`}
                      defaultValue={isDayEnabled}
                      render={({ onChange, value, ref }) => {
                        return (
                          <Checkbox
                            ref={ref}
                            name={`operationHourDay.${dayKey}.enabled`}
                            label={intl.formatMessage({ id: `desk.settings.general.workHour.days.${dayKey}` })}
                            disabled={isHourSetupDisabled}
                            checked={value}
                            onChange={(e) => {
                              onChange(e.target.checked);
                            }}
                          />
                        );
                      }}
                    />
                  )}
                </GridItem>
                <GridMultipleHourItem key={`${field.id}.from`} colSpan={4} isMultipleHours={isMultipleHours}>
                  <Controller
                    control={control}
                    name={`${getDayFieldName(dayKey)}[${fieldIndex}].from`}
                    defaultValue={field.from || defaultHourValue.from}
                    render={({ onChange, value }) => {
                      return (
                        <Dropdown<HourValues>
                          selectedItem={value}
                          onChange={onChange}
                          items={hourValues}
                          itemToString={itemToHour}
                          itemToElement={itemToHour}
                          isItemDisabled={(item) => item === '24:00'}
                          disabled={isHourSetupDisabled || !isDayEnabled}
                          width="100%"
                          onItemSelected={handleDayFromSelect(dayKey, fieldIndex)}
                        />
                      );
                    }}
                  />
                </GridMultipleHourItem>
                <GridMultipleHourItem key={`${field.id}.to`} colSpan={4} isMultipleHours={isMultipleHours}>
                  <Controller
                    control={control}
                    name={`${getDayFieldName(dayKey)}[${fieldIndex}].to`}
                    defaultValue={field.to || defaultHourValue.to}
                    render={({ onChange, value }) => {
                      return (
                        <Dropdown<HourValues>
                          selectedItem={value}
                          onChange={onChange}
                          placeholder={intl.formatMessage({
                            id: 'desk.settings.general.workHour.dropdown.hour.placeholder',
                          })}
                          items={hourValues}
                          itemToString={itemToHour}
                          itemToElement={itemToHour}
                          isItemDisabled={(item) => fieldFrom.localeCompare(item) >= 0}
                          hasError={fieldTo == null || fieldFrom.localeCompare(fieldTo) >= 0}
                          disabled={isHourSetupDisabled || !isDayEnabled}
                          width="100%"
                        />
                      );
                    }}
                  />
                </GridMultipleHourItem>
                <GridMultipleHourItem
                  key={`${field.id}.button`}
                  colSpan={1}
                  alignSelf="center"
                  isMultipleHours={isMultipleHours}
                >
                  {fieldIndex === 0 && fields.length === 1 && isDayEnabled && (
                    <IconButton
                      icon="plus-circle"
                      size="small"
                      buttonType="primary"
                      onClick={handleAppendDayClick(field.id, append)}
                      disabled={isHourSetupDisabled}
                    />
                  )}
                  {fieldIndex > 0 && isDayEnabled && (
                    <IconButton
                      icon="remove"
                      size="small"
                      buttonType="tertiary"
                      onClick={handleRemoveDayClick(fieldIndex, remove)}
                      disabled={isHourSetupDisabled}
                    />
                  )}
                </GridMultipleHourItem>
              </>
            );
          });
        })}
      </WorkHoursGrid>
      <WorkHoursGrid gap={['12px', '8px']} isEnabled={watchedWorkHourType === 'WEEK'}>
        {weekFields.map((weekField, weekIndex) => {
          const { fields } = weekField;
          const weekName = weekNames[weekIndex];
          const weekKey = weekName.toLowerCase();
          const isWeekEnabled = watchedWorkHourWeek[weekKey].enabled;

          return fields.map((field, fieldIndex) => {
            const isMultipleHours = fieldIndex > 0;
            const { from: fieldFrom, to: fieldTo } = getCurrentWorkHourWeekField(weekKey, fieldIndex);

            return (
              <>
                <GridItem key={`${field.id}.enabled`} colSpan={4} alignSelf="center">
                  <Controller
                    control={control}
                    name={`operationHourWeek.${weekKey}.enabled`}
                    defaultValue={isWeekEnabled}
                    render={({ onChange, value, ref }) => {
                      return (
                        <Checkbox
                          ref={ref}
                          name={`operationHourWeek.${weekKey}.enabled`}
                          label={intl.formatMessage({ id: `desk.settings.general.workHour.weeks.${weekKey}` })}
                          disabled={isHourSetupDisabled}
                          checked={value}
                          onChange={(e) => {
                            onChange(e.target.checked);
                          }}
                        />
                      );
                    }}
                  />
                </GridItem>
                <GridMultipleHourItem key={`${field.id}.from`} colSpan={4} isMultipleHours={isMultipleHours}>
                  <Controller
                    control={control}
                    name={`${getWeekFieldName(weekKey)}[${fieldIndex}].from`}
                    defaultValue={field.from || '09:00'}
                    render={({ onChange, value }) => {
                      return (
                        <Dropdown<HourValues>
                          selectedItem={value}
                          onChange={onChange}
                          items={hourValues}
                          itemToString={itemToHour}
                          itemToElement={itemToHour}
                          isItemDisabled={(item) => item === '24:00'}
                          width="100%"
                          disabled={isHourSetupDisabled || !isWeekEnabled}
                          onItemSelected={handleWeekFromSelect(weekKey, fieldIndex)}
                        />
                      );
                    }}
                  />
                </GridMultipleHourItem>
                <GridMultipleHourItem key={`${field.id}.to`} colSpan={4} isMultipleHours={isMultipleHours}>
                  <Controller
                    control={control}
                    name={`${getWeekFieldName(weekKey)}[${fieldIndex}].to`}
                    defaultValue={field.to || defaultHourValue.to}
                    render={({ onChange, value }) => {
                      return (
                        <Dropdown<HourValues>
                          selectedItem={value}
                          onChange={onChange}
                          placeholder={intl.formatMessage({
                            id: 'desk.settings.general.workHour.dropdown.hour.placeholder',
                          })}
                          items={hourValues}
                          itemToString={itemToHour}
                          itemToElement={itemToHour}
                          isItemDisabled={(item) => fieldFrom.localeCompare(item) >= 0}
                          hasError={fieldTo == null || fieldFrom.localeCompare(fieldTo) >= 0}
                          width="100%"
                          disabled={isHourSetupDisabled || !isWeekEnabled}
                        />
                      );
                    }}
                  />
                </GridMultipleHourItem>
              </>
            );
          });
        })}
      </WorkHoursGrid>
    </SettingsGridCard>
  );
});
