import styled, { css } from 'styled-components';

import { Icon, cssVariables, transitionDefault } from 'feather';

import { Dropdown } from '../dropdown';
import { DropdownItemLabel } from './dropdownItemLabel';

const TargetWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: nowrap;
  padding: 4px 8px;
  color: ${cssVariables('neutral-6')};
  font-size: 14px;
  line-height: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ${transitionDefault}, fill 0.2s ${transitionDefault};
  fill: ${cssVariables('neutral-6')};

  span {
    min-width: 26px;
    margin-right: 4px;
  }

  svg {
    transition: fill 0.2s ${transitionDefault};
  }

  &:hover {
    color: ${cssVariables('purple-7')};

    svg {
      fill: ${cssVariables('purple-7')};
    }
  }
`;

type Props = {
  value: number;
  options: ReadonlyArray<number>;
  onChange: (value: number) => void;
  className?: string;
};

export const PageSizeDropdown = styled(({ value, options, onChange, className }: Props) => {
  const target = (
    <TargetWrapper className={className} data-test-id="PageSizeValue">
      <span>{value}</span>
      <Icon icon="input-arrow-down" size={20} />
    </TargetWrapper>
  );
  return (
    <Dropdown
      placement="bottom-end"
      offset="0, -32"
      target={target}
      items={options.map((option) => ({
        label: <DropdownItemLabel isSelected={option === value}>{option}</DropdownItemLabel>,
        value: option,
        onClick: () => onChange(option),
      }))}
      styles={{
        DropdownMenu: css`
          width: 100px;
          min-width: initial;
          padding: 12px 0;
        `,
        DropdownItem: css`
          padding: 0;

          > * {
            width: 100%;
          }
        `,
      }}
    />
  );
})``;
