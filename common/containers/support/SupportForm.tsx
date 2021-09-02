import React, { useCallback, useState, useEffect, useRef, ChangeEventHandler, MouseEventHandler } from 'react';
import { useForm, Controller, RegisterOptions } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import {
  Button,
  InputText,
  InputTextarea,
  InputSelect,
  toast,
  ContextualHelp,
  TooltipTargetIcon,
  Link,
  InputSelectItem,
  IconButton,
  cssVariables,
  Body,
  SpinnerFull,
} from 'feather';
import uniqBy from 'lodash/uniqBy';
import qs from 'qs';

import { submitSupportForm } from '@common/api';
import { APPLICATION_LIST_LIMIT } from '@constants';
import { getErrorMessage } from '@epics';
import { useApplicationSearch, ApplicationSearchFilterParam, useShowDialog } from '@hooks';
import { Dropdown } from '@ui/components';

import { useCurrentChatSubscription } from '../CurrentChatSubscriptionProvider';
import { DialogType } from '../dialogs/DialogType';
import { AppIdSelect } from './AppIdSelect';
import { SupportFormSet, SupportFormAction, CommunityPlanGuide } from './components';
import { useTechnicalIssueSubmissionAvailability } from './useTechnicalIssueSubmissionAvailability';

const AttachmentsFormGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
`;
const AttachmentsLabel = styled.label`
  color: ${cssVariables('neutral-10')};
  font-size: 12px;
  font-weight: 500;
`;

const AttachmentsInput = styled.label`
  display: flex;
  justify-content: flex-end;
  input[type='file'] {
    display: none;
  }
`;

const AttachmentsFiles = styled.ul`
  border-top: 1px solid ${cssVariables('neutral-3')};
  margin-top: 8px;
  padding-top: 18px;
  padding-bottom: 10px;
  list-style: none;
  li {
    display: flex;
    align-items: center;
    & + & {
      margin-top: 4px;
    }
  }
`;

const AttachmentFileName = styled.div`
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-7')};
  max-width: 468px;
  margin-right: 2px;
`;

const AttachmentsHelpText = styled.p`
  margin-top: 8px;
  border-top: 1px solid ${cssVariables('neutral-3')};
  padding-top: 8px;
  display: flex;
  justify-content: flex-end;
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-6')};
`;

type FormField = {
  label: string | React.ReactNode;
  name:
    | 'Product__c'
    | 'Development_Platform__c'
    | 'App_ID__c'
    | 'Subject'
    | 'Description'
    | 'Issue_Type__c'
    | 'Priority'
    | 'Attachments';
  type: 'text' | 'textarea' | 'select' | 'app_id_select' | 'attachments';
  placeholder?: string;
  readOnly?: boolean;
  items?: string[];
  defaultValue?: string;
  validateOptions?: RegisterOptions;
  ref?: React.MutableRefObject<Dropdown | undefined>;
};

type SupportFormData = {
  Product__c: string | null;
  Development_Platform__c: string | null;
  App_ID__c: string;
  Subject: string;
  Description: string;
  Issue_Type__c: string | null;
  Priority: string | null;
  Attachments: File[] | null;
};

const categoryMap = {
  sales_inquiry: 'Sales Inquiry',
  best_practices_and_strategy_questions: 'Best Practices & Strategy Questions',
  technical_issue: 'Technical Issue',
  feedback_and_feature_request: 'Feedback & Feature Request',
  other_issues: 'Other issues',
  subscription_and_billing: 'Subscription & Billing',
  pricing: 'Subscription & Billing',
  service_limit_increase: 'Service Limit Increase',
};
const salesIssueTypes = ['Sales Inquiry', 'Service Limit Increase', 'Subscription & Billing'];
const technicalIssueTypes = ['Best Practices & Strategy Questions', 'Technical Issue', 'Feedback & Feature Request'];
const basePlanRequiredIssueTypes = [...technicalIssueTypes, 'Other issues'];
const issueTypeItems = [...salesIssueTypes, ...basePlanRequiredIssueTypes];
const productItems = ['Chat', 'Calls', 'Desk', 'Dashboard'];
const commonPlatformItems = ['Platform API', 'JavaScript', 'Android', 'iOS'];
const chatOnlyPlatformItems = ['.Net', 'Unity'];
const developmentPlatformItems = [...commonPlatformItems, ...chatOnlyPlatformItems, 'Others'];

const priorityItems = [
  'P3: General Issue',
  'P2: Moderate impact in Production with workarounds',
  'P1: Key functionality impaired in Production: No workarounds',
];

const freeTrialMissingDefaultValues = {
  Product__c: 'Chat',
  Development_Platform__c: 'Platform API',
  Subject: "Error type: Free trial couldn't be activated.",
  Issue_Type__c: 'Technical Issue',
  Priority: 'P3: General Issue',
  Attachments: null,
};

export const SupportForm = React.memo(() => {
  const intl = useIntl();
  const history = useHistory();
  const showDialog = useShowDialog();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const { isFreeTrialMissing, isLoading: isLoadingPlan } = useCurrentChatSubscription();
  const {
    isAvailable: canSubmitTechnicalIssues,
    isLoading: isLoadingSupportPlan,
  } = useTechnicalIssueSubmissionAvailability();
  const { fetchNextResults, items: applications, updateSearchQuery, searchQuery, hasMore } = useApplicationSearch(
    APPLICATION_LIST_LIMIT,
    'app_name',
    ApplicationSearchFilterParam.AppNameOrAppID,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { control, errors, handleSubmit, register, reset, watch, setValue } = useForm<SupportFormData>({
    mode: 'onChange',
    defaultValues: {
      Product__c: null,
      Development_Platform__c: null,
      App_ID__c: '',
      Subject: '',
      Description: '',
      Issue_Type__c: null,
      Priority: null,
      Attachments: null,
    },
  });

  useEffect(() => {
    const query = qs.parse(history.location.search.slice(1));
    const subject = query.subject ?? null;
    const category = Object.prototype.hasOwnProperty.call(query, 'category') ? query.category : '';

    if (!isLoadingSupportPlan) return;

    if (categoryMap[category]) {
      setValue('Issue_Type__c', categoryMap[category], { shouldValidate: true });
    }

    if (subject) {
      setValue('Subject', subject);
    }
  }, [isLoadingSupportPlan, history.location, setValue]);

  useEffect(() => {
    if (isFreeTrialMissing) {
      [
        { name: 'Product__c', value: freeTrialMissingDefaultValues.Product__c },
        { name: 'Development_Platform__c', value: freeTrialMissingDefaultValues.Development_Platform__c },
        { name: 'App_ID__c', value: applications[0]?.app_id ?? '' },
        { name: 'Subject', value: freeTrialMissingDefaultValues.Subject },
        { name: 'Issue_Type__c', value: freeTrialMissingDefaultValues.Issue_Type__c },
        { name: 'Priority', value: freeTrialMissingDefaultValues.Priority },
        { name: 'Attachments', value: null },
      ].forEach(({ name, value }) => setValue(name, value));
    }
  }, [applications, isFreeTrialMissing, setValue]);

  const resetForm = () => {
    if (isFreeTrialMissing) {
      [
        { name: 'Product__c', value: freeTrialMissingDefaultValues.Product__c },
        { name: 'Development_Platform__c', value: freeTrialMissingDefaultValues.Development_Platform__c },
        { name: 'App_ID__c', value: applications[0]?.app_id ?? '' },
        { name: 'Subject', value: freeTrialMissingDefaultValues.Subject },
        { name: 'Issue_Type__c', value: freeTrialMissingDefaultValues.Issue_Type__c },
        { name: 'Priority', value: freeTrialMissingDefaultValues.Priority },
        { name: 'Description', value: '' },
        { name: 'Attachments', value: null },
      ].forEach(({ name, value }) => setValue(name, value));
      return;
    }
    reset();
  };

  const handleChangeSupportPlanClick = () => {
    history.push('/settings/general');
  };

  const productType = watch('Product__c');
  const technicalFields: FormField[] = [
    {
      label: intl.formatMessage({ id: 'common.support.form.label.product' }),
      name: 'Product__c',
      type: 'select',
      placeholder: intl.formatMessage({ id: 'common.support.form.label.productPlaceholder' }),
      items: productItems,
      validateOptions: {
        required: intl.formatMessage({ id: 'common.support.form.error.productRequired' }),
      },
    },
    {
      label: intl.formatMessage({ id: 'common.support.form.label.developmentPlatform' }),
      name: 'Development_Platform__c',
      type: 'select',
      placeholder: intl.formatMessage({ id: 'common.support.form.label.developmentPlatformPlaceholder' }),
      items:
        productType && (productType === 'Calls' || productType === 'Desk')
          ? commonPlatformItems
          : developmentPlatformItems,
      validateOptions: {
        required: intl.formatMessage({ id: 'common.support.form.error.developmentPlatformRequired' }),
      },
    },
    {
      label: intl.formatMessage({ id: 'common.support.form.label.appId' }),
      name: 'App_ID__c',
      type: 'app_id_select',
      placeholder: intl.formatMessage({ id: 'common.support.form.label.appIdPlaceholder' }),
      validateOptions: {
        required: intl.formatMessage({ id: 'common.support.form.error.appIdRequired' }),
      },
    },
  ];

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const payload = new FormData();
      Object.keys(data).forEach((key) => {
        payload.append(key, typeof data[key] === 'object' ? data[key].value : data[key]);
      });

      if (attachments.length > 0) {
        attachments.forEach((attachment) => {
          payload.append('Attachments', attachment);
        });
      }
      await submitSupportForm(payload);
      toast.success({ message: intl.formatMessage({ id: 'common.support.alert.formSubmitted' }) });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.warning({ message: errorMessage });
    } finally {
      setAttachments([]);
    }
    resetForm();
    setIsSubmitting(false);
  };

  const getFieldErrorObject = useCallback(
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

  const getInputSelectItem = (option: string): InputSelectItem => ({ label: option, value: option });

  /**
   * If Free trial is unexpectedly missing, the form fields except "Description" must be read-only (or disabled).
   * Those read-only fields will be set the default values defined in `freeTrialMissingDefaultValues`.
   */
  const disabled = isLoadingPlan || isFreeTrialMissing;

  const renderField: (payload: FormField) => React.ReactNode = ({
    type,
    name,
    label,
    items,
    placeholder = '',
    validateOptions,
  }) => {
    if (type === 'text') {
      return (
        <SupportFormSet key={`${name}_${type}`} data-test-id={label}>
          <InputText
            ref={validateOptions ? register(validateOptions) : register}
            key={`${name}_${type}_field`}
            name={name}
            label={label}
            defaultValue=""
            placeholder={placeholder}
            disabled={isLoadingPlan}
            readOnly={isFreeTrialMissing}
            required={true}
            error={getFieldErrorObject(name)}
          />
        </SupportFormSet>
      );
    }
    if (type === 'app_id_select') {
      const selectedItem = watch(name) as string;
      return (
        <SupportFormSet key={`${name}_${type}`} data-test-id={label}>
          <Controller
            key={`${name}_${type}_field`}
            name={name}
            control={control}
            rules={
              validateOptions || {
                required: true,
              }
            }
            render={({ onChange }) => {
              return (
                <AppIdSelect
                  onChange={onChange}
                  label={label}
                  width="100%"
                  size="medium"
                  disabled={disabled}
                  applications={applications}
                  applicationSearch={{ fetchNextResults, updateSearchQuery, searchQuery, hasMore }}
                  selectedItem={selectedItem}
                  placeholder={placeholder}
                  error={getFieldErrorObject(name)}
                />
              );
            }}
          />
        </SupportFormSet>
      );
    }
    if (type === 'select') {
      const convertedItems = items ? items.map(getInputSelectItem) : [];
      const selectedValue = watch(name) as string;
      const selectedItem = selectedValue
        ? {
            label: selectedValue,
            value: selectedValue,
          }
        : null;
      return (
        <SupportFormSet key={`${name}_${type}`} data-test-id={label}>
          <Controller
            name={name}
            control={control}
            rules={
              validateOptions || {
                required: true,
              }
            }
            required={true}
            render={({ onChange, onBlur, name, value }) => {
              return (
                <InputSelect
                  onChange={(item) => onChange(item?.value)}
                  value={value}
                  onBlur={onBlur}
                  name={name}
                  key={`${name}_${type}_field`}
                  label={label}
                  items={convertedItems}
                  width="100%"
                  size="medium"
                  selectedItem={selectedItem}
                  placeholder={placeholder}
                  disabled={disabled}
                  error={getFieldErrorObject(name)}
                />
              );
            }}
          />
        </SupportFormSet>
      );
    }
    return null;
  };

  const issueType = watch('Issue_Type__c');
  const shouldOnlyShowCommunityLink =
    !isFreeTrialMissing && issueType && basePlanRequiredIssueTypes.includes(issueType) && !canSubmitTechnicalIssues;

  // Sales issue types don't require a priority.
  const showPriorityField = issueType && !salesIssueTypes.includes(issueType);

  const handleGoToCommunityClick = () => {
    window.open(
      `https://community.sendbird.com${issueType === 'Feedback & Feature Request' ? '/c/feature-requests' : ''}`,
    );
  };
  const handleAddFilesClick = () => {
    fileInputRef.current?.click();
  };
  const handleAttachmentsChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { files } = event.target;
    if (files) {
      if (files.length > 10) {
        showDialog({
          dialogTypes: DialogType.Custom,
          dialogProps: {
            size: 'small',
            title: intl.formatMessage({ id: 'common.support.attachments.dialog.title' }),
            description: intl.formatMessage({ id: 'common.support.attachments.dialog.description.length' }),
            isNegativeButtonHidden: true,
            positiveButtonProps: {
              text: intl.formatMessage({ id: 'common.support.attachments.dialog.ok' }),
              onClick: () => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                  fileInputRef.current.click();
                }
              },
            },
          },
        });
        return;
      }
      const isSizeExceed = Array.from(files).some((file) => {
        return file.size >= 26214400; // 25MB
      });
      if (isSizeExceed) {
        showDialog({
          dialogTypes: DialogType.Custom,
          dialogProps: {
            size: 'small',
            title: intl.formatMessage({ id: 'common.support.attachments.dialog.title' }),
            description: intl.formatMessage({ id: 'common.support.attachments.dialog.description.size' }),
            isNegativeButtonHidden: true,
            positiveButtonProps: {
              text: intl.formatMessage({ id: 'common.support.attachments.dialog.ok' }),
              onClick: () => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                  fileInputRef.current.click();
                }
              },
            },
          },
        });
        return;
      }
      const updatedAttachments = uniqBy([...attachments, ...Array.from(files)], 'name');
      setAttachments(updatedAttachments);
    }
  };
  const handleRemoveFile: (attachment: File) => MouseEventHandler<HTMLButtonElement> = (attachment) => (event) => {
    event.preventDefault();
    setAttachments(attachments.filter(({ name }) => name !== attachment.name));
  };
  return (
    <div>
      {isLoadingSupportPlan && <SpinnerFull />}
      <form
        onSubmit={handleSubmit(onSubmit)}
        data-test-id="SupportForm"
        style={{ display: isLoadingSupportPlan ? 'none' : undefined }}
      >
        {/* Issue type field */}
        {renderField({
          label: intl.formatMessage({ id: 'common.support.form.label.issueType' }),
          name: 'Issue_Type__c',
          type: 'select',
          placeholder: intl.formatMessage({ id: 'common.support.form.label.issueTypePlaceholder' }),
          items: issueTypeItems,
          validateOptions: { required: intl.formatMessage({ id: 'common.support.form.error.issueTypeRequired' }) },
        })}

        {shouldOnlyShowCommunityLink ? (
          <>
            <CommunityPlanGuide>
              <p>{intl.formatMessage({ id: 'common.support.communityPlanGuide.desc' })}</p>
              <Link
                onClick={handleChangeSupportPlanClick}
                iconProps={{
                  icon: 'chevron-right',
                  size: 16,
                }}
              >
                {intl.formatMessage({ id: 'common.support.communityPlanGuide.link' })}
              </Link>
            </CommunityPlanGuide>
            <Button type="button" buttonType="primary" onClick={handleGoToCommunityClick} icon="open-in-new">
              {intl.formatMessage({ id: 'common.support.communityBanner_btn.cta' })}
            </Button>
          </>
        ) : (
          <>
            {/* Conditional render of fields for technical issues */}
            {technicalIssueTypes.includes(issueType || '') && technicalFields.map(renderField)}

            {/* Common fields */}
            <SupportFormSet key="subject_formSet">
              <InputText
                ref={register}
                key="subject_field"
                name="Subject"
                label={intl.formatMessage({ id: 'common.support.form.label.subject' })}
                placeholder={intl.formatMessage({ id: 'common.support.form.label.subjectPlaceholder' })}
                disabled={isLoadingPlan}
                readOnly={isFreeTrialMissing}
                required={true}
                error={getFieldErrorObject(name)}
              />
            </SupportFormSet>
            <SupportFormSet key="description_formSet">
              <InputTextarea
                ref={register}
                key="description_field"
                name="Description"
                label={
                  <>
                    {intl.formatMessage({ id: 'common.support.form.label.description' })}
                    <ContextualHelp
                      content={
                        <div css="white-space: pre-line;">
                          {intl.formatMessage(
                            { id: 'common.support.form.label.descriptionTooltipContent' },
                            { b: (text) => <strong>{text}</strong> },
                          )}
                        </div>
                      }
                      tooltipContentStyle={css`
                        width: 400px;
                        font-weight: 400;
                        strong {
                          font-weight: 600;
                        }
                      `}
                    >
                      <TooltipTargetIcon icon="info" />
                    </ContextualHelp>
                  </>
                }
                placeholder={intl.formatMessage({ id: 'common.support.form.label.descriptionPlaceholder' })}
                required={true}
                error={getFieldErrorObject(name)}
                styles={css`
                  line-height: 20px;
                  min-height: 108px;
                `}
              />
            </SupportFormSet>
            {technicalIssueTypes.includes(issueType || '') && (
              <SupportFormSet key="attachments_formSet" style={{ marginTop: '8px' }}>
                <AttachmentsFormGroup>
                  <AttachmentsLabel>
                    {intl.formatMessage({ id: 'common.support.form.label.attachments' })}
                  </AttachmentsLabel>
                  <AttachmentsInput>
                    <Button type="button" buttonType="tertiary" size="small" onClick={handleAddFilesClick}>
                      {intl.formatMessage({ id: 'common.support.form.button.addFiles' })}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple={true}
                      onChange={handleAttachmentsChange}
                      data-test-id="AttachmentsInput"
                    />
                  </AttachmentsInput>
                </AttachmentsFormGroup>
                {attachments.length > 0 && (
                  <AttachmentsFiles>
                    {attachments.map((attachment) => {
                      const { name } = attachment;
                      return (
                        <li key={`attachment_${name}`}>
                          <AttachmentFileName>{name}</AttachmentFileName>
                          <IconButton
                            buttonType="tertiary"
                            icon="remove-filled"
                            size="xsmall"
                            onClick={handleRemoveFile(attachment)}
                          />
                        </li>
                      );
                    })}
                  </AttachmentsFiles>
                )}
                <AttachmentsHelpText>
                  {intl.formatMessage({ id: 'common.support.form.helpText.attachments' })}
                </AttachmentsHelpText>
              </SupportFormSet>
            )}
            {showPriorityField &&
              renderField({
                label: intl.formatMessage({ id: 'common.support.form.label.priorityLevel' }),
                name: 'Priority',
                placeholder: intl.formatMessage({ id: 'common.support.form.label.priorityLevelPlaceholder' }),
                type: 'select',
                items: priorityItems,
                validateOptions: {
                  required: intl.formatMessage({ id: 'common.support.form.error.priorityLevelRequired' }),
                },
              })}
            <SupportFormAction>
              <Button
                buttonType="primary"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                styles="width: 100%;"
                type="submit"
                data-test-id="SubmitButton"
              >
                {intl.formatMessage({ id: 'common.support_btn.submit' })}
              </Button>
            </SupportFormAction>
          </>
        )}
      </form>
    </div>
  );
});
