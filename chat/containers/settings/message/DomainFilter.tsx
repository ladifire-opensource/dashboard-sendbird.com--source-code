import React, { useEffect, useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import styled from 'styled-components';

import { Grid, GridItem, useForm, useField, cssVariables, InputText } from 'feather';

import { commonActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { SettingsRadioGridDeprecated } from '@common/containers/layout';
import { useSettingsGlobal } from '@core/containers/useSettingsGlobal';
import { Unsaved } from '@hooks';
import { DomainFilterTypeEnum } from '@interfaces/core/ChannelSettingsEnums';
import { UniqueItemList } from '@ui/components';

type Props = {
  isEditable: boolean;
  setUnsaved: Unsaved['setUnsaved'];
  showDialogsRequest: typeof commonActions.showDialogsRequest;
};

const Filters = styled.div``;

const DomainUrlGridItem = styled(GridItem)`
  margin-left: -8px;
`;

const Form = styled.form`
  padding-top: 16px;
  border-top: 1px solid ${cssVariables('neutral-3')};
`;

const DeleteTarget = styled.div`
  margin-top: 8px;
  padding: 6px 16px;
  font-size: 14px;
  line-height: 1.54;
  letter-spacing: -0.3px;
  color: ${cssVariables('neutral-6')};
  word-break: break-word;
  border-radius: 4px;
  background-color: ${cssVariables('neutral-1')};
`;

const types = [
  { labelIntlKey: 'core.settings.application.message.domainFilter.option_none', value: DomainFilterTypeEnum.none },
  { labelIntlKey: 'core.settings.application.message.domainFilter.option_pass', value: DomainFilterTypeEnum.pass },
  {
    labelIntlKey: 'core.settings.application.message.domainFilter.option_block',
    value: DomainFilterTypeEnum.block,
  },
  {
    labelIntlKey: 'core.settings.application.message.domainFilter.option_replace',
    value: DomainFilterTypeEnum.replace,
  },
];

const isUrlValid = (url) => {
  return url
    .trim()
    .match(
      /^((http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*))|((http(s)?:\/\/)?(localhost([-a-zA-Z0-9@:%_+.~#?&//=]*)|127(?:\.[0-9]+){0,2}\.[0-9]+|^(?:0*:)*?:?0*1))$/g,
    );
};

export const DomainFilter: React.FC<Props> = React.memo(({ isEditable, setUnsaved, showDialogsRequest }) => {
  const intl = useIntl();

  const {
    state: {
      status,
      settingsGlobal: { domain_filter: domainFilter },
    },
    updateSettingsGlobal,
  } = useSettingsGlobal();
  const isLoading = status === 'loading';

  const typeForm = useForm({
    onSubmit: ({ domainFilterType }) => {
      updateSettingsGlobal(
        { domain_filter: { type: parseInt(domainFilterType) } },
        { onSuccess: typeForm.onSuccess, showSuccessToast: true },
      );
    },
  });
  const typeField = useField('domainFilterType', typeForm, {
    defaultValue: domainFilter.type.toString() || '',
    isControlled: true,
  });

  const domainForm = useForm({
    onSubmit: ({ domain }) => {
      updateSettingsGlobal(
        { domain_filter: { domains: [domain, ...domainFilter.domains] } },
        {
          onSuccess: () => {
            domainForm.onSuccess();
            domainForm.reset();
          },
          showSuccessToast: true,
        },
      );
    },
  });
  const domainField = useField('domain', domainForm, {
    defaultValue: '',
    validate: (value) => {
      if (value.trim() === '') {
        return intl.formatMessage({ id: 'core.settings.application.message.domainFilter.input.error_required' });
      }

      if (!isUrlValid(value)) {
        return intl.formatMessage({ id: 'core.settings.application.message.domainFilter.input.error_invalid' });
      }

      if (domainFilter?.domains.includes(value)) {
        return intl.formatMessage({ id: 'core.settings.application.message.domainFilter.input.error_duplicate' });
      }
      return '';
    },
  });

  const getDeleteActionTextByType = useCallback(() => {
    switch (domainFilter.type.toString()) {
      case DomainFilterTypeEnum.pass.toString():
        return intl.formatMessage({
          id: 'core.settings.application.message.domainFilter.dialog.deleteActionByType_pass',
        });

      case DomainFilterTypeEnum.block.toString():
        return intl.formatMessage({
          id: 'core.settings.application.message.domainFilter.dialog.deleteActionByType_block',
        });

      default:
        return intl.formatMessage({
          id: 'core.settings.application.message.domainFilter.dialog.deleteActionByType_none',
        });
    }
  }, [domainFilter, intl]);

  const handleDeleteClick = (targetDomain: string) => {
    showDialogsRequest({
      dialogTypes: DialogType.Custom,
      dialogProps: {
        size: 'small',
        title: intl.formatMessage({ id: 'core.settings.application.message.domainFilter.dialog.title_delete' }),
        description: (
          <FormattedMessage
            id="core.settings.application.message.domainFilter.dialog.desc_delete"
            values={{ deleteActionByType: getDeleteActionTextByType() }}
          />
        ),
        body: <DeleteTarget>{targetDomain}</DeleteTarget>,
        positiveButtonProps: {
          text: intl.formatMessage({ id: 'core.settings.application.message.domainFilter.dialog.button.delete' }),
          buttonType: 'danger',
          onClick: () => {
            const filteredDomains = domainFilter.domains.filter((domain) => domain !== targetDomain);
            updateSettingsGlobal({
              domain_filter: {
                domains: filteredDomains,
              },
            });
          },
        },
      },
    });
  };

  useEffect(() => {
    typeField.updateValue(domainFilter.type.toString());
  }, [domainFilter.type]);

  useEffect(() => {
    setUnsaved(typeField.updatable);
  }, [typeField.updatable, setUnsaved]);

  return (
    <SettingsRadioGridDeprecated
      role="group"
      title={intl.formatMessage({ id: 'core.settings.application.message.domainFilter.title' })}
      aria-label={intl.formatMessage({ id: 'core.settings.application.message.domainFilter.title' })}
      description={intl.formatMessage({ id: 'core.settings.application.message.domainFilter.desc' })}
      gap={['0', '32px']}
      gridItemConfig={{
        subject: {
          alignSelf: 'start',
        },
      }}
      field={typeField}
      form={typeForm}
      radioItems={types.map(({ labelIntlKey, value }) => ({
        label: intl.formatMessage({ id: labelIntlKey }),
        value,
      }))}
      isFetching={isLoading}
      extra={
        <Filters>
          <Grid gap={['24px', '32px']}>
            <GridItem colSpan={6}>&nbsp;</GridItem>
            <DomainUrlGridItem colSpan={6}>
              <Form onSubmit={domainForm.onSubmit}>
                <InputText
                  ref={domainField.ref}
                  size="small"
                  placeholder={intl.formatMessage({
                    id: 'core.settings.application.message.domainFilter.input.placeholder',
                  })}
                  error={domainField.error}
                  suffixButtons={[
                    {
                      key: 'domain-submit',
                      label: intl.formatMessage({ id: 'core.settings.application.message.domainFilter.button' }),
                      size: 'small',
                      buttonType: 'tertiary',
                      type: 'submit',
                      disabled: !isEditable,
                    },
                  ]}
                  onChange={domainField.onChange}
                />
              </Form>
              <UniqueItemList
                data-test-id="DomainFilterList"
                color="white"
                disabled={!isEditable}
                items={domainFilter.domains}
                rowActions={[
                  {
                    icon: 'remove-filled',
                    label: intl.formatMessage({ id: 'core.settings.application.message.domainFilter.btn.delete' }),
                    onClick: handleDeleteClick,
                  },
                ]}
                css="margin-top: 4px;"
              />
            </DomainUrlGridItem>
          </Grid>
        </Filters>
      }
    />
  );
});
