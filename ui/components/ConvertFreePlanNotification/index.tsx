import { FC, CSSProperties } from 'react';
import { useIntl } from 'react-intl';

import { InlineNotification, Link, LinkVariant } from 'feather';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { useShowDialog } from '@hooks';

export const ConvertFreePlanNotification: FC<{ style?: CSSProperties }> = ({ style }) => {
  const intl = useIntl();
  const showDialog = useShowDialog();
  const handleClickLearnMore = () => {
    showDialog({
      dialogTypes: DialogType.ConvertFreePlan,
    });
  };
  return (
    <div style={style}>
      <InlineNotification
        type="info"
        message={intl.formatMessage(
          {
            id: 'common.notification.convertFreePlan',
          },
          {
            a: (text) => (
              <Link
                role="button"
                variant={LinkVariant.Inline}
                onClick={handleClickLearnMore}
                style={{ marginLeft: '8px' }}
              >
                {text}
              </Link>
            ),
          },
        )}
        iconProps={{
          icon: 'gift',
          size: 20,
        }}
      />
    </div>
  );
};
