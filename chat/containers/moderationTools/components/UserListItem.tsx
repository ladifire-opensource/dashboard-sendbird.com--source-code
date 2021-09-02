import { forwardRef, HTMLAttributes } from 'react';

import styled, { css } from 'styled-components';

import { transitionDefault, Headings, cssVariables } from 'feather';

import { OperatorIcon } from '@chat/components/OperatorIcon';

const MTUser = styled.div`
  transition: background 0.2s ${transitionDefault};
  height: 36px;
  ${Headings['heading-01']};

  &:hover {
    cursor: pointer;
    background: ${cssVariables('neutral-2')};
  }
`;

const MTUserConnection = styled.div<{ $type: 'online' | 'offline' | 'prohibited' }>`
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  position: relative;
  overflow: hidden;

  ${(props) => {
    switch (props.$type) {
      case 'prohibited':
        return css`
          width: 10px;
          height: 10px;
          background: transparent;
          border: 1px solid ${cssVariables('red-5')};
          &:before {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%) rotate(45deg);
            transform-origin: center;
            background: ${cssVariables('red-5')};
            width: 1px;
            height: 100%;
            content: '';
          }
        `;

      case 'online':
        return css`
          background: ${cssVariables('green-5')};
        `;

      default:
        return css`
          background: ${cssVariables('neutral-5')};
        `;
    }
  }}
`;

const MTUserContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 16px;
`;

const MTUserNameText = styled.div`
  flex-grow: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const OperatorTooltip = ({ className }: { className?: string }) => (
  <OperatorIcon
    className={className}
    size={16}
    color={cssVariables('purple-7')}
    css={`
      line-height: 0;
      margin-left: 4px;
    `}
  />
);

type UserListItemProps = {
  connectionIndicatorType: 'online' | 'offline' | 'prohibited';
  isOperator?: boolean;
} & HTMLAttributes<HTMLDivElement>;

const UserListItem = forwardRef<HTMLDivElement, UserListItemProps>(
  ({ connectionIndicatorType, isOperator = false, children, ...props }, ref) => (
    <MTUser ref={ref} {...props}>
      <MTUserContainer>
        <MTUserConnection $type={connectionIndicatorType} />
        <MTUserNameText>{children}</MTUserNameText>
        {isOperator && <OperatorTooltip />}
      </MTUserContainer>
    </MTUser>
  ),
);

export default UserListItem;
