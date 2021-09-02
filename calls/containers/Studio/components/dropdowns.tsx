import { FC } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Button, ButtonType, ButtonVariant, Dropdown } from 'feather';

enum AddUserOption {
  AddExistingUser,
  CreateNewUser,
}

enum AddRoomOption {
  AddExistingRoom,
  CreateNewRoom,
}

enum SigninOption {
  Desktop,
  Mobile,
}

const StyledDropdown = styled(Dropdown).attrs({
  placement: 'bottom-start',
  positionFixed: true,
  modifiers: { preventOverflow: { boundariesElement: 'viewport' } },
  showArrow: false,
  selectedItem: null, // we are using Dropdown as a menu
})`
  height: initial;
  background-color: transparent !important;
  border: 0 !important;
  overflow: visible;
  justify-content: center;
`;

export const SigninDropdown: FC<{
  disabled?: boolean;
  onClickDesktop?: () => void;
  onClickMobile?: () => void;
}> = ({ disabled, onClickDesktop, onClickMobile }) => {
  const intl = useIntl();

  return (
    <StyledDropdown
      disabled={disabled}
      items={[SigninOption.Mobile, SigninOption.Desktop]}
      onItemSelected={(item: SigninOption) => {
        if (item === SigninOption.Mobile) onClickMobile?.();
        if (item === SigninOption.Desktop) onClickDesktop?.();
      }}
      itemToElement={(item: SigninOption) =>
        intl.formatMessage({
          id: {
            [SigninOption.Mobile]: 'calls.studio.contacts.user.actions.signin.mobile',
            [SigninOption.Desktop]: 'calls.studio.contacts.user.actions.signin.desktop',
          }[item],
        })
      }
      toggleRenderer={({ isOpen }) => (
        <Button variant="ghost" buttonType="secondary" size="small" disabled={disabled} aria-pressed={isOpen}>
          {intl.formatMessage({ id: 'calls.studio.contacts.user.actions.signin' })}
        </Button>
      )}
    />
  );
};

export const AddUserDropdown: FC<{
  variant?: ButtonVariant;
  buttonType?: ButtonType;
  disabled?: boolean;
  onClickCreate: () => void;
  onClickAddExisting: () => void;
}> = ({ variant, buttonType = 'primary', disabled, onClickCreate, onClickAddExisting }) => {
  const intl = useIntl();

  return (
    <StyledDropdown
      disabled={disabled}
      items={[AddUserOption.AddExistingUser, AddUserOption.CreateNewUser]}
      onItemSelected={(item) => {
        if (item === AddUserOption.CreateNewUser) onClickCreate();
        if (item === AddUserOption.AddExistingUser) onClickAddExisting();
      }}
      itemToElement={(item: AddUserOption) =>
        intl.formatMessage({
          id: {
            [AddUserOption.AddExistingUser]: 'calls.studio.contacts.add.existing',
            [AddUserOption.CreateNewUser]: 'calls.studio.contacts.add.new',
          }[item],
        })
      }
      toggleRenderer={({ isOpen }) => (
        <Button
          disabled={disabled}
          variant={variant}
          buttonType={buttonType}
          icon="plus"
          size="small"
          css="min-width: auto;"
          aria-pressed={isOpen}
        >
          {intl.formatMessage({ id: 'calls.studio.contacts.add' })}
        </Button>
      )}
    />
  );
};

export const AddRoomDropdown: FC<{
  variant?: ButtonVariant;
  buttonType?: ButtonType;
  disabled?: boolean;
  onClickCreate: () => void;
  onClickAddExisting: () => void;
}> = ({ variant = 'ghost', buttonType = 'primary', disabled, onClickCreate, onClickAddExisting }) => {
  const intl = useIntl();

  return (
    <StyledDropdown
      disabled={disabled}
      items={[AddRoomOption.AddExistingRoom, AddRoomOption.CreateNewRoom]}
      onItemSelected={(item) => {
        if (item === AddRoomOption.CreateNewRoom) onClickCreate();
        if (item === AddRoomOption.AddExistingRoom) onClickAddExisting();
      }}
      itemToElement={(item: AddRoomOption) =>
        intl.formatMessage({
          id: {
            [AddRoomOption.AddExistingRoom]: 'calls.studio.new.body.group.add.existing',
            [AddRoomOption.CreateNewRoom]: 'calls.studio.new.body.group.add.new',
          }[item],
        })
      }
      toggleRenderer={({ isOpen }) => (
        <Button
          disabled={disabled}
          variant={variant}
          buttonType={buttonType}
          icon="plus"
          size="small"
          css="min-width: auto;"
          aria-pressed={isOpen}
        >
          {intl.formatMessage({ id: 'calls.studio.new.body.group.add' })}
        </Button>
      )}
    />
  );
};
