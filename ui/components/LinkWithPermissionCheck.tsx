import { FC } from 'react';
import { useIntl } from 'react-intl';

import { Link, LinkProps, ContextualHelp } from 'feather';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { useAuthorization, useShowDialog } from '@hooks';

type Props = LinkProps & {
  permissions: Parameters<ReturnType<typeof useAuthorization>['isPermitted']>[0];
  /**
   * If the link is within a tooltip, use `dialog` alertType since showing a tooltip over a tooltip is not recommended.
   */
  alertType?: 'tooltip' | 'dialog';
};

export const LinkWithPermissionCheck: FC<Props> = ({ permissions, alertType = 'tooltip', ...linkProps }) => {
  const intl = useIntl();
  const { isPermitted } = useAuthorization();
  const showPermissionDeniedDialog = useShowDialog({
    dialogTypes: DialogType.Custom,
    dialogProps: {
      size: 'small',
      title: intl.formatMessage({ id: 'ui.linkWithPermissionCheck.dialog.title' }),
      description: intl.formatMessage({ id: 'ui.linkWithPermissionCheck.dialog.body' }),
      positiveButtonProps: { text: intl.formatMessage({ id: 'ui.linkWithPermissionCheck.dialog.btn.confirm' }) },
      isNegativeButtonHidden: true,
    },
  });

  const isAllowedToNavigate = isPermitted(permissions);
  if (isAllowedToNavigate) {
    return <Link {...linkProps} />;
  }
  if (alertType === 'tooltip') {
    return (
      <ContextualHelp
        css="display: inline-block;"
        content={intl.formatMessage({ id: 'ui.linkWithPermissionCheck.tooltip' })}
        portalId="portal_tooltip"
        placement="bottom"
        tooltipContentStyle="max-width: 256px;"
      >
        <Link {...linkProps} disabled={true} />
      </ContextualHelp>
    );
  }
  return (
    <Link
      {...linkProps}
      onClick={(event) => {
        event.preventDefault();
        showPermissionDeniedDialog();
      }}
    />
  );
};
