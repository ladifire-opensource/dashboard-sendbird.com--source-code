import { ComponentProps, ReactElement, useContext } from 'react';

import { Popover } from '@ui/components';

import { UserProfilePopupContext } from './UserProfilePopupContextProvider';

type ChildrenProps = { isOpen: boolean; openPopup: () => void; togglePopup: () => void };

type Props = Pick<ComponentProps<typeof Popover>, 'offset' | 'placement' | 'tag'> & {
  popupId: string;
  children: (props: ChildrenProps) => ReactElement;
  popup: ReactElement;
};

const TRANSITION_DURATION = 0;

const UserProfilePopover = ({ popupId, children, offset = '-26, 0', placement = 'bottom', tag, popup }: Props) => {
  const { currentPopupId, openProfilePopup, closeProfilePopup } = useContext(UserProfilePopupContext);
  const isOpen = currentPopupId === popupId;
  const togglePopup = () => {
    if (isOpen) {
      closeProfilePopup();
    } else {
      openProfilePopup(popupId);
    }
  };
  const childrenProps: ChildrenProps = { isOpen, togglePopup, openPopup: () => openProfilePopup(popupId) };

  return (
    <Popover
      canOutsideClickClose={false}
      placement={placement}
      offset={offset}
      tag={tag}
      isOpen={isOpen}
      target={children(childrenProps)}
      content={popup}
      transitionDuration={TRANSITION_DURATION}
    />
  );
};

export default UserProfilePopover;
