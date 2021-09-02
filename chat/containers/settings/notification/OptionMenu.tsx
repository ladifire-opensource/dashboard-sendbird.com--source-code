import { FC } from 'react';
import { useIntl } from 'react-intl';

import { OverflowMenu } from 'feather';

import { PropsOf } from '@utils';

export const OptionMenu: FC<Pick<PropsOf<typeof OverflowMenu>, 'items'> & { disabled?: boolean }> = ({
  items,
  disabled = false,
}) => {
  const intl = useIntl();

  return (
    <OverflowMenu
      items={items}
      iconButtonProps={{ disabled }}
      stopClickEventPropagation={true}
      popperProps={{
        positionFixed: true,
        modifiers: {
          flip: { boundariesElement: 'window' },
          preventOverflow: { boundariesElement: 'window' },
        },
      }}
      aria-label={intl.formatMessage({ id: 'core.settings.application.notification.actions.option' })}
    />
  );
};
