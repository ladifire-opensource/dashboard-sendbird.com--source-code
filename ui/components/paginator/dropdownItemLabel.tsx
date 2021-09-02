import styled, { css } from 'styled-components';

import { transitionDefault, cssVariables } from 'feather';

const DropdownItemLabelWrapper = styled.div<{ isSelected: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 14px;
  line-height: 16px;
  padding: 8px 20px;
  transition: color 0.2s ${transitionDefault}, background-color 0.2s ${transitionDefault};

  ${(props) =>
    props.isSelected &&
    css`
      color: ${cssVariables('purple-7')};
      background-color: ${cssVariables('purple-2')};
    `}

  &:hover {
    color: ${cssVariables('purple-7')};
    background-color: ${cssVariables('purple-2')};
  }

  svg {
    margin-right: 7.5px;
  }
`;

type DropdownItemLabelProps = {
  isSelected: boolean;
  children: number;
  className?: string;
};

export const DropdownItemLabel = styled(({ isSelected, children, className }: DropdownItemLabelProps) => (
  <DropdownItemLabelWrapper className={className} isSelected={isSelected}>
    <svg viewBox="0 0 10 8.6" width={10} height={8}>
      {isSelected && (
        <path
          d="M 1 4.3 L 4 7.6 L 9 1"
          strokeWidth={2}
          stroke={cssVariables('purple-7')}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
    {children}
  </DropdownItemLabelWrapper>
))``;
