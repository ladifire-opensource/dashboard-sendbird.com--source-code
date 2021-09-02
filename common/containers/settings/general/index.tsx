import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';

import { useField, useForm } from 'feather';

import { commonActions } from '@actions';
import { SettingsGridGroup } from '@common/containers/layout';
import { OrganizationStatus } from '@constants';
import { Unsaved, useAuthorization } from '@hooks';
import { useShowConvertFreeNotification } from '@hooks/useShowConvertFreeNotification';
import { ConvertFreePlanNotification } from '@ui/components/ConvertFreePlanNotification';

import { SettingsHeader } from '../../layout/settingsLayout';
import { SettingsTextInputCard } from '../../layout/settingsLayout/settingsTextInputCard';
import { APIKey } from './APIKey';
import { CallsCredits } from './CallsCredits';
import { SubscriptionPlan } from './SubscriptionPlan';
import { SupportPlan } from './SupportPlan';

const mapStateToProps = (state: RootState) => ({
  organization: state.organizations.current,
  updateOrganizationName: state.organizations.updateOrganizationName,
});

const mapDispatchToProps = {
  updateOrganizationNameRequest: commonActions.updateOrganizationNameRequest,
  showDialogsRequest: commonActions.showDialogsRequest,
};

type Props = { setUnsaved: Unsaved['setUnsaved'] } & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const GeneralSettingConnectable: React.FC<Props> = ({
  organization,
  updateOrganizationName,
  updateOrganizationNameRequest,
  showDialogsRequest,
  setUnsaved,
}) => {
  const intl = useIntl();
  const { isPermitted, isSelfService } = useAuthorization();
  const showConvertFreePlanNotification = useShowConvertFreeNotification();

  const form = useForm({
    onSubmit: ({ name }) => updateOrganizationNameRequest({ name, onSuccess: form.onSuccess }),
  });
  const field = useField<string>('name', form, {
    defaultValue: organization.name,
    validate: (value) => (value.trim() ? '' : intl.formatMessage({ id: 'error.organizationNameIsRequired' })),
  });

  useEffect(() => {
    field.setServerError(updateOrganizationName.error || '');
  }, [field, updateOrganizationName.error]);

  useEffect(() => {
    setUnsaved(field.updatable);
  }, [field.updatable, setUnsaved]);

  return (
    <>
      <SettingsHeader title="General" />
      {showConvertFreePlanNotification && <ConvertFreePlanNotification style={{ marginBottom: '16px' }} />}
      {isSelfService && (
        <>
          <SubscriptionPlan />
          <CallsCredits />
          <SupportPlan />
        </>
      )}
      <SettingsGridGroup>
        <SettingsTextInputCard
          title={intl.formatMessage({ id: 'label.organizationName' })}
          form={form}
          field={field}
          isFetching={updateOrganizationName.isFetching}
          readOnly={!isPermitted(['organization.general.all'])}
        />
      </SettingsGridGroup>
      {/**
       * We are not granting permission to view Organization API keys to those without `organization.general.all`
       * because they are powerful enough to delete all applications in the organization. Though it might look like
       * an unintended implementation to not allow the users with `organization.general.view` permission to access this
       * section, this is intentional.
       */}
      {isPermitted(['organization.general.all']) && organization.status === OrganizationStatus.Active && (
        <APIKey organization={organization} showDialogsRequest={showDialogsRequest} />
      )}
    </>
  );
};

export const GeneralSetting = connect(mapStateToProps, mapDispatchToProps)(GeneralSettingConnectable);
