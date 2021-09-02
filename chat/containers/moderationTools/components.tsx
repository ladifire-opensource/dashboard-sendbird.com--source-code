import { memo, ReactNode, FC } from 'react';

import styled, { css } from 'styled-components';

import { cssVariables, transitionDefault, Headings, Icon } from 'feather';

export const MT = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const MTBody = styled.div`
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: row-reverse;
  position: relative;
`;

export const MTChat = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 2;
  flex-shrink: 0;
  flex-basis: 0%;
  overflow: hidden;
  position: relative;
  background: white;
`;

export const MTUsers = styled.ul`
  padding: 16px 0;
  list-style-type: none;
`;

export const MTInfoSidebar = styled.aside.attrs({ 'data-test-id': 'InformationSidebar' })`
  background: white;
  border-left: 1px solid ${cssVariables('neutral-3')};
  padding: 0;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 300px;
  max-width: 300px;
  min-width: 300px;
  position: relative;
  overflow: hidden;
`;

export const MTInfoSection = styled.div<{ $isActive: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: white;
  transition: all 0.2s ${transitionDefault};
  ${({ $isActive }) =>
    !$isActive &&
    css`
      transform: translateX(300px);
    `}
`;

export const StyledMTInfoSectionToggle = styled.button`
  display: flex;
  position: relative;
  align-items: center;
  transition: background 0.2s ${transitionDefault};
  border: 0;
  border-bottom: 1px solid ${cssVariables('neutral-3')};
  background: transparent;
  padding: 0 16px;
  width: 100%;
  height: 48px;
  text-align: left;
  outline: 0;

  &:focus-visible {
    box-shadow: 0 0 0 2px ${cssVariables('purple-7')};
  }

  &:hover {
    cursor: pointer;
    background: ${cssVariables('neutral-1')};
  }
`;

export const MTInfoSectionToggleText = styled.div`
  flex: 1;
  ${Headings['heading-01']};
  color: ${cssVariables('neutral-10')};
`;

interface MTInfoSectionToggleProps {
  label: string;
  badge?: ReactNode;
  onClick: (e) => void;
}

export const MTInfoSectionToggle: FC<MTInfoSectionToggleProps> = memo(({ label, badge, onClick }) => {
  return (
    <StyledMTInfoSectionToggle onClick={onClick}>
      <MTInfoSectionToggleText>{label}</MTInfoSectionToggleText>
      {badge && (
        <div
          css={`
            margin-left: 12px;
            margin-right: 8px;
          `}
        >
          {badge}
        </div>
      )}
      <Icon icon="chevron-right" size={16} color={cssVariables('neutral-9')} />
    </StyledMTInfoSectionToggle>
  );
});

export const MTInfoContent = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow-x: hidden;
  overflow-y: auto;
`;
