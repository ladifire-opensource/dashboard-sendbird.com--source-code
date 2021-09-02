import React from 'react';
import { useIntl } from 'react-intl';

import { coreActions } from '@actions';
import { SettingsGridCard } from '@common/containers/layout';

import { UniqueItemListForm } from './UniqueItemListForm';

type Props = {
  application: Application;
  isAddingCredentialsFilter: SettingsState['isAddingCredentialsFilter'];
  isEditable: boolean;
  addCredentialsFilterRequest: typeof coreActions.addCredentialsFilterRequest;
  removeCredentialsFilterRequest: typeof coreActions.removeCredentialsFilterRequest;
};

const isUrlValid = (value: string) => {
  // eslint-disable-next-line
  const regex = /((http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))|((http(s)?:\/\/)?(localhost([-a-zA-Z0-9@:%_\+.~#?&//=]*)|127(?:\.[0-9]+){0,2}\.[0-9]+|^(?:0*\:)*?:?0*1))/g;
  return value.match(regex) != null;
};

export const AllowedDomains: React.FC<Props> = React.memo(
  ({
    application,
    isAddingCredentialsFilter,
    isEditable,
    addCredentialsFilterRequest,
    removeCredentialsFilterRequest,
  }) => {
    const intl = useIntl();
    const { credentials_list: credentialsList = [] } = application;
    return (
      <SettingsGridCard
        title={intl.formatMessage({ id: 'core.settings.application.security.allowDomains.label' })}
        titleColumns={6}
        gap={['0', '32px']}
        description={intl.formatMessage({ id: 'core.settings.application.security.allowDomains.desc' })}
        gridItemConfig={{ subject: { alignSelf: 'start' } }}
      >
        <UniqueItemListForm
          items={credentialsList.map((item) => item.url)}
          inputPlaceholder={intl.formatMessage({
            id: 'core.settings.application.security.allowDomains.placeholder',
          })}
          addButtonLabel={intl.formatMessage({ id: 'core.settings.application.security.allowDomains_btn.add' })}
          addButtonIsLoading={isAddingCredentialsFilter}
          disabled={!isEditable}
          onItemAdd={(item, onSuccess) => {
            addCredentialsFilterRequest({
              allowedDomain: item,
              onSuccess,
            });
          }}
          onItemDelete={(value) => {
            const target = credentialsList.find((item) => item.url === value);
            if (target) {
              removeCredentialsFilterRequest(target.id);
            }
          }}
          validate={{
            isUrlValid: (value) => {
              return (
                isUrlValid(value) ||
                intl.formatMessage({ id: 'core.settings.application.security.allowDomains.error.invalid' })
              );
            },
          }}
        />
      </SettingsGridCard>
    );
  },
);
