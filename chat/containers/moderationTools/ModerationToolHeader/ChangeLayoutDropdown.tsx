import { FC, useCallback, useState } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { IconName, Dropdown, Icon, cssVariables, TooltipVariant } from 'feather';

import { onDropdownChangeIgnoreNull } from '@utils';

import { useDropdownButtonTooltip } from './useDropdownButtonTooltip';

type Props = {
  isInformationSidebarHidden: boolean;
  onChange: (isInformationSidebarHidden: boolean) => void;
};

enum Option {
  ShowSidebar = 'show_sidebar',
  HideSidebar = 'hide_sidebar',
}

const icons: Record<Option, IconName> = {
  [Option.HideSidebar]: 'layout-no-division',
  [Option.ShowSidebar]: 'layout-division',
};

const Toggle = styled.div`
  align-items: center;
  border-radius: 4px;
  color: ${cssVariables('neutral-9')};
  display: flex;
  height: 100%;
  padding-left: 6px;
  padding-right: 6px;

  &:hover {
    background-color: ${cssVariables('neutral-1')} !important;
  }

  button[aria-pressed='true'] & {
    background-color: ${cssVariables('neutral-3')} !important;
  }
`;

const DropdownItemContent = styled.div`
  display: flex;
  align-items: center;

  // add spacing between selected item content and check icon
  margin-right: 28px;
`;

export const ChangeLayoutDropdown: FC<Props> = ({ isInformationSidebarHidden, onChange }) => {
  const intl = useIntl();
  const selectedOption = isInformationSidebarHidden ? Option.HideSidebar : Option.ShowSidebar;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getTooltipProps, getButtonProps } = useDropdownButtonTooltip({ isMenuOpen });

  const itemToString = useCallback(
    (item: Option) =>
      ({
        [Option.ShowSidebar]: intl.formatMessage({
          id: 'chat.channelDetail.header.btn.changeLayout.chatWithInformation',
        }),
        [Option.HideSidebar]: intl.formatMessage({
          id: 'chat.channelDetail.header.btn.changeLayout.chatOnly',
        }),
      }[item]),
    [intl],
  );

  const itemToElement = (item: Option) => {
    return (
      <DropdownItemContent>
        <Icon icon={icons[item]} size={20} color="currentColor" css="margin-right: 8px;" />
        {itemToString(item)}
      </DropdownItemContent>
    );
  };

  return (
    <div
      css={`
        ul li[role='option'] {
          padding-right: 16px !important;
        }
      `}
    >
      <Dropdown<Option>
        size="small"
        placement="bottom-end"
        selectedItem={selectedOption}
        items={[Option.ShowSidebar, Option.HideSidebar]}
        itemToString={itemToString}
        itemToElement={itemToElement}
        tooltipProps={{
          ...getTooltipProps(),
          variant: TooltipVariant.Dark,
          content: intl.formatMessage({ id: 'chat.channelDetail.header.btn.changeLayout' }),
          placement: 'bottom-end',
        }}
        onChange={onDropdownChangeIgnoreNull((item) => {
          onChange(item === Option.HideSidebar);
        })}
        css={`
          min-width: 0;
          border: 0 !important;
          padding: 0;
        `}
        toggleRenderer={() => {
          return (
            <Toggle {...getButtonProps()} data-test-id="ToggleSidebarButton">
              <Icon icon={icons[selectedOption]} size={20} color="currentColor" />
              <Icon icon="chevron-down" color="currentColor" size={16} css="margin-left: 4px;" />
            </Toggle>
          );
        }}
        showArrow={false}
        stateReducer={(state, changes) => {
          if (changes.isOpen != null) {
            setIsMenuOpen(changes.isOpen);
          }
          return changes;
        }}
      />
    </div>
  );
};
