import { FC } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Icon, cssVariables, Subtitles } from 'feather';

import { FREE_VOUCHER_CREDITS } from '@constants';
import { DialogFormAction, ConfirmButton, Dialog } from '@ui/components';

const Check = styled(Icon).attrs({
  icon: 'done',
  size: 16,
  color: cssVariables('purple-7'),
})``;

const ListItem = styled.li`
  display: flex;
  align-items: center;
  ${Subtitles['subtitle-01']};
  color: ${cssVariables('neutral-10')};

  ${Check} {
    margin-right: 8px;
  }
`;

const List = styled.ul`
  list-style: none;

  ${ListItem} + ${ListItem} {
    margin-top: 4px;
  }
`;

const ContentContainer = styled.div`
  margin-top: 8px;

  ${List} {
    margin-top: 8px;
  }
`;

const CallsFreeVoucherDialog: FC<DefaultDialogProps> = ({ onClose }) => {
  const intl = useIntl();
  const FREE_VOUCHER_DURATION = 30;

  const list = [
    intl.formatMessage(
      { id: 'common.settings.callsFreeVoucherDialog.list.credits' },
      { credits: FREE_VOUCHER_CREDITS },
    ),
    intl.formatMessage({ id: 'common.settings.callsFreeVoucherDialog.list.duration' }, { days: FREE_VOUCHER_DURATION }),
  ];

  return (
    <Dialog
      title={intl.formatMessage({ id: 'common.settings.callsFreeVoucherDialog.title' })}
      description={intl.formatMessage({ id: 'common.settings.callsFreeVoucherDialog.description' })}
      onClose={onClose}
      body={
        <ContentContainer data-test-id="CallsFreeVoucher">
          <List>
            {list.map((item) => (
              <ListItem key={item}>
                <Check />
                {item}
              </ListItem>
            ))}
          </List>
          <DialogFormAction>
            <ConfirmButton onClick={onClose}>
              {intl.formatMessage({ id: 'common.settings.callsFreeVoucherDialog.confirm' })}
            </ConfirmButton>
          </DialogFormAction>
        </ContentContainer>
      }
    />
  );
};

export default CallsFreeVoucherDialog;
