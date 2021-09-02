import { useMemo, ComponentProps, useEffect, useRef, FC } from 'react';
import { Controller, useForm, FieldError, UseFormOptions } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { Prompt } from 'react-router-dom';

import styled from 'styled-components';

import { InputText, InputTextarea, cssVariables, Toggle, Button, Subtitles, Checkbox } from 'feather';
import moment, { Moment } from 'moment-timezone';

import { SettingsGridGroup, SettingsGridCard, SettingsCardFooter } from '@common/containers/layout';
import { useFormErrorFromFieldError } from '@desk/containers/settings/TicketTags/useFormErrorFromFieldError';
import { useLatestValue } from '@hooks';
import DateTimePicker, { DateTimePickerRef } from '@ui/components/dateTimePicker';

import { AnnouncementGroupSearchDropdown } from './AnnouncementGroupSearchDropdown';
import { useAnnouncementTimezone } from './AnnouncementTimezoneContextProvider';
import { ChannelDistinctRadioGroup } from './ChannelDistinctRadioGroup';
import { DoNotDisturbTimePicker } from './DoNotDisturbTimePicker';
import { EndAtDateTimePicker } from './EndAtDateTimePicker';
import { MessageTypeRadioOptions } from './MessageTypeRadioOptions';
import { TargetAtDropdown } from './TargetAtDropdown';
import { TargetChannelTypeDropdown } from './TargetChannelTypeDropdown';
import { TargetListTextarea, getTargetCount, MAX_TARGET_COUNT } from './TargetListTextarea';
import { TimezoneDropdown } from './TimezoneDropdown';
import { useAnnouncementVersion } from './useAnnouncementVersion';

/** Type definitions */

// Type aliases to shorten code
type TargetAt = AnnouncementV16['target_at'];

/**
 * Type used in useForm from react-hook-form.
 * The argument passed to handleSumit function, defaultValues, and errors object will depend on this type.
 */
export type AnnouncementFormValues = {
  message: {
    // BRDM will be deprecated but must be handled same as ADMM. ADMM is more prefered value.
    type: 'MESG' | 'ADMM' | 'BRDM';
    user_id: string;
    content: string;
    data: string;
    custom_type: string;
  };
  create_channel: boolean;
  create_channel_options: {
    name: string;
    cover_url: string;
    custom_type: string;
    data: string;
    distinct: boolean;
  };
  announcement_group: string;
  enable_push: boolean;
  target_at: TargetAt;
  target_list: string | undefined;
  target_channel_type: CreateAnnouncementAPIPayloadV16['target_channel_type'];
  timezone: string;
  scheduled_at: Moment;
  cease_resume_at: { ceaseAt: Moment | null; resumeAt: Moment | null } | null;
  end_at: Moment | null;
};

type IndestructurableProperties = 'end_at' | 'cease_resume_at';

type Props = {
  onCancelButtonClick: () => void;
  onSubmit: (data: AnnouncementFormValues) => void;
  defaultValues?: UseFormOptions<Omit<AnnouncementFormValues, IndestructurableProperties>>['defaultValues'] &
    Pick<AnnouncementFormValues, IndestructurableProperties>;
  isEditing?: boolean;
  submitStatus: 'idle' | 'pending' | 'done';
};

/** Consts, styled components, and functions */

const GroupTitle = styled.h4`
  ${Subtitles['subtitle-02']};
  color: ${cssVariables('neutral-7')};
  margin-bottom: 12px;

  ${SettingsGridGroup} + & {
    margin-top: 32px;
  }
`;

const GridCardTitleDimmed = styled.span`
  color: ${cssVariables('neutral-6')};
  font-weight: 400;
  vertical-align: baseline;
  margin-left: 4px;
`;

const InputLabelDimmed = styled.span`
  color: ${cssVariables('neutral-6')};
  margin-left: 5px;
`;

const CreateChannelOptions = styled.div`
  margin-top: 16px;
  border-radius: 4px;
  background: ${cssVariables('neutral-1')};
  padding: 24px;

  h5 {
    margin-bottom: 24px;
    ${Subtitles['subtitle-02']};
    color: ${cssVariables('neutral-10')};
  }
`;

const OptionFieldsContainer = styled.div`
  margin-top: 16px;
  padding-top: 22px;
  border-top: 1px solid ${cssVariables('neutral-3')};
`;

const ErrorMessage = styled.span`
  font-size: 12px;
  line-height: 16px;
  color: ${cssVariables('red-5')};
  margin-top: 4px;
`;

/**
 * This function converts an error object from react-hook-form to an object
 * that can passed as `error` prop of Feather's <Input* /> components.
 *
 * ### What is `previousErrorMessage` for?
 * When an error is removed from <Input*> element, there's a bug that changes the error message just before
 * the animation starts to "This field is required." To workaround this, we have to store the error message and
 * pass it at the moment of hiding the error.
 */
const createInputErrorObject = (
  reactHookFormError: FieldError | undefined,
  previousErrorMessage?: string,
): ComponentProps<typeof InputText>['error'] => {
  return {
    hasError: !!reactHookFormError,
    message: (reactHookFormError?.message as string) ?? previousErrorMessage ?? '',
  };
};

// Note that we have to specify all boolean default values. If they are undefined, they might be removed
// from the request payload. See onSubmit function in AnnouncementForm and pruneProperties function for more context.
const createAnnouncementFormDefaultValues: Props['defaultValues'] = {
  message: {
    type: 'MESG',
  },
  create_channel: false,
  create_channel_options: {
    distinct: true,
  },
  enable_push: true,
  scheduled_at: moment().second(0).millisecond(0),
  target_at: 'sender_all_channels',
  target_channel_type: 'distinct',
  announcement_group: '',
  cease_resume_at: { ceaseAt: null, resumeAt: null },
  end_at: null,
} as const;

/** Component */

export const AnnouncementForm: FC<Props> = ({
  onCancelButtonClick,
  onSubmit: onSubmitProp,
  defaultValues = createAnnouncementFormDefaultValues,
  isEditing = false,
  submitStatus,
}) => {
  const intl = useIntl();
  const announcementVersion = useAnnouncementVersion();
  const defaultTimezone = useAnnouncementTimezone();

  const ceaseResumeAtRef = useRef<{ focus: () => void }>(null);
  const scheduledAtRef = useRef<DateTimePickerRef>(null);
  const endAtRef = useRef<{ focus: () => void }>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    errors,
    setValue,
    trigger,
    formState,
  } = useForm<AnnouncementFormValues>({ defaultValues: { ...defaultValues, timezone: defaultTimezone } });

  // Add watchers to observe some form values and update the UI as they change.
  const { type: messageType } = watch('message');
  const targetAt = watch('target_at');
  const createChannel = watch('create_channel');
  const scheduledAt = watch('scheduled_at');
  const timezone = watch('timezone');

  const latestScheduledAt = useLatestValue(scheduledAt);

  const isTargetsFieldVisible = targetAt.startsWith('target');

  const isTargetingUsers = targetAt.startsWith('target_users');

  const targetListError = useFormErrorFromFieldError(errors.target_list);

  useEffect(() => {
    if (messageType === 'ADMM') {
      // If message.type is ADMM, target_channels is the only valid value for target_at.
      setValue('target_at', 'target_channels');
    }
  }, [messageType, setValue]);

  const onSubmit = async (data: AnnouncementFormValues) => {
    const isScheduledAtValid = await trigger('scheduled_at');
    if (!isScheduledAtValid) {
      return;
    }
    onSubmitProp(data);
  };

  const messageTypeFields = useMemo(() => {
    const senderField = (
      <SettingsGridCard title={intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields_lbl.senderId' })}>
        <InputText
          name="message.user_id"
          data-test-id="SenderIdField"
          ref={register({
            required: intl.formatMessage({
              id: 'chat.announcements.createAnnouncement.fields_error.senderIdRequired',
            }),
          })}
          placeholder={intl.formatMessage({
            id: 'chat.announcements.createAnnouncement.fields_lbl.senderIdPlaceholder',
          })}
          error={createInputErrorObject(
            errors.message?.user_id,
            intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields_error.senderIdRequired' }),
          )}
        />
      </SettingsGridCard>
    );

    if (announcementVersion === 'v1.0') {
      return senderField;
    }

    return (
      <>
        <SettingsGridCard title={intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields_lbl.type' })}>
          <Controller
            control={control}
            name="message.type"
            render={({ onChange, value }) => {
              return (
                <MessageTypeRadioOptions
                  value={value}
                  onChange={onChange}
                  disabled={isEditing && messageType === 'MESG' && targetAt !== 'target_channels'} // Changing message type to BRDM is forbidden unless target_at is `target_channels`.
                />
              );
            }}
          />
        </SettingsGridCard>
        {messageType === 'MESG' && senderField}
      </>
    );
  }, [announcementVersion, control, errors.message, intl, isEditing, messageType, register, targetAt]);

  const targetListTextareaPlaceholder = intl.formatMessage({
    id:
      targetAt === 'target_channels'
        ? 'chat.announcements.createAnnouncement.fields.targets.placeholder_lbl.channelUrls'
        : 'chat.announcements.createAnnouncement.fields.targets.placeholder_lbl.userIds',
  });

  const createChannelOptionsFields = useMemo(() => {
    if (!createChannel) {
      // these fields are only visible when create_channel is true.
      return null;
    }

    return (
      <CreateChannelOptions>
        <h5>{intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields.createChannelOptions.title' })}</h5>
        <Controller
          control={control}
          name="create_channel_options.distinct"
          render={({ onChange, value, name }) => {
            return (
              <ChannelDistinctRadioGroup
                name={name}
                value={value}
                onChange={onChange}
                css={`
                  margin-bottom: 30px;
                `}
              />
            );
          }}
        />
        <InputText
          type="text"
          name="create_channel_options.name"
          ref={register}
          label={
            <>
              {intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields.createChannelOptions.name' })}{' '}
              <InputLabelDimmed>
                {intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields.optionalFieldLabelDecorator' })}
              </InputLabelDimmed>
            </>
          }
          placeholder={intl.formatMessage({
            id: 'chat.announcements.createAnnouncement.fields.createChannelOptions.name.placeholder',
          })}
          data-test-id="CreateChannelOptionsNameField"
        />
        <InputText
          type="text"
          name="create_channel_options.cover_url"
          ref={register}
          label={
            <>
              {intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields.createChannelOptions.coverUrl' })}{' '}
              <InputLabelDimmed>
                {intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields.optionalFieldLabelDecorator' })}
              </InputLabelDimmed>
            </>
          }
          placeholder={intl.formatMessage({
            id: 'chat.announcements.createAnnouncement.fields.createChannelOptions.coverUrl.placeholder',
          })}
        />
        <InputText
          type="text"
          name="create_channel_options.custom_type"
          ref={register}
          label={
            <>
              {intl.formatMessage({
                id: 'chat.announcements.createAnnouncement.fields.createChannelOptions.customType',
              })}{' '}
              <InputLabelDimmed>
                {intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields.optionalFieldLabelDecorator' })}
              </InputLabelDimmed>
            </>
          }
          placeholder={intl.formatMessage({
            id: 'chat.announcements.createAnnouncement.fields.createChannelOptions.customType.placeholder',
          })}
        />
        <InputText
          type="text"
          name="create_channel_options.data"
          ref={register}
          label={
            <>
              {intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields.createChannelOptions.data' })}{' '}
              <InputLabelDimmed>
                {intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields.optionalFieldLabelDecorator' })}
              </InputLabelDimmed>
            </>
          }
          placeholder={intl.formatMessage({
            id: 'chat.announcements.createAnnouncement.fields.createChannelOptions.data.placeholder',
          })}
        />
      </CreateChannelOptions>
    );
  }, [control, createChannel, intl, register]);

  const targetOptionsFields = useMemo(() => {
    const targetSpecifyingFields = (
      <OptionFieldsContainer>
        {!isEditing && (
          <TargetListTextarea
            label={intl.formatMessage({
              id: 'chat.announcements.createAnnouncement.fields_lbl.targets',
            })}
            name="target_list"
            ref={register({
              required: intl.formatMessage({
                id: 'chat.announcements.createAnnouncement.fields.targets.error.required',
              }),
              validate: {
                maxTargetCount: (value) =>
                  getTargetCount(value) <= MAX_TARGET_COUNT ||
                  intl.formatMessage({
                    id: 'chat.announcements.createAnnouncement.fields.targets.error.tooManyTargets',
                  }),
              },
            })}
            error={targetListError}
            placeholder={targetListTextareaPlaceholder}
          />
        )}

        {isTargetingUsers && (
          <>
            {!isEditing && (
              <Controller
                control={control}
                name="target_channel_type"
                render={({ onChange, value }) => {
                  return (
                    <TargetChannelTypeDropdown
                      label={intl.formatMessage({
                        id: 'chat.announcements.createAnnouncement.fields_lbl.targetChannelType',
                      })}
                      width="100%"
                      selectedItem={value}
                      onChange={onChange}
                      css="margin-bottom: 24px;"
                    />
                  );
                }}
              />
            )}
            <Checkbox
              ref={register}
              name="create_channel"
              label={intl.formatMessage({
                id: 'chat.announcements.createAnnouncement.fields.createChannel',
              })}
              css="margin-top: 0;"
            />
            {createChannelOptionsFields}
          </>
        )}
      </OptionFieldsContainer>
    );

    return (
      <>
        <GroupTitle>
          {intl.formatMessage({ id: 'chat.announcements.createAnnouncement.sectionTitle.targetOptions' })}
        </GroupTitle>
        <SettingsGridGroup data-test-id="TargetAtRow">
          <SettingsGridCard
            title={intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields_lbl.targetAt' })}
            gridItemConfig={isTargetsFieldVisible ? { subject: { alignSelf: 'start' } } : undefined}
          >
            <Controller
              control={control}
              name="target_at"
              render={({ onChange, value }) => {
                return (
                  <TargetAtDropdown
                    selectedItem={value}
                    onChange={onChange}
                    readOnly={isEditing || messageType === 'BRDM' || messageType === 'ADMM'}
                    width="100%"
                  />
                );
              }}
            />

            {isTargetsFieldVisible && targetSpecifyingFields}
          </SettingsGridCard>
        </SettingsGridGroup>
      </>
    );
  }, [
    intl,
    register,
    targetListError,
    targetListTextareaPlaceholder,
    isTargetingUsers,
    control,
    createChannelOptionsFields,
    isTargetsFieldVisible,
    isEditing,
    messageType,
  ]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Prompt
        when={formState.isDirty && submitStatus !== 'done'}
        message={intl.formatMessage({ id: 'common.dialog.unsaved.desc' })}
      />
      <GroupTitle>
        {intl.formatMessage({ id: 'chat.announcements.createAnnouncement.sectionTitle.messageSettings' })}
      </GroupTitle>
      <SettingsGridGroup>
        {messageTypeFields}
        <SettingsGridCard
          title={intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields_lbl.message' })}
          gridItemConfig={{ subject: { alignSelf: 'start' } }}
        >
          <InputTextarea
            name="message.content"
            data-test-id="MessageField"
            placeholder={intl.formatMessage({
              id: 'chat.announcements.createAnnouncement.fields_lbl.messagePlaceholder',
            })}
            ref={register({
              required: intl.formatMessage({
                id: 'chat.announcements.createAnnouncement.fields_error.messageRequired',
              }),
            })}
            error={createInputErrorObject(
              errors.message?.content,
              intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields_error.messageRequired' }),
            )}
          />
        </SettingsGridCard>

        <SettingsGridCard
          title={
            <>
              {intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields_lbl.messageData' })}{' '}
              <GridCardTitleDimmed>
                {intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields.optionalFieldLabelDecorator' })}
              </GridCardTitleDimmed>
            </>
          }
          description={intl.formatMessage({
            id: 'chat.announcements.createAnnouncement.fields_lbl.messageDataDescription',
          })}
        >
          <InputTextarea
            name="message.data"
            ref={register}
            aria-label={intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields_lbl.messageData' })}
            placeholder={intl.formatMessage({
              id: 'chat.announcements.createAnnouncement.fields_lbl.messageDataPlaceholder',
            })}
          />
        </SettingsGridCard>

        <SettingsGridCard
          title={
            <>
              {intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields_lbl.messageCustomType' })}{' '}
              <GridCardTitleDimmed>
                {intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields.optionalFieldLabelDecorator' })}
              </GridCardTitleDimmed>
            </>
          }
          description={intl.formatMessage({
            id: 'chat.announcements.createAnnouncement.fields_lbl.messageCustomTypeDescription',
          })}
        >
          <InputText
            type="text"
            name="message.custom_type"
            ref={register}
            aria-label={intl.formatMessage({
              id: 'chat.announcements.createAnnouncement.fields_lbl.messageCustomType',
            })}
            placeholder={intl.formatMessage({
              id: 'chat.announcements.createAnnouncement.fields_lbl.messageCustomTypePlaceholder',
            })}
          />
        </SettingsGridCard>

        <SettingsGridCard
          title={
            announcementVersion === 'v1.5' ? (
              'Custom type'
            ) : (
              <>
                {intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields_lbl.announcementGroup' })}{' '}
                <GridCardTitleDimmed>
                  {intl.formatMessage({
                    id: 'chat.announcements.createAnnouncement.fields.optionalFieldLabelDecorator',
                  })}
                </GridCardTitleDimmed>
              </>
            )
          }
          description={intl.formatMessage({
            id: 'chat.announcements.createAnnouncement.fields_lbl.announcementGroupDescription',
          })}
          data-test-id="AnnouncementGroupRow"
        >
          <Controller
            control={control}
            name="announcement_group"
            render={({ onChange }) => {
              return (
                <AnnouncementGroupSearchDropdown
                  onChange={onChange}
                  initialSelectedItem={defaultValues.announcement_group}
                  placeholder={
                    announcementVersion === 'v1.5'
                      ? 'Select or enter custom type'
                      : intl.formatMessage({
                          id: 'chat.announcements.createAnnouncement.fields_lbl.announcementGroupPlaceholder',
                        })
                  }
                />
              );
            }}
          />
        </SettingsGridCard>
      </SettingsGridGroup>

      {targetOptionsFields}

      <GroupTitle>
        {intl.formatMessage({ id: 'chat.announcements.createAnnouncement.sectionTitle.scheduleSettings' })}
      </GroupTitle>
      <SettingsGridGroup>
        <SettingsGridCard
          title={intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields_lbl.timezone' })}
          data-test-id="TimezoneRow"
        >
          <Controller
            control={control}
            name="timezone"
            render={({ onChange }) => {
              return (
                <TimezoneDropdown
                  onChange={onChange}
                  initialSelectedItem={defaultTimezone}
                  width="100%"
                  listWidth="100%"
                />
              );
            }}
          />
        </SettingsGridCard>
        <SettingsGridCard
          title={intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields_lbl.scheduleAt' })}
          data-test-id="ScheduledAtRow"
        >
          <Controller
            control={control}
            name="scheduled_at"
            rules={{
              validate: (value: Moment) => {
                return (
                  value.isSameOrAfter() ||
                  intl.formatMessage({
                    id: 'chat.announcements.createAnnouncement.fields_lbl.scheduleAt.error.pastSchedule',
                  })
                );
              },
            }}
            onFocus={() => {
              scheduledAtRef.current?.focus();
            }}
            render={({ onChange, value }) => {
              return (
                <DateTimePicker
                  ref={scheduledAtRef}
                  dateTime={value}
                  blockPastTime={false}
                  onChange={onChange}
                  formatDate={(date) => date.format('MMMM D, YYYY')} // Use a full textual representation of a month
                  timezone={timezone}
                  hasError={!!errors.scheduled_at}
                />
              );
            }}
          />
          {errors.scheduled_at && (
            <ErrorMessage>{((errors.scheduled_at as unknown) as FieldError).message}</ErrorMessage>
          )}
        </SettingsGridCard>

        {announcementVersion !== 'v1.0' && (
          <>
            <SettingsGridCard
              title={intl.formatMessage({
                id: 'chat.announcements.createAnnouncement.fields_lbl.ceaseAtResumeAt',
              })}
              description={intl.formatMessage({
                id: 'chat.announcements.createAnnouncement.fields_lbl.ceaseAtResumeAtDescription',
              })}
            >
              <Controller
                control={control}
                name="cease_resume_at"
                rules={{
                  validate: {
                    bothCeaseAtAndResumeAtSpecified: ({
                      ceaseAt,
                      resumeAt,
                    }: {
                      ceaseAt: Moment | null;
                      resumeAt: Moment | null;
                    }) => {
                      const isValid = !!ceaseAt === !!resumeAt;
                      return (
                        isValid ||
                        intl.formatMessage({
                          id: 'chat.announcements.createAnnouncement.fields_error.bothCeaseAtResumeAt',
                        })
                      );
                    },
                  },
                }}
                onFocus={() => {
                  ceaseResumeAtRef.current?.focus();
                }}
                render={({ onChange }) => {
                  return (
                    <DoNotDisturbTimePicker
                      ref={ceaseResumeAtRef}
                      onChange={({ ceaseAt, resumeAt }) => onChange({ ceaseAt, resumeAt })}
                      timezone={timezone}
                      defaultValue={defaultValues.cease_resume_at ?? undefined}
                      error={(errors.cease_resume_at as FieldError | undefined)?.message ?? null}
                    />
                  );
                }}
              />
            </SettingsGridCard>

            <SettingsGridCard
              title={intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields_lbl.endAt' })}
              description={intl.formatMessage({
                id: 'chat.announcements.createAnnouncement.fields_lbl.endAtDescription',
              })}
              data-test-id="EndAtRow"
            >
              <Controller
                control={control}
                name="end_at"
                rules={{
                  validate: (value: Moment | null) => {
                    if (value == null) {
                      return true;
                    }
                    const scheduledAt = watch('scheduled_at');
                    return (
                      value.isSameOrAfter(scheduledAt.clone().add(30, 'minute')) ||
                      intl.formatMessage({
                        id: 'chat.announcements.createAnnouncement.fields_lbl.endAt.error.tooCloseToScheduledAt',
                      })
                    );
                  },
                }}
                onFocus={() => {
                  endAtRef.current?.focus();
                }}
                render={({ name, onChange }) => {
                  return (
                    <EndAtDateTimePicker
                      ref={endAtRef}
                      onChange={(value) => {
                        onChange(value);
                        trigger(name);
                      }}
                      currentScheduledAtRef={latestScheduledAt}
                      defaultValue={defaultValues.end_at}
                      timezone={timezone}
                      error={errors.end_at?.message}
                    />
                  );
                }}
              />
            </SettingsGridCard>
          </>
        )}
      </SettingsGridGroup>

      <GroupTitle>
        {intl.formatMessage({ id: 'chat.announcements.createAnnouncement.sectionTitle.notifications' })}
      </GroupTitle>
      <SettingsGridGroup>
        <SettingsGridCard
          title={intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields_lbl.enablePush' })}
          description={intl.formatMessage({
            id: 'chat.announcements.createAnnouncement.fields_lbl.enablePush.description',
          })}
          css={`
            padding: 12px 0;
            line-height: 0; // remove vertical margin above the toggle
          `}
        >
          <Controller
            control={control}
            name="enable_push"
            render={({ onChange, onBlur, value, name, ref }) => {
              return <Toggle ref={ref} name={name} checked={value} onChange={onChange} onBlur={onBlur} />;
            }}
          />
        </SettingsGridCard>
      </SettingsGridGroup>

      <SettingsCardFooter isVisible={true} theme="transparent">
        <Button
          type="button"
          key="cancel"
          buttonType="tertiary"
          onClick={onCancelButtonClick}
          data-test-id="CancelButton"
        >
          {intl.formatMessage({ id: 'chat.announcements.createAnnouncement_button.cancel' })}
        </Button>
        <Button
          type="submit"
          key="save"
          buttonType="primary"
          isLoading={submitStatus === 'pending'}
          disabled={submitStatus === 'pending'}
          data-test-id="SubmitButton"
        >
          {intl.formatMessage({
            id: isEditing
              ? 'chat.announcements.editAnnouncement.btn.save'
              : 'chat.announcements.createAnnouncement_button.create',
          })}
        </Button>
      </SettingsCardFooter>
    </form>
  );
};
