import { FC } from 'react';
import { useIntl } from 'react-intl';

import { Button } from 'feather';

import { SettingsGridCard } from '@common/containers/layout/settingsGrid';
import { useAppId } from '@hooks';

export const DeskBotAssignmentRuleLink: FC = () => {
  const intl = useIntl();
  const appId = useAppId();

  return (
    <SettingsGridCard
      title={intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.assignmentRules.title' })}
      description={intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.assignmentRules.desc' })}
    >
      <Button
        buttonType="tertiary"
        icon="open-in-new"
        onClick={() => window.open(`/${appId}/desk/settings/assignment_rules`)}
      >
        {intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.assignmentRules.button' })}
      </Button>
    </SettingsGridCard>
  );
};
